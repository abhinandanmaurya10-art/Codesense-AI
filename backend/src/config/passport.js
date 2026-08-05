const passport = require('passport');
const { Strategy: GitHubStrategy } = require('passport-github2');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const env = require('./env');
const githubAuthService = require('../services/githubAuthService');
const googleAuthService = require('../services/googleAuthService');

/**
 * Passport strategy configuration for GitHub and Google OAuth.
 *
 * This file does not create sessions for normal app authentication.
 * It only uses Passport as an OAuth handshake helper.
 */
function setupPassport() {
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  // GitHub OAuth Strategy
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    passport.use(
      'github',
      new GitHubStrategy(
        {
          clientID: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          callbackURL: env.GITHUB_CALLBACK_URL,
          scope: ['read:user', 'user:email'],
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            const user = await githubAuthService.findOrCreateGitHubUser(profile);
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        },
      ),
    );
  }

  // Google OAuth Strategy
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      'google',
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URL,
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            const user = await googleAuthService.findOrCreateGoogleUser(profile);
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        },
      ),
    );
  }

  return passport;
}

module.exports = setupPassport;
