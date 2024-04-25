const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = req => {
    const authorization = req.get('authorization')
    console.log('authorization', authorization)
    if (authorization && authorization.startsWith('Bearer ')) {
      return authorization.replace('Bearer ', '')
    }
    return null
  }

notesRouter.get('/', async (req, res) => {
    const notes = await Note
    .find({})
    .populate('user', { username: 1, name: 1 })

    res.json(notes)
})

notesRouter.get('/:id', async (req, res, next) => {
    const note = await Note
    .findById(req.params.id)
    .populate('user', { username: 1, name: 1 })

    if(note) {
        res.json(note)
    } else {
        res.status(404).end()
    }  
    
})

notesRouter.post('/', async (req, res) => {
    const body = req.body

    const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
    console.log("decoded token", decodedToken)
    if(!decodedToken.id) {
        return res.status(401).json({ error: 'invalid token' })
    }
    const user = await User.findById(decodedToken.id)

    if(!body.content) {
        return res.status(400).json({error: 'content missing'})
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
        user: user.id
    })

    
    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    res.status(201).json(savedNote) 
})

notesRouter.delete('/:id', async (req, res) => {
    await Note.findByIdAndDelete(req.params.id)
    res.status(204).end()
})

notesRouter.put('/:id', (req, res) => {
    const note = {
        content: req.body.content,
        important: req.body.important
    }
    Note.findByIdAndUpdate(req.params.id, note, {new: true, runValidators: true, context: 'query'})
    .then(updatedNote => {
        res.json(updatedNote)
    })
    .catch(err => next(err))
})

module.exports = notesRouter