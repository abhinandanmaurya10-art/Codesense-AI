const crypto = require('crypto');
const passport = require('passport');
const { refreshCookieOptions } = require('../services/tokenService');
const env = require('../config/env');

const setRefreshCookie = (res, token) => res.cookie('refreshToken', token, refreshCookieOptions);

const googleLogin = (req, res, next) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent('Google OAuth is not configured')}`);
  }

  const state = req.query.state || crypto.randomBytes(16).toString('hex');
  res.cookie('google_oauth_state', state, {
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 5 * 60 * 1000,
    path: '/api',
  });

  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    state,
  })(req, res, next);
};

const googleCallback = (req, res, next) => {
  const stateCookie = req.cookies?.google_oauth_state;
  const stateQuery = req.query.state;

  if (!stateCookie || !stateQuery || stateCookie !== stateQuery) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent('Invalid OAuth state')}`);
  }

  res.clearCookie('google_oauth_state', { path: '/api' });

  return passport.authenticate('google', { session: false }, (err, authResult) => {
    if (err) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent(err.message || 'Google authentication failed')}`);
    }

    if (!authResult || !authResult.accessToken) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent('Invalid Google callback response')}`);
    }

    setRefreshCookie(res, authResult.refreshToken);
    const token = authResult.accessToken;
    return res.redirect(`${env.FRONTEND_URL}/auth/google/success?token=${encodeURIComponent(token)}`);
  })(req, res, next);
};

module.exports = {
  googleLogin,
  googleCallback,
};
