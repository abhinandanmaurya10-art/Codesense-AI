const passport = require('passport');
const { refreshCookieOptions } = require('../services/tokenService');
const env = require('../config/env');
const { getGithubAuthUrl } = require('../services/authService');
const { createOAuthState, isValidOAuthState } = require('../services/oauthStateService');

const setRefreshCookie = (res, token) => res.cookie('refreshToken', token, refreshCookieOptions);

const githubLogin = (req, res, next) => {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_CALLBACK_URL) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent('GitHub OAuth is not configured')}`);
  }

  const state = createOAuthState();

  const authUrl = getGithubAuthUrl(state);
  console.log('[github oauth] redirecting to', authUrl);
  return res.redirect(authUrl);
};

const githubCallback = (req, res, next) => {
  const stateQuery = req.query.state;

  if (!isValidOAuthState(stateQuery)) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent('Invalid OAuth state')}`);
  }

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
