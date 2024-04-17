const { test, after, beforeEach  } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Note = require('../models/note')
const {initialNotes, nonExistingId, notesInDb} = require('./test_helper')

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

test('all notes are returned', async () => {
    const response = await api.get('/api/notes')
    console.log(initialNotes)

     assert.strictEqual(response.body.length, initialNotes.length)
  })

test('there are two notes', async () => {
    const response = await api.get('/api/notes')

    assert.strictEqual(response.body.length, initialNotes.length)
})

test('the first note is about HTML is easy', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(e => e.content)
    assert(contents.includes('HTML is easy'))
})

test('a valid note can be added', async() => {

    const newNote = {
        content: 'async/await simplifies making asyync calls',
        importance: true,
    }

    await api
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const notesAtEnd = await notesInDb()
    console.log("notesAtEnd", notesAtEnd)

    console.log("initialNotes", initialNotes)

    // console.log(notesAtEnd)
    const contents = notesAtEnd.map(note => note.content)

    assert.strictEqual(notesAtEnd.length, initialNotes.length + 1)
    assert(contents.includes('async/await simplifies making asyync calls'))
})

test('note without content will not be added', async () => {
    const newNote = { 
        important: true
    }

    await api
        .post('/api/notes')
        .send(newNote)
        .expect(400)

    const notesAtEnd = await notesInDb()

    assert.strictEqual(notesAtEnd.length, initialNotes.length)
})

test(' a specific note can be viewed', async () => {
    const noteAtStart = await notesInDb()

    const noteToView = noteAtStart[0]

    const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultNote.body, noteToView)
})

test('a note can be deleted', async () => {
    const notesAtStart = await notesInDb()
    const noteToDelete = notesAtStart[0]
  
    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204)
    
    
    const notesAtEnd = await notesInDb()
  
    console.log('notesAtStart', notesAtStart)
    console.log('notesAtEnd', notesAtEnd)

    const contents = notesAtEnd.map(r => r.content)
    assert(!contents.includes(noteToDelete.content))
  
    assert.strictEqual(notesAtEnd.length, initialNotes.length - 1)
})

after(async () => {
    await mongoose.connection.close()
})

