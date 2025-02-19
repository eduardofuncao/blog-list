const { test, after, beforeEach } = require('node:test')
const assert = require('assert');
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const initialBlogs = [
    {
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7
    },
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(initialBlogs)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('the correct amount of blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
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

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length + 1)
    assert(response.body.find(blog => blog.title === newBlog.title))
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
    
    
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.find(blog => blog.title === testBlog.title).likes, 0)
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


after(async () => {
    await mongoose.connection.close()
})