const User = require('../models/user');

const mongoose = require('mongoose');


exports.getSearch = (req, res, next) => {
  res.render('search/searchUser', {
     path: '/search',
     pageTitle: 'Search',
     messages: {},
     searchResults: [] // Ensure searchResults is always defined
  });
 };
 

exports.postSearch = (req, res, next) => {
  const searchTerm = req.body.searchTerm;

  User.find({ $text: { $search: searchTerm } })
    .then(users => {
      console.log(users);
      res.render('search/searchUser', {
        path: '/search',
        pageTitle: 'Search',
        searchResults: users, 
        searchTerm: searchTerm
      });
    })
    .catch(err => next(err));
};