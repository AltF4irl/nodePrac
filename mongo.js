const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://altf4:${password}@fullstackopen.hq5elwu.mongodb.net/testDB?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    content: String,
    importance: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
    content: 'Gyaaaat skibidi toilet',
    importance: false,
})

note.save().then(result => {
    console.log('note saved')
    mongoose.connection.close()
})

// Note.find({importance: true}).then(result => {
//     result.forEach(note => console.log(note))
//     mongoose.connection.close()
// })