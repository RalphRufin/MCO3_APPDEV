const User = require('../models/user');

const mongoose = require('mongoose');

const crypt = require('bcryptjs');

 exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',                 
    pageTitle: 'Login',
    messages: {}
    
    });
};

exports.getSignup = (req, res, next) => {

    res.render('auth/signup', {
    path: '/signup',                 
    pageTitle: 'Signup',
    });
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email, password);
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        console.error('Invalid email or password.'); // Log error message
        return res.redirect('/login');
      }
      console.log(user);
      crypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            // Successful login (without sessions)
            // Consider redirecting to a profile page or dashboard
            // return res.render('profile', { // Replace with your desired success page
            //   //user: user // Pass user inf
            // });
            //add PATH REDIRECT HERE RALPH 
            res.redirect('/');
            console.log('Successfully logged in');
          }
          console.error('Invalid email or password.'); // Log error message
          return res.redirect('/login');
        })
        .catch(err => {
          console.error(err);
          return res.redirect('/login');
        });
    })
    .catch(err => console.error(err));
};



exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const confirmPassword = req.body.confirmPassword;

  
  if (!email || !password || !name) {
    return res.redirect('/signup'); 
    console.log ('Missing fields');
  }

  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        return res.redirect('/signup'); 
        console.log ('Email already found');
      }
      return crypt
      .hash(password, 12)
      .then(hashedPassword => {
        const newUser = new User({
          userID: new mongoose.Types.ObjectId(), 
          name: name, 
          email: email,
          password: hashedPassword 
        });
        return newUser.save();
      })
      .then(result => {
      //   res.redirect('/login');
      })
      
    })
    
    .catch(err => {
      console.error(err);
      res.redirect('/signup'); // Redirect back to signup on any error
    });
};


// exports.postLogout = (req, res, next) => {

// };
