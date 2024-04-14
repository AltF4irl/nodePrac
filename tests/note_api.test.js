const { test, after, beforeEach  } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Note = require('../models/note')

const initialNotes = [
    {
      content: 'CSS is meh',
      important: false,
    },
    {
      content: 'Browser can execute only JavaScript',
      important: true,
    },
]

beforeEach( async () => {
    await Note.deleteMany({})
    let noteObject = new Note(initialNotes[0])
    await noteObject.save()
    noteObject = new Note(initialNotes[1])
    await noteObject.save()
})

const api = supertest(app)

console.log(process.env.NODE_ENV)

test('notes are returned as jason', async () => {
    await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('there are two notes', async () => {
    const response = await api.get('/api/notes')

    assert.strictEqual(response.body.length, initialNotes.length)
})

test('the first note is about CSS being meh', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(e => e.content)
    assert(contents.includes('CSS is meh'))
})

after(async () => {
    await mongoose.connection.close()
})

