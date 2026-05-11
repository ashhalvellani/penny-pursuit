const AppError = require('../utils/AppError');
const User = require('../features/users/user.model');
const { verifyJwt, COOKIE_NAME } = require('../features/auth/auth.service');

async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new AppError('Not authenticated', 401);

  let payload;
  try {
    payload = verifyJwt(token);
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new AppError('User no longer exists', 401);

  req.user = user;
  next();
}

module.exports = requireAuth;
