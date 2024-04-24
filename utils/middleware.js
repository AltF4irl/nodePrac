const {info, error} = require('./logger')

const requestLogger = (req, res, next) => {
    info('Method:', req.method)
    info('Path:', req.path)
    info('Body', req.body)
    info('---')
    next()
}

const errorHandler = (err, req, res, next) => {
    error(err.message)

    if (err.name === 'CastError') {
        return res.status(400).send({error: 'malformatted id'})
    } else if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message })
    } else if  (err.name === 'MongoServerError' && err.message.includes('E11000 duplicate key error')) {
        return res.status(400).json({ error: 'expected `usename` to be unique' })
    }

    next(err)
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler
}