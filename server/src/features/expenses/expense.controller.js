const service = require('./expense.service');
const { streamExpensesCsv } = require('./expense.csv');

async function list(req, res) {
  const limit = Math.min(parseInt(req.query.limit, 10) || 25, 200);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const { q, category, merchant, from, to } = req.query;
  const result = await service.listExpenses(req.user._id, {
    limit,
    page,
    q,
    category,
    merchant,
    from,
    to,
  });
  res.json(result);
}

async function get(req, res) {
  const exp = await service.getExpense(req.user._id, req.params.id);
  res.json(exp);
}

async function create(req, res) {
  const exp = await service.createExpense(req.user._id, req.body);
  res.status(201).json(exp);
}

async function update(req, res) {
  const exp = await service.updateExpense(req.user._id, req.params.id, req.body);
  res.json(exp);
}

async function remove(req, res) {
  await service.deleteExpense(req.user._id, req.params.id);
  res.status(204).end();
}

async function exportCsv(req, res) {
  await streamExpensesCsv(req.user._id, req.query, res);
}

async function removeAll(req, res) {
  const deleted = await service.deleteAllExpenses(req.user._id);
  res.json({ deleted });
}

module.exports = { list, get, create, update, remove, removeAll, exportCsv };
