const express = require('express')
const expbs = require('express-handlebars')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const path = require('path')
const multer = require('multer')
const sharp = require('sharp')
const { isValidObjectId } = require('mongoose')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')

router.use(methodOverride('_method')) //override POST metod. allow to use DELETE 
router.use(express.json())
router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())

//I do not need an upload folder, I use binary to store in database and I can use data too
const upload = multer({
    // dest: uploadPath,
    limits: {
        fileSize: 1500000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

//All Books Route
    router.get('/', async  (req, res) => {
        //res.send('All Books')
     
        let query = Book.find()
        if (req.query.title != null && req.query.title != '') {
          query = query.regex('title', new RegExp(req.query.title, 'i'))
        }
        if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
            query = query.lte('publishDate', req.query.publishedBefore)
        }
        if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
            query = query.gte('publishDate', req.query.publishedAfter)
        }

    try {
        const books = await query.exec()
//console.log(books)
        const objList = {
            proper: books.map((book)=>{
                return {
                    cover: book.cover ?  book.cover.toString('base64') : null,
                    id: book._id
                }        
            })
        }
        console.log(objList.proper.cover)
      
        const params = {
            books: objList.proper,
            searchOptions: req.query 
        }

        res.render('books/index', {
            books: params,
            searchParams: req.query
        })

    } catch (e) {
        console.log(e)
        res.redirect('/')
    }
})

// New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
  })

//Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
       // console.log(book)

        const bookOne = {
            proper: {
                    id: book._id,
                    title: book.title,
                    author: book.author,
                    publishDate: book.publishDate.toISOString().split('T')[0],
                    pageCount: book.pageCount,
                    cover: book.cover.toString('base64'),
                    description: book.description,
                    createdAt: book.createdAt
                }  
        }
  
       // console.log(bookOne.proper.cover.toString('base64'))
        renderFormPage(res, bookOne.proper, 'edit')
    } catch {
        res.redirect('/')
    }
})

//Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
    //Sharp is async all photos will be png
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

    const book = new Book ({
        title: req.body.title,
        author: req.body.author,
        publishDate: req.body.publishDate,
        pageCount: req.body.pageCount,
        cover: buffer,
        description: req.body.description,
    })

    try {
        const newBook = await book.save()
        res.redirect('books')
    } catch (e) {
        renderFormPage(res, book, 'new', true)
        console.log(e)
    }
})

//Show book route
router.get('/:id', async(req,res) => {
    //Show book
    //to wysylal do show page gdzie sa przyciski
    //delete 
    //edit -> /id/editrou
    //view -> authors page - Book by author
    try {
        const book = await Book.findById(req.params.id)
                                .populate('author')
                                .exec()

        const objList = {
            proper:  {
                    title: book.title,
                    authorName: book.author.name,
                    authorId: book.author.id,
                    publishDate: book.publishDate.toISOString().split('T')[0] ,
                    pageCount: book.pageCount,
                    description: book.description,
                    id: book._id,
                    cover: book.cover.toString('base64')
                }
        }

        const params = {
            book: objList.proper,
        }

        res.render('books/show', params)
    } catch {
        res.redirect('/')
    }
})

//Update Book Route
router.patch('/:id', async (req,res) => {
    let book

    try {
        const id = req.query.params
       book = await Book.findOne(id)
        //book = await Book.findOne({_id: req.query.params})
        book.title = req.body.title
        book.author = req.body.author 
        book.publishDate = req.body.publishDate
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        await book.save()
        res.redirect(`/books/${book.id}`)
        console.log(book)
    
    } catch (e) {
        console.log(e)
        if (book != null) {
            renderFormPage(res, book, 'new', true)   
        } else {
            res.redirect('/')
        }  
    }
})

router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch {
        if (book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove book'
            })
        } else {
            res.redirect('/')
        }
    }
})

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const book = new Book()
    
        const objList = {
            proper: authors.map(author => {
                return {
                    author: author.name,
                    authorId: author._id,
                    publishDate: author.publishDate,
                    pageCount: author.pageCount
                }
            })
        }

        const params = {
            authors: objList.proper,
            book: book,     
        }
       
        if (hasError) params.errorMessage = 'Error Creating Book'
        res.render('books/new', params )

    } catch (e) {
        res.redirect('books')
        console.log(e)
    }
}

async function renderFormPage(res, book, form,  hasError = false) {
    try {
        const authors = await Author.find({})

        const objList = {
            proper: authors.map(author => {
                return {
                    author: author.name,
                    authorId: author._id,
                    publishDate: author.publishDate,
                    pageCount: author.pageCount
                }
            })
        }

        const params = {
            authors: objList.proper,
            book: book
           //!!!!!!!!!!!!!1 book: book.id,           
        }

        if (hasError) {
            if(form === 'edit') {
                params.errorMessage = 'Error Updating Book' 
            } else {
                params.errorMessage = 'Error Creating Book'
            }
        }
        res.render(`books/${form}`, params )

    } catch (e) {
        res.redirect('books')
        console.log(e)
    }
}

module.exports = router
