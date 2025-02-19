const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  if (!blog.title || !blog.url) {
    return response.status(400).json({error: 'url or title missing'})
  } 

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

module.exports = blogRouter