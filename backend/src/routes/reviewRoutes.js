const express = require('express');
const controller = require('../controllers/reviewController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { reviewLimiter } = require('../middleware/rateLimit');
const { createReviewSchema, listReviewsSchema } = require('../utils/validators');

const router = express.Router();

router.use(requireAuth);

router.post('/', reviewLimiter, validate(createReviewSchema), controller.createReview);
router.get('/', validate(listReviewsSchema, 'query'), controller.listReviews);
router.get('/:id', controller.getReview);
router.delete('/:id', controller.deleteReview);

module.exports = router;
