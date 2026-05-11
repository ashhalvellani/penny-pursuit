const { ZodError } = require('zod');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

function notFoundHandler(req, res, next) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
}

function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: 'Validation failed',
      issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid id format' });
  }

  if (err?.code === 11000) {
    return res.status(409).json({ error: 'Duplicate value', details: err.keyValue });
  }

  logger.error({ err }, 'unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { errorHandler, notFoundHandler };
