const express = require('express');

const searchController = require('../controllers/searchController');

const router = express.Router();

router.get('/search', searchController.getSearch);

router.post('/search', searchController.postSearch);

module.exports = router;