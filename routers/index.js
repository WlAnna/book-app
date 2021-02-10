const express = require('express')
const router = express.Router()
const Book = require('../models/book')

 router.get('/', async (req,res) => {
   let arr
   try {
    books = await Book.find().sort({ createdAt: 'desc' }).limit(3).exec()

       arr = []
        books.forEach((book) => {
        arr.push(book.cover.toString('base64'))
         })

   } catch {
    arr = []
   }
   res.render('index', { books: arr })
 })

//To jest z loginu wyswietla sie index.handlebar
// router.get('/', (req, res) => {
//   res.render('index')
// })

module.exports = router