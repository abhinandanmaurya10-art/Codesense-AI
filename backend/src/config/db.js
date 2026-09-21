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
      .then((mongooseInstance) => mongooseInstance.connection);
  }

  cached.conn = await cached.promise;
  console.log('MongoDB connected');
  return cached.conn;
};
