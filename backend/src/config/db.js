const mongoose = require('mongoose');
const env = require('./env');

mongoose.set('strictQuery', true);

const cached = globalThis.__mongoose_cache__ || (globalThis.__mongoose_cache__ = { conn: null, promise: null });

module.exports = async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
      .then((mongooseInstance) => mongooseInstance.connection)
      .catch((error) => {
        // Do not cache a rejected connection attempt. Render can recover from
        // a transient Atlas/network failure without requiring a process restart.
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  console.log('MongoDB connected');
  return cached.conn;
};
