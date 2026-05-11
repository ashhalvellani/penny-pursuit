const service = require('./budget.service');

async function list(req, res) {
  const items = await service.listBudgets(req.user._id, { month: req.query.month });
  res.json({ items });
}

async function upsert(req, res) {
  const item = await service.upsertBudget(req.user._id, req.body);
  res.status(200).json(item);
}

async function remove(req, res) {
  await service.deleteBudget(req.user._id, req.params.id);
  res.status(204).end();
}

async function copyFrom(req, res) {
  const result = await service.copyBudgetsFromMonth(req.user._id, req.body);
  res.json(result);
}

module.exports = { list, upsert, remove, copyFrom };
