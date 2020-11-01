if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const expbs = require('express-handlebars')
const path = require('path')
const express = require('express')
const userRouter = require('../routers/user-router')
const indexRouter = require('../routers/index')
const authorRouter = require('../routers/authors')
const { handlebars } = require('hbs')
require('../db/mongoose')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT

app.use(userRouter)
app.use('/authors', authorRouter)
app.use('/', indexRouter)
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

app.engine('handlebars', expbs({
  defaultLayout: 'main', 
  layoutsDir: path.join(__dirname, '../views/mainLayout'),
  partialsDir: path.join(__dirname, '../views/part')
}))
app.set('view engine', 'handlebars')

//Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')

//Set up static directory to serve
app.use(express.static(publicDirectoryPath))

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
