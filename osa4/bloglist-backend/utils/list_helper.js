const _ = require('lodash')
const User = require('../models/user')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs)  => {
  if (blogs.length === 0) {
    return null
  }

  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  return blogs.reduce((fav, blog) => (blog.likes > fav.likes ? blog : fav), blogs[0])
} 

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const [name, count] = _(blogs)
    .countBy('author')
    .toPairs()
    .maxBy(_.last)

  return {author: name, blogs: count}
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const authorLikes = _(blogs)
    .groupBy('author')
    .map((blogs, author) => ({
      author, likes: _.sumBy(blogs, 'likes')
    }))
    .maxBy('likes')

    return authorLikes
  }

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  usersInDb
} 