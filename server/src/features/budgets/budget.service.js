const Budget = require('./budget.model');
const AppError = require('../../utils/AppError');

async function listBudgets(userId, { month } = {}) {
  const filter = { userId };
  if (month) filter.month = month;
  return Budget.find(filter).sort({ category: 1 }).lean();
}

async function upsertBudget(userId, { category, month, amount }) {
  const doc = await Budget.findOneAndUpdate(
    { userId, category, month },
    { $set: { amount } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return doc.toJSON();
}

async function deleteBudget(userId, id) {
  const res = await Budget.deleteOne({ _id: id, userId });
  if (res.deletedCount === 0) throw new AppError('Budget not found', 404);
}

module.exports = { listBudgets, upsertBudget, deleteBudget };
