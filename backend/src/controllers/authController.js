const authService = require('../services/authService');
const { ok, created, asyncHandler } = require('../utils/response');
const { refreshCookieOptions } = require('../services/tokenService');

const setRefreshCookie = (res, token) => res.cookie('refreshToken', token, refreshCookieOptions);

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  return created(res, { user, accessToken, refreshToken }, 'Account created');
});

const githubLogin = asyncHandler(async (_req, res) => {
  try {
    const authUrl = authService.getGithubAuthUrl();
    return res.redirect(authUrl);
  } catch (error) {
    const message = error?.message || 'GitHub OAuth is not configured';
    return res.status(500).send(`<!doctype html><html><body style="font-family:system-ui,sans-serif;display:grid;place-items:center;height:100vh;background:#0f172a;color:#e2e8f0;margin:0;"><div style="max-width:28rem;padding:2rem;border-radius:1rem;background:#111827;box-shadow:0 24px 80px rgba(15,23,42,.6);text-align:center;"><h1 style="font-size:1.75rem;margin-bottom:1rem;">GitHub login is not configured</h1><p style="margin-bottom:1rem;line-height:1.6;">${message}</p><p style="margin-bottom:1.5rem;">Please set <code>GITHUB_CLIENT_ID</code>, <code>GITHUB_CLIENT_SECRET</code>, and <code>GITHUB_CALLBACK_URL</code> in your backend <code>.env</code>.</p><a href="/login" style="display:inline-block;padding:0.75rem 1.25rem;border-radius:0.75rem;background:#2563eb;color:#fff;text-decoration:none;">Back to login</a></div></body></html>`);
  }
});

const githubCallback = asyncHandler(async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Missing GitHub authorization code.');
  }

  const { accessToken, refreshToken } = await authService.githubSignIn({ code: String(code) });
  setRefreshCookie(res, refreshToken);
  const safeToken = JSON.stringify(accessToken);

  return res.send(`<!doctype html><html><body><script>
      localStorage.setItem('codesense_access_token', ${safeToken});
      window.location.href = '/dashboard';
    </script></body></html>`);
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
  res.clearCookie('refreshToken', { ...refreshCookieOptions, expires: new Date(0) });
  return ok(res, null, 'Logged out');
});

const me = asyncHandler(async (req, res) => ok(res, { user: req.user.toPublic() }));

module.exports = { register, login, refresh, logout, me, githubLogin, githubCallback };
