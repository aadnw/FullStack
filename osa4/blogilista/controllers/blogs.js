const express = require('express')
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog.js')
const userExtractor = require('../utils/middleware').userExtractor

const blogsRouter = express.Router()

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
    const user = request.user
    if (!user) {
        return response.status(401).json({ error: 'token invalid' })
    }

    const blog = new Blog({...request.body, user: user._id})
    const savedBlog = await blog.save()

    user.blogs = (user.blogs || []).concat(savedBlog._id)
    await user.save()
    response.status(201).json(await savedBlog.populate('user', { username: 1, name: 1 }))
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
    const user = request.user
    if (!user) {
        return response.status(401).json({ error: 'token invalid' })
    }

    const blog = await Blog.findById(request.params.id)
    if (!blog) {
        return response.status(404).json({ error: 'blog not found' })
    }

    if (blog.user && blog.user.toString() !== user._id.toString()) {
        return response.status(403).json({ error: 'only the creator can delete this blog' })
    }
    
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const updatedBlog = await Blog.findByIdAndUpdate(
        request.params.id,
        request.body,
        { new: true, runValidators: true, context: 'query' }
    )
    response.json(updatedBlog)
})

module.exports = blogsRouter