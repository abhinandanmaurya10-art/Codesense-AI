const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { signAccessToken, signRefreshToken } = require('./tokenService');

/**
 * Normalize the GitHub profile email and username fields.
 */
function getPrimaryEmail(profile) {
  if (!profile) return null;
  if (Array.isArray(profile.emails) && profile.emails.length > 0) {
    const verified = profile.emails.find((item) => item.verified);
    return (verified || profile.emails[0]).value;
  }
  return profile.email || null;
}

async function findOrCreateGitHubUser(profile) {
  if (!profile || !profile.id) {
    throw ApiError.badRequest('Invalid GitHub profile data');
  }

  const githubId = profile.id.toString();
  const email = getPrimaryEmail(profile) || `${githubId}@users.noreply.github.com`;
  const username = profile.username || profile.displayName || `github-${githubId}`;
  const avatar = profile.photos?.[0]?.value || null;

  let user = await User.findOne({ githubId }).select('+refreshTokens');
  if (!user && email) {
    user = await User.findOne({ email }).select('+refreshTokens');
  }

  if (user) {
    user.githubId = githubId;
    user.username = username;
    user.displayName = profile.displayName || user.displayName;
    user.email = email || user.email;
    user.avatar = avatar || user.avatar;
    user.provider = 'github';
    await user.save();
  } else {
    const passwordHash = await User.hashPassword(crypto.randomBytes(32).toString('hex'));
    user = await User.create({
      githubId,
      username,
      displayName: profile.displayName || username,
      email,
      avatar,
      provider: 'github',
      passwordHash,
      role: 'user',
    });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const tokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
  user.refreshTokens = tokens;
  await user.save();

  return { user: user.toPublic(), accessToken, refreshToken };
}

module.exports = {
  findOrCreateGitHubUser,
};
