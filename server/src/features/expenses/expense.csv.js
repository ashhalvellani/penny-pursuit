const Expense = require('./expense.model');
const { buildFilter } = require('./expense.service');

const HEADERS = [
  'id',
  'date',
  'merchant',
  'category',
  'amount',
  'currency',
  'note',
  'source',
  'isAnomaly',
  'createdAt',
];

function csvCell(value) {
  if (value === null || value === undefined) return '';
  const str = value instanceof Date ? value.toISOString() : String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function csvRow(cells) {
  return cells.map(csvCell).join(',');
}

async function streamExpensesCsv(userId, query, res) {
  const filter = buildFilter(userId, query);

  const filename = `penny-pursuit-${new Date().toISOString().slice(0, 10)}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  res.write(csvRow(HEADERS) + '\n');

  const cursor = Expense.find(filter).sort({ date: -1, _id: -1 }).cursor();

  for await (const exp of cursor) {
    const row = [
      exp._id.toString(),
      exp.date?.toISOString().slice(0, 10),
      exp.merchant,
      exp.category,
      exp.amount,
      exp.currency,
      exp.note,
      exp.source,
      exp.isAnomaly,
      exp.createdAt?.toISOString(),
    ];
    res.write(csvRow(row) + '\n');
  }

  res.end();
}

module.exports = { streamExpensesCsv };
