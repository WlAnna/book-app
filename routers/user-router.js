const express = require('express')
const bcrypt = require('bcrypt')
const methodOverride = require('method-override')
const passport = require('passport')  //authentication library // local veriosn of passport not google
const flash = require('express-flash') //used by passport to flash ie error messages
const session = require('express-session')  // to store and persist user accross pages
require('../db/mongoose')

const router = new express.Router()
router.use(methodOverride('_method')) //override POST metod. allow to use DELETE 
const User = require('../models/user')
const {strategy, checkAuthenticated, checkNotAuthenticated } = require('../src/passport-config')

passport.use(strategy);
router.use(express.urlencoded({ extended: false }))
router.use(flash())
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
router.use(passport.initialize())
router.use(passport.session())


router.get('/', checkAuthenticated, (req, res) => {
    res.render('index.hbs', {name: req.user.name})
})

router.get('/login', checkNotAuthenticated, (req,res) => {
    res.render('login.hbs') 
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
})) 

router.get('/register', checkNotAuthenticated, (req,res) => {
    res.render('register.hbs') 
})

router.post('/register', checkNotAuthenticated, async (req, res) => {
    if ( req.body.password.length < 7) {
       return res.render('register.hbs', {error: 'Password must contain minimum 6 characters'})
     }
    if ( req.body.password.includes('password')) {
        return res.render('register.hbs', {error: 'Password can not contain "password" '})
    }

     let email = req.body.email
    const user = await User.findOne({ email })
    
    if (user) {
        return res.render('register.hbs', {error: 'The email is already used'})
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            })
     
            await user.save()
            
            res.redirect('/login')

    } catch (e) {
        res.redirect('/register')  //can handle only one res in try catch block must use await with save()
    }
}) 

//delete 
router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

module.exports = router