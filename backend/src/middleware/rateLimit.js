const rateLimit = require('express-rate-limit');

const json = (message) => (req, res) =>
  res.status(429).json({ success: false, message });

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: json('Too many attempts. Try again in 15 minutes.'),
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: json('Too many requests. Slow down.'),
});

const reviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: json('Review rate limit reached. Try again shortly.'),
});

module.exports = { authLimiter, apiLimiter, reviewLimiter };
