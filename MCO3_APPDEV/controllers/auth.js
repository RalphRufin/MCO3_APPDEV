const User = require('../models/user');
const Lab = require('../models/lab');

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
  const { email, password } = req.body;

  User.findOne({ email: email })
      .then(user => {
          if (!user) {
              console.error('Invalid email or password.'); // Log error message
              return res.redirect('/login');
          }

          crypt.compare(password, user.password)
              .then(doMatch => {
                  if (doMatch) {
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


