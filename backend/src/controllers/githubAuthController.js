const crypto = require('crypto');
const passport = require('passport');
const { refreshCookieOptions } = require('../services/tokenService');
const env = require('../config/env');

const setRefreshCookie = (res, token) => res.cookie('refreshToken', token, refreshCookieOptions);

const githubLogin = (req, res, next) => {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_CALLBACK_URL) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent('GitHub OAuth is not configured')}`);
  }

  const state = req.query.state || crypto.randomBytes(16).toString('hex');
  res.cookie('github_oauth_state', state, {
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 5 * 60 * 1000,
    path: '/api',
  });

  return passport.authenticate('github', {
    scope: ['read:user', 'user:email'],
    state,
  })(req, res, next);
};

const githubCallback = (req, res, next) => {
  const stateCookie = req.cookies?.github_oauth_state;
  const stateQuery = req.query.state;

  if (!stateCookie || !stateQuery || stateCookie !== stateQuery) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent('Invalid OAuth state')}`);
  }

  res.clearCookie('github_oauth_state', { path: '/api' });

  return passport.authenticate('github', { session: false }, (err, authResult) => {
    if (err) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent(err.message || 'GitHub authentication failed')}`);
    }

    if (!authResult || !authResult.accessToken) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent('Invalid GitHub callback response')}`);
    }

    setRefreshCookie(res, authResult.refreshToken);
    const token = authResult.accessToken;
    return res.redirect(`${env.FRONTEND_URL}/auth/github/success?token=${encodeURIComponent(token)}`);
  })(req, res, next);
};

module.exports = {
  githubLogin,
  githubCallback,
};
