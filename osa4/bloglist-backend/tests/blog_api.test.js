const assert = require('node:assert')
const bcrypt = require('bcrypt')
const { test, describe, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('../utils/list_helper')
const { before, set } = require('lodash')

const api = supertest(app)

let token

describe('API tests', () => {
    const initialBlogs = [
    {
        _id: "5a422ba71b54a676234d17fb",
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0,
        __v: 0
    },
    {
        _id: "5a422bc61b54a676234d17fc",
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
        __v: 0
    }
    ]

    beforeEach(async () => {
        await Blog.deleteMany({})
        let blogObject = new Blog(initialBlogs[0])
        await blogObject.save()
        blogObject = new Blog(initialBlogs[1])
        await blogObject.save()

        await User.deleteMany({})
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'tester', name: 'Teppo', passwordHash })
        await user.save()

        const loginResponse = await api
            .post('/api/login')
            .send({ username: 'tester', password: 'sekret' })
        
        token = loginResponse.body.token
    })

    test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, initialBlogs.length)
    })

    test('blogs have field named id instead of _id', async () => {
        const response = await api.get('/api/blogs')
        const blogs = response.body
        blogs.forEach(blog => {
            assert.ok(blog.id)
            assert.deepStrictEqual(blog._id, undefined)
        })
    })

    test('a valid blog can be added', async () => {
        const newBlog = {
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')

        assert.deepStrictEqual(response.body.length, initialBlogs.length + 1)

        const titles = response.body.map(blog => blog.title)
        assert.ok(titles.includes('React patterns'))
    })
    
    test('new blog cannot be added without a token', async () => {
        const newBlog = {
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)

        const response = await api.get('/api/blogs')
        assert.deepStrictEqual(response.body.length, initialBlogs.length)
    })

    test('if likes property is missing, it will default to 0', async () => {
        const newBlog = {
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html"
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const response = await api.get('/api/blogs')
        const addedBlog = response.body.find(blog => blog.title === 'Go To Statement Considered Harmful')
        assert.deepStrictEqual(addedBlog.likes, 0)
    })
        
    test('blog without title is not added', async () => {
        const newBlog = {
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
        }

        const result = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)

        console.log(result.body.error)
        assert.ok(result.body.error.includes('`title` is required'))
        
        const response = await api.get('/api/blogs')
        assert.deepStrictEqual(response.body.length, initialBlogs.length)
    })

    test('blog without url is not added', async () => {
        const newBlog = {
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            likes: 5,
        }

        const result = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)

        console.log(result.body.error)
        assert.ok(result.body.error.includes('`url` is required'))
        
        const response = await api.get('/api/blogs')
        assert.deepStrictEqual(response.body.length, initialBlogs.length)
    })  

    test('a blog can be deleted', async () => {
        const allBlogs = await api.get('/api/blogs')
        const blogToDelete = allBlogs.body[0]
        
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        const blogsWithoutDeleted = await api.get('/api/blogs')
        assert.deepStrictEqual(blogsWithoutDeleted.body.length, initialBlogs.length - 1)
    })

    test('a blog can be modified', async () => {
        const allBlogs = await api.get('/api/blogs')
        const blogToModify = allBlogs.body[0]
        const modifiedBlog = { ...blogToModify, likes: blogToModify.likes + 1 }

        const response = await api
            .put(`/api/blogs/${blogToModify.id}`)
            .send(modifiedBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        assert.deepStrictEqual(response.body.likes, blogToModify.likes + 1)
    })

    describe('when there is initially one user at db', () => {
        beforeEach(async () => {
            await User.deleteMany({})

            const passwordHash = await bcrypt.hash('sekret', 10)
            const user = new User({ username: 'root', name: 'root', passwordHash })

            await user.save()
        })

        test('creation succeeds with a fresh username', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
            }

            await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

            const usernames = usersAtEnd.map(u => u.username)
            assert(usernames.includes(newUser.username))
        })

        test('creation fails with proper statuscode and message if username already taken', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'root',
                name: 'Superuser',
                password: 'salainen',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert(result.body.error.includes('expected `username` to be unique'))

            assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        })

        test('creation fails if username is missing', async () => {
            const newUser = { name: 'New User', password: 'secret' }

            const response = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)

            assert.ok(response.body.error.includes('username or password missing'))
        })

        test('creation fails if password is missing', async () => {
            const newUser = { username: 'Newis', name: 'New User' }

            const response = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)

            assert.ok(response.body.error.includes('username or password missing'))
        })

        test('creation fails if username/password is too short', async () => {
            const newUser = { username: 'ne', name: 'Lyhyt', password: 'se' }

            const response = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)

            assert.ok(response.body.error.includes('username and password must be at least 3 characters'))
        })
    })

    after(async () => {
        await mongoose.connection.close()
    })  
})