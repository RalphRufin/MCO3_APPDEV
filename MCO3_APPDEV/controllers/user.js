const User = require('../models/user');

const mongoose = require('mongoose');

exports.getUser = (req, res, next) => {
    console.log('Fetching user profile'); 
    const userId = req.params.id;
    User.findById(userId)
         .then(user => {
             if (!user) {
             return res.status(404).send('User not found');
             }
             res.render('userProfile/profile', { user: user });
         })
         .catch(err => {
             console.error(err);
             res.status(500).send('Error fetching user');
         });
   };
   