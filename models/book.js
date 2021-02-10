const mongoose = require('mongoose')
const Schema = mongoose.Schema


const coverImageBasePath = 'uploads/bookCovers'

const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    // coverIamgeName: {
    //     type: String,
    //     required: true
    // },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    },
    cover: {
        type: Buffer
    }
})

const Book = mongoose.model('Book', bookSchema)

module.exports = Book
// module.exports.coverImageBasePath = coverImageBasePath
//module.exports = coverIamgeBasePath