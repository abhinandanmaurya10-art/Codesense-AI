const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');

const env = require('./config/env');
const setupPassport = require('./config/passport');
const passport = require('passport');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimit');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

setupPassport();
app.use(passport.initialize());
app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (env.NODE_ENV !== 'production') return cb(null, true);
      const allowedOrigins = env.FRONTEND_URL.split(',').map((o) => o.trim());
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const health = (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  return res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    data: {
      status: databaseReady ? 'ok' : 'degraded',
      database: databaseReady ? 'connected' : 'unavailable',
      uptime: process.uptime(),
    },
  });
};

// Render uses this endpoint for service health checks. Keep the API-prefixed
// variant below for existing clients.
app.get('/', (_req, res) => res.json({
  success: true,
  data: { service: 'CodeSense AI API', health: '/health', api: '/api' },
}));
app.get('/health', health);
app.locals.health = health;
app.use('/api', apiLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
