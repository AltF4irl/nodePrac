const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const { usersInDb } = require('./test_helper')

const User = require('../models/user')

describe.only('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test.only('creation succeeds with a fresh username', async() => {
        const userAtStart = await usersInDb()

        const newUser = {
            username: 'altf4irl',
            name: 'Assil Jaby',
            password: 'verysecurepassword'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await usersInDb()
        assert.strictEqual(usersAtEnd.length, userAtStart.length + 1)

        const usernames = usersAtEnd.map(user => user.username)
        assert(usernames.includes(newUser.username))
    })

    test.only('creation fails with proper status code and message if username is already taken', async() => {
        const usersAtStart = await usersInDb

        const newUser = {
            username: 'root',
            name: 'superUser',
            password: 'extrasecurepassword',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await usersInDb
        assert(result.body.error.includes('expected `usename` to be unique'))
        // assert.strictEqual(result.body.error, 'expected `usename` to be unique')

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)  
    })
})

after(async () => {
    await mongoose.connection.close()
})