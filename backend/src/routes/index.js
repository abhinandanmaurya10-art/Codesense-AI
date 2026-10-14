const express = require('express');
const authRoutes = require('./authRoutes');
const githubAuthRoutes = require('./githubAuth');
const googleAuthRoutes = require('./googleAuth');
const reviewRoutes = require('./reviewRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const { SUPPORTED_LANGUAGES } = require('../utils/validators');

const router = express.Router();

router.get('/health', (req, res) => req.app.locals.health(req, res));
router.get('/languages', (_req, res) => res.json({ success: true, data: SUPPORTED_LANGUAGES }));

router.use('/auth/github', githubAuthRoutes);
router.use('/auth/google', googleAuthRoutes);
router.use('/auth', authRoutes);
router.use('/reviews', reviewRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
