const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
    try {
        const { username, name, password } = request.body

        if (!username || !password ) { 
            return response.status(400).json({ error: 'username or password missing' })
        }
        if (username.length < 3 || password.length < 3) {
            return response.status(400).json({ error: 'username and password must be at least 3 characters' })
        }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
    } catch (error) {
        if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
            return response.status(400).json({ error: 'expected `username` to be unique' })
        }
    }
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1, likes: 1 })
  response.json(users)
})

module.exports = usersRouter