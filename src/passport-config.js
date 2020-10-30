const passport = require('passport') 
const bcrypt = require('bcrypt')
const User = require('../models/user')
const mongoose = require('mongoose')

const LocalStrategy = require('passport-local').Strategy

const customFields = {
    usernameField: 'email'
};

const verifyCallback = async (username, password, done) => {

    const user = await User.findOne({ email: username })

        if (!user) return done(null, false, { message: 'No user with that email' })
      
        try {
          if(await bcrypt.compare(password, user.password)) {
              return done(null, user)
          } else {
              return done(null, false, { message: 'Password incorrect' })
          }
        } catch (e) {
          return done(e)
        }      
}

const strategy  = new LocalStrategy(customFields, verifyCallback);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
  });


//protect all routs when we are not logged in //middleware function
function checkAuthenticated (req, res, next) {
  if (req.isAuthenticated()) { //passport function will return true if user is logged in
      return next()
  }
  res.redirect('/login')
}
//checked user should not see login page via url //middleware function
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
     return res.redirect('/')
  }
  next()
}

module.exports = {
  strategy, 
  checkAuthenticated,
  checkNotAuthenticated
}