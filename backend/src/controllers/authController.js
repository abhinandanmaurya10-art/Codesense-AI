const authService = require('../services/authService');
const { ok, created, asyncHandler } = require('../utils/response');
const { refreshCookieOptions, verifyRefreshToken } = require('../services/tokenService');

const setRefreshCookie = (res, token) => res.cookie('refreshToken', token, refreshCookieOptions);

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  return created(res, { user, accessToken, refreshToken }, 'Account created');
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  return ok(res, { user, accessToken, refreshToken }, 'Logged in');
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await authService.refresh(token);
  setRefreshCookie(res, result.refreshToken);
  return ok(res, result, 'Token refreshed');
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  let userId = req.user?._id;
  if (!userId && token) {
    try {
      userId = verifyRefreshToken(token).sub;
    } catch {
      userId = null;
    }
  }
  await authService.logout(userId, token);
  const { httpOnly, sameSite, secure, path } = refreshCookieOptions;
  res.clearCookie('refreshToken', { httpOnly, sameSite, secure, path });
  return ok(res, null, 'Logged out');
});

const me = asyncHandler(async (req, res) => ok(res, { user: req.user.toPublic() }));

module.exports = { register, login, refresh, logout, me };
