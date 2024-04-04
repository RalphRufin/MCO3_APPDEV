const User = require('../models/user');

const mongoose = require('mongoose');

// exports.getLogin = (req, res, next) => {

// };

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
    path: '/signup',                 
    pageTitle: 'Signup',
    });
};
// exports.postLogin = (req, res, next) => {

// };

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  // Very basic check for missing fields (not secure)
  if (!email || !password) {
    return res.redirect('/signup'); // Redirect back to signup on missing fields
  }

  // Simplified user creation (without hashing or cart)
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        return res.redirect('/signup'); // Redirect back to signup on existing email
      }

      const newUser = new User({
        userID: new mongoose.Types.ObjectId(), // Generate a unique ObjectID for userID
        name: name, // Set name to an empty string initially (assuming it's required)
        email: email,
        password: password // Placeholder: Implement secure password storage in production
      });
      return newUser.save();
    })
    .then(result => {
    //   res.redirect('/login');
    })
    .catch(err => {
      console.error(err);
      res.redirect('/signup'); // Redirect back to signup on any error
    });
};


// exports.postLogout = (req, res, next) => {

// };
