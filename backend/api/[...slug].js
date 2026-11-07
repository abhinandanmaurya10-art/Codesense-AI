const app = require('../src/app');
const connectDB = require('../src/config/db');

/**
 * Vercel Node.js serverless entry point for every /api/* route.
 *
 * The cached Mongoose connection in src/config/db.js is reused by warm
 * invocations, so we only pay the connection cost on a cold start.
 */
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Database connection failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to connect to the database.',
    });
  }
};
