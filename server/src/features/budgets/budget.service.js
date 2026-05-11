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

async function copyBudgetsFromMonth(userId, { fromMonth, toMonth }) {
  const source = await Budget.find({ userId, month: fromMonth }).lean();
  if (source.length === 0) return { imported: 0, skipped: 0 };

  const existing = await Budget.find({ userId, month: toMonth })
    .select('category')
    .lean();
  const existingCats = new Set(existing.map((b) => b.category));

  const toInsert = source.filter((b) => !existingCats.has(b.category));
  if (toInsert.length === 0) {
    return { imported: 0, skipped: source.length };
  }

  const docs = toInsert.map((b) => ({
    userId,
    category: b.category,
    amount: b.amount,
    month: toMonth,
  }));
  await Budget.insertMany(docs);
  return { imported: docs.length, skipped: source.length - docs.length };
}

module.exports = { listBudgets, upsertBudget, deleteBudget, copyBudgetsFromMonth };
