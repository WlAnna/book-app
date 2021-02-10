const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const { compareSync } = require('bcrypt')

router.use(methodOverride('_method')) //override POST metod. allow to use DELETE 
router.use(express.json())
router.use(bodyParser.urlencoded({extended:false}))

//All Authors Route
router.get('/', async  (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    
    try {
        const authors = await Author.find(searchOptions)

        const objList = {
            proper:  authors.map((author)=>{
                return {
                    author: author.name,
                    authorId: author._id
                }
            })      
        }
      
        const params = {
            authors: objList.proper,
            searchOptions: req.query 
        }

        res.render('authors/index', params)
    } catch {
        res.redirect('/')
    }
})

//New Authour Route
//If we have get/new and get / id we put new first becasue code is red from to p to buttom so it will read new first 
// to co jest po slash wyglada tak samo wiec przy czytaniu moze sie pomylic
router.get('/new', (req, res) => {
    res.render('authors/new', {
        author: new Author()

    })
})

// Create Author
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })
    try {
       const newAuthor = await author.save();
       //console.log(newAuthor)
        res.redirect(`authors/${newAuthor.id}`)
        //Tu wczesnieh bylo  res.redirect('authors/new', { }) i wyskakiwal blad
        //res.render('authors') 
    } catch (error) {
        res.render('authors/new', {
        author: author,
        errorMessage: 'Error creating Author'})
        console.log(error)
    }
})

router.get('/:id', async (req,res) => {
    //res.send('Show Author' + req.params.id)

    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({ author: author._id}).limit(3).exec()
        //console.log(books)

        const authorOne = {
            proper: {
                name: author.name,
                id: author._id
            }
        }

        let arr = []
        books.forEach((book) => {
        arr.push({
            cover: book.cover.toString('base64'),
            id: book.id
            })
        })
        
        const params = {
            author: authorOne.proper,
        }
        
        res.render('authors/show', { author: params,
        book: arr  })
    } catch (e) {
        console.log(e)
        res.redirect('/')
    }
}) 

router.get('/:id/edit', async (req,res) => {
   // res.send('Edit Author' + req.params.id)
  try {
    const author = await Author.findById(req.params.id)

    const authorOne = {
        proper: {
            name: author.name,
            id: author._id
        }
    }
    const params = {
        author: authorOne.proper
    }

    res.render('authors/edit', { author: params })
  } catch {
    res.redirect('/authors')
  }
})

router.put('/:id', async (req,res) => {
    //res.send('Update Author' + req.params.id)
    //variable defined outside so I can access to it inside catch
    let author
    try {
        //code may fail to get author or save author
        author = await Author.findById(req.params.id)
        console.log(req.body.name)
        author.name = req.body.name
       await author.save();
      // console.log(newAuthor)
        // res.redirect(`authors/${newAuthor.id}`)
        //Tu wczesnieh bylo  res.redirect('authors/new', { }) i wyskakiwal blad
        res.redirect(`/authors/${author.id}`) 
    } catch (error) {
        if (author == null) {
            res.redirect('/')
        } else {
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error updating Author'})
                console.log(error)
        }
    }
}) 

router.delete('/:id', async (req,res) => {
    //res.send('Delete Author' + req.params.id)
    let author
    try {
        //code may fail to get author or save author
        author = await Author.findById(req.params.id)
       await author.remove();
      // console.log(newAuthor)
        // res.redirect(`authors/${newAuthor.id}`)
        //Tu wczesnieh bylo  res.redirect('authors/new', { }) i wyskakiwal blad
        res.redirect('/authors') 
    } catch (error) {
        if (author == null) {
            res.redirect('/')
        } else {
            res.redirect(`/authors/${author.id}`) 
        }
    }
}) 

module.exports = router
