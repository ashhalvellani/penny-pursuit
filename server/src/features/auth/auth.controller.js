const env = require('../../config/env');
const { signJwt, cookieOptions, COOKIE_NAME } = require('./auth.service');
const User = require('../users/user.model');
const Expense = require('../expenses/expense.model');
const Budget = require('../budgets/budget.model');
const { invalidateAllInsights } = require('../ai/insights.service');

function googleCallback(req, res) {
  const token = signJwt(req.user);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.redirect(`${env.CLIENT_URL}/dashboard`);
}

function me(req, res) {
  res.json({ user: req.user });
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
}

async function removeMe(req, res) {
  const userId = req.user._id;
  await Promise.all([
    Expense.deleteMany({ userId }),
    Budget.deleteMany({ userId }),
    User.deleteOne({ _id: userId }),
  ]);
  invalidateAllInsights(userId);
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
}

module.exports = { googleCallback, me, logout, removeMe };
