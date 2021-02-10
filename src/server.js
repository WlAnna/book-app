if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const expbs = require('express-handlebars')
const path = require('path')
const express = require('express')
const userRouter = require('../routers/user-router')
const indexRouter = require('../routers/index')
const authorRouter = require('../routers/authors')
const bookRouter = require('../routers/books')
const { handlebars } = require('hbs')
require('../db/mongoose')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')


const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(methodOverride('_method'))

//app.use(userRouter)
app.use('/authors', authorRouter)
app.use('/', indexRouter)
app.use('/books', bookRouter)
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

app.engine('handlebars', expbs({
  defaultLayout: 'main', 
  layoutsDir: path.join(__dirname, '../views/mainLayout'),
  partialsDir: path.join(__dirname, '../views/part'),
  helpersPath: path.join(__dirname, '../views/helpers'),


  helpers: {
    select: function(value, options) {
        return options.fn(this)
          .split('\n')
          .map(function(v) {
            var t = 'value="' + value + '"'
            return ! RegExp(t).test(v) ? v : v.replace(t, t + ' selected="selected"')
          })
          .join('\n')
      },
      dynamicLink: function (id, label) {

        var link = `<a href="/authors/${id}" class="btn btn-primary">${label}</a>`;
        //("<a href='" + url + "'>" + text +"</a>");
        return link
      },
      dynamicLinkEdit: function (id, label) {

        var link = `<a href="/authors/${id}/edit" class="btn btn-primary">${label}</a>`;
        //("<a href='" + url + "'>" + text +"</a>");
        return link
      },
}

}))

app.set('view engine', 'handlebars')



const hbs = expbs.create({})

// hbs.Handlebars.registerHelper('dynamicLink', function (id, label) {

//   var link = '<a href="authors/"'+ id + '">"' + label + '</a>';
//   return new Em.Handlebars.SafeString(link);
// });



//Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')

//Set up static directory to serve
app.use(express.static(publicDirectoryPath))

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
