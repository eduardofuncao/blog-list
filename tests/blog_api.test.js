const { describe, test, after, beforeEach } = require('node:test')
const assert = require('assert');
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const helper = require('../utils/test_helper');
const { title } = require('process');

const api = supertest(app)



describe('when some blogs are saved initially', () => {
    
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
})

describe('adding a new blog for a validated user', () => {
    let loginResponse = ''
    beforeEach(async () => {
        await User.deleteMany({})
        const createdUser = await api
            .post('/api/users')
            .send({
                username: 'testUser',
                name: 'Test User',
                password: 'testPassword'
            })
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        loginResponse = await api
            .post('/api/login')
            .send({
                username: 'testUser',
                password: 'testPassword'
            })
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
        
    })

    test('succeeds with a valid blog', async () => {
        const newBlog = {
            title: 'React patterns',
            author: 'Michael Chan',
            url: 'https://reactpatterns.com/',
            likes: 7
        }
        const createdBlog = await api
            .post('/api/blogs')
            .send(newBlog)
            .set('authorization', 'Bearer ' + loginResponse.body.token)
            .expect(201)

        const blogsAtEnd = await helper.blogsInDB()
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
        assert(blogsAtEnd.find(blog => blog.id === createdBlog.body.id))
    })

    test('makes likes default to zero if likes missing from the request body', async () => {
        const noLikesBlog = {
            title: 'Type wars',
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html'
        }
        const createdBlog = await api
            .post('/api/blogs')
            .send(noLikesBlog)
            .set('authorization', 'Bearer ' + loginResponse.body.token)
            .expect(201)
        
        const blogsAtEnd = await helper.blogsInDB()
        assert.strictEqual(blogsAtEnd.find(blog => blog.id === createdBlog.body.id).likes, 0)
    })

    test('fails with status code 400 if title or url is missing', async () => {
        const testBlog = {
            author: 'Fernando Pessoa',
            likes: 55
        }
        await api
            .post('/api/blogs')
            .send(testBlog)
            .set('authorization', 'Bearer ' + loginResponse.body.token)
            .expect(400)
    })

    test('fails with status code 401 if token is not provided', async () => {
        const testBlog = {
            title: 'React patterns',
            author: 'Michael Chan',
            url: 'https://reactpatterns.com/',
            likes: 7
        }
        await api
            .post('/api/blogs')
            .send(testBlog)
            .expect(401)
    })
})


describe('viewing a specific note', () => {
    test('succeeds with valid data', async () => {
        const blogsAtStart = await helper.blogsInDB()
        const blogToView = blogsAtStart[0]
    
        const resultBlog = await api
            .get(`/api/blogs/${blogToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
        assert.deepStrictEqual(resultBlog.body, blogToView)
    })

    test('fails with status code 404 if blog doesnt exist', async () => {

        const nonExistingId = await helper.nonExistingId()

        await api
            .get(`/api/blogs/${nonExistingId}`)
            .expect(404)
    })
})

describe('deleting a blog', () => {
    let createdUser = {}
    let loginResponse = {}
    beforeEach(async () => {
        await User.deleteMany({})
        createdUser = await api
            .post('/api/users')
            .send({
                username: 'testUser',
                name: 'Test User',
                password: 'testPassword'
            })
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        loginResponse = await api
            .post('/api/login')
            .send({
                username: 'testUser',
                password: 'testPassword'
            })
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
        createdBlog = await api
            .post('/api/blogs')
            .send({
                title: 'Wooly Mammoth',
                author: 'Edgar Allan Poe',
                url: 'https://en.wikipedia.org/wiki/Wooly_Mammoth',
                likes: 3
            })
            .set('authorization', 'Bearer ' + loginResponse.body.token)
            .expect(201)
    })
    test('succeeds with status code 204 if id is valid', async () => {
        const blogsAtStart = await helper.blogsInDB()

        console.log(loginResponse.body)
        await api
            .delete(`/api/blogs/${createdBlog.body.id}`)
            .set('authorization', 'Bearer ' + loginResponse.body.token)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDB()
        const ids = blogsAtEnd.map(blog => blog.id)
        assert(!ids.includes(createdBlog.body.id))
        assert(blogsAtEnd.length == blogsAtStart.length - 1)
    })
})

describe('updating a blog', () => {
    test('succeeds with valid data', async () => {
        const blogsAtStart = await helper.blogsInDB()
        const blogToUpdate = blogsAtStart[0]

        const updatedBlog = {
            title: 'The art of war',
            author: 'Sun Tzu',
            url: 'https://en.wikipedia.org/wiki/The_Art_of_War',
            likes: 10
        }

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
        const blogsAtEnd = await helper.blogsInDB()

        const updatedBlogInDB = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
        assert(updatedBlogInDB.title === updatedBlog.title)
        assert(updatedBlogInDB.author === updatedBlog.author)
        assert(updatedBlogInDB.url === updatedBlog.url)
        assert(updatedBlogInDB.likes === updatedBlog.likes)
    })

    test('fails with status code 400 if title or url is missing', async () => {
        const blogsAtStart = await helper.blogsInDB()
        const blogToUpdate = blogsAtStart[0]

        const updatedBlog = {
            author: 'Fernando Pessoa',
            likes: 55
        }

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedBlog)
            .expect(400)
    })

    test('with no likes updates the likes to zero', async () => {
        const blogsAtStart = await helper.blogsInDB()
        const blogToUpdate = blogsAtStart[0]

        const updatedBlog = {
            title: 'Ensaio sobre a cegueira',
            author: 'Machado de Assis',
            url: 'https://pt.wikipedia.org/wiki/Ensaio_sobre_a_cegueira'
        }

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
        const blogsAtEnd = await helper.blogsInDB()
        assert(blogsAtEnd.find(blog => blog.id === blogToUpdate.id).likes === 0)
        })
})

after(async () => {
    await mongoose.connection.close()
})