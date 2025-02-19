const { test, after, beforeEach } = require('node:test')
const assert = require('assert');
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const supertest = require('supertest')
const app = require('../app')
const helper = require('../utils/test_helper')

const api = supertest(app)


beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('the correct amount of blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('the unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    assert(response.body[0].hasOwnProperty('id'))
    assert(!response.body[0].hasOwnProperty('_id'))
})

test('post request to /api/blogs creates a new blog', async () => {
    const newBlog = {
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 2
    }
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

    const blogsAtEnd = await helper.blogsInDB()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    assert(blogsAtEnd.find(blog => blog.title === newBlog.title))
})

test('likes default to zero if missing from the request body', async () => {
    const testBlog = {
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html'
    }
    await api
        .post('/api/blogs')
        .send(testBlog)
        .expect(201)
    
    const blogsAtEnd = await helper.blogsInDB()
    assert.strictEqual(blogsAtEnd.find(blog => blog.title === testBlog.title).likes, 0)
})

test('fails with status code 400 if title or url is missing', async () => {
    const testBlog = {
        author: 'Fernando Pessoa',
        likes: 55
    }
    await api
        .post('/api/blogs')
        .send(testBlog)
        .expect(400)
})

test('get request of specific blog', async () => {
    const blogsAtStart = await helper.blogsInDB()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
    assert.deepStrictEqual(resultBlog.body, blogToView)
})

test('delete request of specific blog', async () => {
    const blogsAtStart = await helper.blogsInDB()
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

    const blogsAtEnd = await helper.blogsInDB()
    const ids = blogsAtEnd.map(blog => blog.id)
    assert(!ids.includes(blogToDelete.id))
    assert(blogsAtEnd.length == blogsAtStart.length - 1)
})



after(async () => {
    await mongoose.connection.close()
})