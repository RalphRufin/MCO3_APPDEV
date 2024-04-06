const User = require('../models/user');
const Lab = require('../models/lab');

const mongoose = require('mongoose');
const crypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
   
    User.findOne({ email: email })
         .then(user => {
             if (!user) {
                 console.error('Invalid email or password.'); 
                 return res.redirect('/login');
             }
   
             crypt.compare(password, user.password)
                 .then(doMatch => {
                    if (doMatch) {
                         
                         req.session.isLoggedIn = true;
                         req.session.user = user;
   
                        
                         return req.session.save(err => {
                             if (err) {
                                 console.log(err);
                                 return res.redirect('/login'); // Redirect to login in case of error
                             }
                             // Proceed based on the user's role
                             Lab.find()
                                 .then(labs => {
                                    if (user.role === 'student') {
                                         return res.render('auth/studentlab', {
                                             user: user,
                                             labs: labs,
                                             path: '/studentlab',
                                             pageTitle: 'Studentlab'
                                         });
                                    } else if (user.role === 'technician') {
                                         User.find()
                                             .then(users => {
                                                 return res.render('auth/technicianlab', {
                                                    user: user,
                                                    users: users,
                                                    labs: labs,
                                                    path: '/technicianlab',
                                                    pageTitle: 'Technicianlab'
                                                 });
                                             })
                                             .catch(err => {
                                                 console.log(err);
                                                 res.status(500).send('Error fetching technicians');
                                             });
                                    } else {
                                         return res.redirect('/');
                                    }
                                 })
                                 .catch(err => {
                                    console.log(err);
                                    res.status(500).send('Error fetching labs');
                                 });
                         });
                    } else {
                         console.error('Invalid email or password.');
                         return res.redirect('/login');
                    }
                 })
                 .catch(err => {
                    console.log(err);
                    res.status(500).send('Error comparing passwords');
                 });
         })
         .catch(err => {
             console.error(err);
             return res.redirect('/login');
         });
   };
   

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const role = req.body.role;

  if (!email || !password || !name) {
      return res.redirect('/signup');
      console.log('Missing fields');
  }

  User.findOne({ email: email })
      .then(userDoc => {
          if (userDoc) {
              return res.redirect('/signup');
              console.log('Email already found');
          }
          return crypt
              .hash(password, 12)
              .then(hashedPassword => {
                  const newUser = new User({
                      userID: new mongoose.Types.ObjectId(),
                      name: name,
                      email: email,
                      password: hashedPassword,
                      role: role
                  });
                  return newUser.save()
                      .then(() => {
                          res.redirect('/login');
                      });
              });
      })
      .catch(err => {
          console.error(err);
          res.redirect('/signup');
      });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
      console.log(err);
      res.redirect('/');
    });
  };
  


