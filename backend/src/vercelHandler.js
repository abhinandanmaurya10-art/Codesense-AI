const app = require('./app');
const connectDB = require('./config/db');

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
