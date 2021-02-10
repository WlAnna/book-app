const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Book = require('./book')

const authorSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }
})

authorSchema.pre('remove', function(next) {
    Book.find({ author: this.id }, (err, books) => {
      if (err) {
        next(err)
        console.log(err)
      } else if (books.length > 0) {
        next(new Error('This author has books still'))
      } else {
        next()
      }
    })
  })

const Author = mongoose.model('Author', authorSchema)

module.exports = Author