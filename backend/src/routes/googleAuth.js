const express = require('express');
const googleAuthController = require('../controllers/googleAuthController');

const router = express.Router();

router.get('/', googleAuthController.googleLogin);
router.get('/callback', googleAuthController.googleCallback);

module.exports = router;
