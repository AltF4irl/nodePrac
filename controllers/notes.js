const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (req, res) => {
    const notes = await Note.find({})
    res.json(notes)
})

notesRouter.get('/:id', (req, res, next) => {
    Note.findById(req.params.id).then(note => {
        if(note) {
            res.json(note)
        } else {
            res.status(404).end
        }  
    })
    .catch(err => next(err))
})

notesRouter.post('/', async (req, res, next) => {
    const body = req.body

    if(!body.content) {
        return res.status(400).json({error: 'content missing'})
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    try {
        const savedNote = await note.save()
        res.status(201).json(savedNote)
    } catch(err) {
        next(err)
    }
    
})

// notesRouter.delete('/:id', (req, res, next) => {
//     Note.findByIdAndDelete(req.param.id)
//     .then(result => res.status(204).end())
//     .catch(err => next(err))
// })

notesRouter.delete('/:id', async (req, res, next) => {
    try {
        await Note.findByIdAndDelete(req.param.id)
        res.status(204).end()
    } catch(err) {
        next(err)
    }
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