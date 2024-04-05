const User = require('../models/user');

const mongoose = require('mongoose');

exports.getUser = (req, res, next) => {
    console.log('Fetching user profile'); 
    const userId = req.params.id;
    User.findById(userId)
         .then(user => {
             if (!user) {a
             return res.status(404).send('User not found');
             }
             res.render('userProfile/profile', { user: user });
         })
         .catch(err => {
             console.error(err);
             res.status(500).send('Error fetching user');
         });
   };

   
exports.editUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        console.log('userid',userId);
        const updatedDesc  = req.body.description;
        

        let profileImage = req.file; 
        console.log(profileImage);
        const user = await User.findById(userId);
        const imageUrl = profileImage.path;
        console.log(user);
        if (!user) {
            return res.status(404).send('User not found');
        }

        if (profileImage) {
            user.jpgFilename = imageUrl; 
        }
        console.log('reqbody' ,req.body);
        console.log(updatedDesc);
        if (updatedDesc) {
            user.txtFilename = updatedDesc;
        }

        await user.save();
        console.log('Updated user:', user);
        console.log(user.id);

        res.redirect(`/user/${userId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating user');
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting user');
    }
};

exports.getEditUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('userProfile/userEdit', {
            user: user,
            pageTitle: 'Edit Profile',
            path: '/user/edit/' + userId
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user');
    }
};


