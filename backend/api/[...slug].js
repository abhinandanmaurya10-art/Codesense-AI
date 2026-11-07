/**
 * Vercel Node.js serverless entry point for every /api/* route.
 *
 * The cached Mongoose connection in src/config/db.js is reused by warm
 * invocations, so we only pay the connection cost on a cold start.
 */
module.exports = require('../src/vercelHandler');
