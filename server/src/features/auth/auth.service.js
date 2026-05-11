const jwt = require('jsonwebtoken');
const env = require('../../config/env');

const COOKIE_NAME = 'pp_token';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function signJwt(user) {
  return jwt.sign({ sub: user._id.toString() }, env.JWT_SECRET, { expiresIn: '7d' });
}

function verifyJwt(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

function cookieOptions() {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  };
}

module.exports = { signJwt, verifyJwt, cookieOptions, COOKIE_NAME };
