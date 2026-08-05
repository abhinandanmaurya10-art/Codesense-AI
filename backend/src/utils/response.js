const ok = (res, data, message, status = 200) =>
  res.status(status).json({ success: true, data, ...(message ? { message } : {}) });

const created = (res, data, message) => ok(res, data, message, 201);

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { ok, created, asyncHandler };
