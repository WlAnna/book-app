if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const express = require('express')
const userRouter = require('../routers/user-router')
require('../db/mongoose')

const app = express()
const port = process.env.PORT

app.use(userRouter)
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: false }))

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
