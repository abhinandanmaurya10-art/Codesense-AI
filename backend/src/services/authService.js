const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const env = require('../config/env');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('./tokenService');

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash });
  return issueTokens(user);
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash +refreshTokens');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const valid = await user.comparePassword(password);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  return issueTokens(user);
}

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const tokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
  await User.updateOne({ _id: user._id }, { $set: { refreshTokens: tokens } });
  return { user: user.toPublic(), accessToken, refreshToken };
}

async function refresh(refreshToken) {
  if (!refreshToken) throw ApiError.unauthorized('Missing refresh token');
  const payload = verifyRefreshToken(refreshToken);

  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user || !(user.refreshTokens || []).includes(refreshToken)) {
    throw ApiError.unauthorized('Refresh token is no longer valid');
  }

  // Rotate: drop the used token, issue a fresh pair.
  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  return issueTokens(user);
}

function getGithubAuthUrl(state) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CALLBACK_URL) {
    throw ApiError.internal('GitHub OAuth is not configured');
  }
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.GITHUB_CALLBACK_URL,
    scope: 'read:user user:email',
    allow_signup: 'true',
  });
  if (state) {
    params.set('state', state);
  }
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

async function githubSignIn({ code }) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_CALLBACK_URL) {
    throw ApiError.internal('GitHub OAuth is not configured');
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.GITHUB_CALLBACK_URL,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    throw ApiError.unauthorized('GitHub authentication failed');
  }

  const githubResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: 'application/json',
      'User-Agent': 'CodeSense-AI',
    },
  });
  const githubUser = await githubResponse.json();

  let email = githubUser.email;
  if (!email) {
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
        'User-Agent': 'CodeSense-AI',
      },
    });
    const emails = await emailResponse.json();
    const primary = Array.isArray(emails) && emails.find((item) => item.primary && item.verified);
    email = primary?.email || emails?.[0]?.email;
  }

  if (!email) {
    throw ApiError.unauthorized('Unable to determine GitHub email');
  }

  let user = await User.findOne({ email }).select('+refreshTokens');
  if (!user) {
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const passwordHash = await User.hashPassword(randomPassword);
    user = await User.create({
      name: githubUser.name || githubUser.login || 'GitHub User',
      email,
      passwordHash,
    });
  }

  return issueTokens(user);
}

async function logout(userId, refreshToken) {
  if (!userId) return;
  if (refreshToken) {
    await User.updateOne({ _id: userId }, { $pull: { refreshTokens: refreshToken } });
  } else {
    await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
  }
}

module.exports = { register, login, refresh, logout, getGithubAuthUrl, githubSignIn };
