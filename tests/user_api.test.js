const bcrypt = require('bcrypt')
const { describe, test, after, beforeEach } = require('node:test')
const assert = require('assert');
const mongoose = require('mongoose')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const helper = require('../utils/test_helper');
const { title } = require('process');

const api = supertest(app)

describe("when there is initially one user in db", () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('pass123', 10)
        const user = new User({
            username: 'firstUser',
            passwordHash: passwordHash
        })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () =>{
        const usersAtStart = await helper.usersInDB()
        const newUser = {
            username: 'xGoivo',
            name: 'Eduardo',
            password: 'asdf1234'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDB()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)


        const usernames = usersAtEnd.map(user => user.username)
        assert(usernames.includes(newUser.username))
    })

    test('creation fails with correct statuscode and message if username is taken', async () => {
        const usersAtStart = await helper.usersInDB()

        const newUser = {
            username: usersAtStart[0].username,
            name: 'Carlos',
            password: 'minhaSenhaSegura'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDB()
        assert(result.body.error.includes('expected username to be unique'))
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

})