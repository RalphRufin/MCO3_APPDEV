const express = require('express');
const userController = require('../controllers/user');

const router = express.Router();
router.get('/user/:id', userController.getUser);

router.get('/user/edit/:id', userController.getEditUser);

router.post('/user/edit/:id', userController.editUser);


router.post('/user/delete/:id', userController.deleteUser);

module.exports = router;
