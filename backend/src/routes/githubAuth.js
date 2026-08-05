const express = require('express');
const githubAuthController = require('../controllers/githubAuthController');

const router = express.Router();

router.get('/', githubAuthController.githubLogin);
router.get('/callback', githubAuthController.githubCallback);

module.exports = router;
