const passport = require('passport');
const { refreshCookieOptions } = require('../services/tokenService');
const env = require('../config/env');
const { createOAuthState, isValidOAuthState } = require('../services/oauthStateService');

const setRefreshCookie = (res, token) => res.cookie('refreshToken', token, refreshCookieOptions);

const googleLogin = (req, res, next) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent('Google OAuth is not configured')}`);
  }

  const state = createOAuthState();

  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    state,
  })(req, res, next);
};

const googleCallback = (req, res, next) => {
  const stateQuery = req.query.state;

  if (!isValidOAuthState(stateQuery)) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent('Invalid OAuth state')}`);
  }

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
