const ApiError = require('../utils/apiError');
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let error = err;

  if (err && err.name === 'ValidationError') {
    error = ApiError.badRequest('Validation failed', Object.keys(err.errors || {}));
  } else if (err && err.code === 11000) {
    error = ApiError.conflict('Resource already exists');
  } else if (err && (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')) {
    error = ApiError.unauthorized('Invalid or expired token');
  } else if (!(err instanceof ApiError)) {
    error = ApiError.internal(err?.message || 'Internal server error');
  }

  if (error.statusCode >= 500) {
    console.error('[error]', err);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.statusCode >= 500 && env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message,
    ...(error.details ? { errors: error.details } : {}),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };
