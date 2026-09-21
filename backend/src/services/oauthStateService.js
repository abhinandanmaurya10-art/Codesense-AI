const crypto = require('crypto');
const env = require('../config/env');

const STATE_TTL_MS = 5 * 60 * 1000;

function sign(payload) {
  return crypto.createHmac('sha256', env.JWT_ACCESS_SECRET).update(payload).digest('base64url');
}

function createOAuthState() {
  const issuedAt = Date.now().toString(36);
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${issuedAt}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

function isValidOAuthState(state) {
  if (typeof state !== 'string') return false;
  const [issuedAt, nonce, signature, ...extra] = state.split('.');
  if (!issuedAt || !nonce || !signature || extra.length) return false;

  const payload = `${issuedAt}.${nonce}`;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    return false;
  }

  const createdAt = Number.parseInt(issuedAt, 36);
  return Number.isFinite(createdAt) && Date.now() - createdAt >= 0 && Date.now() - createdAt <= STATE_TTL_MS;
}

module.exports = { createOAuthState, isValidOAuthState };
