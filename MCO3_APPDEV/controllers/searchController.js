const User = require('../models/user');

const mongoose = require('mongoose');


exports.getSearch = (req, res, next) => {
  const { userID } = req.params;
  User.findById(userID)
        .then(users => {
        if (!users) {
            console.error('Invalid email or password.');
            return res.redirect('/labs');
        }
        res.render('search/searchUser', {
            user: users,
            path: '/searchUser',
     pageTitle: 'Search user',
     messages: {},
     searchResults: [] 
        });
    })
    .catch(error => {
        console.error('Error finding user:', error);
        res.redirect('/studentLabs');
    });
  }

exports.postSearch = (req, res, next) => {
  const searchTerm = req.body.searchTerm;

  User.find({ $text: { $search: searchTerm } })
    .then(users => {
      console.log(users);
      res.render('search/searchUser', {
        path: '/searchUser',
        pageTitle: 'Search',
        searchResults: users, 
        searchTerm: searchTerm
      });
    })
    .catch(err => next(err));
};


