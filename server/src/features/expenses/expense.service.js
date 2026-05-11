const Expense = require('./expense.model');
const AppError = require('../../utils/AppError');
const { invalidateInsights, invalidateAllInsights, monthKeyOf } = require('../ai/insights.service');

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildFilter(userId, { q, category, merchant, from, to } = {}) {
  const filter = { userId };

  if (category) filter.category = category;
  if (merchant) filter.merchant = new RegExp(escapeRegex(merchant), 'i');

  if (from || to) {
    filter.date = {};
    if (from) {
      const d = new Date(from);
      if (!isNaN(d)) filter.date.$gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (!isNaN(d)) {
        d.setHours(23, 59, 59, 999);
        filter.date.$lte = d;
      }
    }
  }

  if (q) {
    const r = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ merchant: r }, { note: r }];
  }

  return filter;
}

async function listExpenses(userId, opts = {}) {
  const { limit = 50, page = 1, ...rest } = opts;
  const filter = buildFilter(userId, rest);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Expense.find(filter).sort({ date: -1, _id: -1 }).skip(skip).limit(limit).lean(),
    Expense.countDocuments(filter),
  ]);
  return { items, total, page, limit };
}

async function getExpense(userId, id) {
  const exp = await Expense.findOne({ _id: id, userId }).lean();
  if (!exp) throw new AppError('Expense not found', 404);
  return exp;
}

const ANOMALY_LOOKBACK_DAYS = 90;
const ANOMALY_MIN_HISTORY = 5;
const ANOMALY_STDDEV_MULT = 2;

async function isAnomalous(userId, { category, amount, date }) {
  if (!category || typeof amount !== 'number' || amount <= 0) return false;
  const ref = date instanceof Date ? date : new Date(date || Date.now());
  const since = new Date(ref);
  since.setDate(since.getDate() - ANOMALY_LOOKBACK_DAYS);

  const [stats] = await Expense.aggregate([
    { $match: { userId, category, date: { $gte: since, $lte: ref } } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avg: { $avg: '$amount' },
        std: { $stdDevPop: '$amount' },
      },
    },
  ]);

  if (!stats || stats.count < ANOMALY_MIN_HISTORY) return false;
  const threshold = stats.avg + ANOMALY_STDDEV_MULT * (stats.std || 0);
  return amount > threshold;
}

async function createExpense(userId, data) {
  const isAnomaly = await isAnomalous(userId, data);
  const exp = await Expense.create({ ...data, userId, isAnomaly });
  invalidateInsights(userId, monthKeyOf(exp.date));
  return exp.toJSON();
}

async function updateExpense(userId, id, data) {
  const before = await Expense.findOne({ _id: id, userId }).lean();
  if (!before) throw new AppError('Expense not found', 404);

  const exp = await Expense.findOneAndUpdate({ _id: id, userId }, data, {
    new: true,
    runValidators: true,
  });
  if (!exp) throw new AppError('Expense not found', 404);

  invalidateInsights(userId, monthKeyOf(before.date));
  if (monthKeyOf(exp.date) !== monthKeyOf(before.date)) {
    invalidateInsights(userId, monthKeyOf(exp.date));
  }
  return exp.toJSON();
}

async function deleteExpense(userId, id) {
  const before = await Expense.findOneAndDelete({ _id: id, userId });
  if (!before) throw new AppError('Expense not found', 404);
  invalidateInsights(userId, monthKeyOf(before.date));
}

async function deleteAllExpenses(userId) {
  const { deletedCount } = await Expense.deleteMany({ userId });
  invalidateAllInsights(userId);
  return deletedCount;
}

module.exports = {
  buildFilter,
  listExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  deleteAllExpenses,
};
