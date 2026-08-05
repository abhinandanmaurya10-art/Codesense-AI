const ApiError = require('../utils/apiError');
const { verifyAccessToken } = require('../services/tokenService');
const User = require('../models/User');

async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : header || req.cookies?.accessToken;
    if (!token) throw ApiError.unauthorized('Missing access token');

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user) throw ApiError.unauthorized('User no longer exists');

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(ApiError.forbidden());
  return next();
};

module.exports = { requireAuth, requireRole };
