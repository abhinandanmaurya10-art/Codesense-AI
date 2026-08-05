const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { signAccessToken, signRefreshToken } = require('./tokenService');

/**
 * Extract email from Google profile
 */
function getPrimaryEmail(profile) {
  if (!profile) return null;
  if (Array.isArray(profile.emails) && profile.emails.length > 0) {
    const verified = profile.emails.find((item) => item.verified);
    return (verified || profile.emails[0]).value;
  }
  return profile.email || null;
}

/**
 * Find or create a user from Google OAuth profile
 */
async function findOrCreateGoogleUser(profile) {
  if (!profile || !profile.id) {
    throw ApiError.badRequest('Invalid Google profile data');
  }

  const googleId = profile.id.toString();
  const email = getPrimaryEmail(profile) || profile.email;
  if (!email) {
    throw ApiError.badRequest('No email provided by Google');
  }

  const username = profile.displayName || email.split('@')[0];
  const avatar = profile.photos?.[0]?.value || null;

  let user = await User.findOne({ googleId }).select('+refreshTokens');
  if (!user) {
    user = await User.findOne({ email }).select('+refreshTokens');
  }

  if (user) {
    // Update existing user with Google ID
    user.googleId = googleId;
    user.username = username;
    user.displayName = profile.displayName || user.displayName;
    user.email = email;
    user.avatar = avatar || user.avatar;
    user.provider = 'google';
    await user.save();
  } else {
    // Create new user
    const passwordHash = await User.hashPassword(crypto.randomBytes(32).toString('hex'));
    user = await User.create({
      googleId,
      username,
      displayName: profile.displayName || username,
      email,
      avatar,
      provider: 'google',
      passwordHash,
      refreshTokens: [],
    });
  }

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  user.refreshTokens.push(refreshToken);
  await user.save();

  return {
    user,
    accessToken,
    refreshToken,
  };
}

module.exports = {
  findOrCreateGoogleUser,
};
