const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.user._id.toString(),
  message: { error: 'Too many AI requests, please slow down' },
});

module.exports = { aiLimiter };
