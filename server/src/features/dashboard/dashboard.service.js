const Expense = require('../expenses/expense.model');

function parseMonth(monthStr) {
  const now = new Date();
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth();

  if (typeof monthStr === 'string' && /^\d{4}-\d{2}$/.test(monthStr)) {
    const [y, m] = monthStr.split('-').map(Number);
    if (y >= 2000 && y < 3000 && m >= 1 && m <= 12) {
      year = y;
      month = m - 1;
    }
  }

  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  const prevStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const prevEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  return { start, end, prevStart, prevEnd, monthKey };
}

async function getSummary(userId, monthStr) {
  const { start, end, prevStart, prevEnd, monthKey } = parseMonth(monthStr);

  const matchInMonth = {
    userId,
    date: { $gte: start, $lte: end },
    category: { $ne: 'Income' },
  };

  const [facetResult, prevTotalResult] = await Promise.all([
    Expense.aggregate([
      { $match: matchInMonth },
      {
        $facet: {
          total: [
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
          ],
          byCategory: [
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } },
          ],
          byMerchant: [
            { $group: { _id: '$merchant', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 5 },
          ],
          dailySeries: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                total: { $sum: '$amount' },
              },
            },
            { $sort: { _id: 1 } },
          ],
          anomalyCount: [
            { $match: { isAnomaly: true } },
            { $count: 'count' },
          ],
        },
      },
    ]),
    Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: prevStart, $lte: prevEnd },
          category: { $ne: 'Income' },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const facet = facetResult[0] || {};
  const total = facet.total?.[0]?.total ?? 0;
  const count = facet.total?.[0]?.count ?? 0;
  const prevTotal = prevTotalResult[0]?.total ?? 0;
  const delta = prevTotal > 0 ? (total - prevTotal) / prevTotal : null;

  return {
    monthKey,
    range: { start, end },
    total,
    count,
    prevTotal,
    deltaVsLastMonth: delta,
    byCategory: (facet.byCategory || []).map((r) => ({
      category: r._id,
      total: r.total,
      count: r.count,
    })),
    byMerchant: (facet.byMerchant || []).map((r) => ({
      merchant: r._id,
      total: r.total,
      count: r.count,
    })),
    dailySeries: fillDailySeries(facet.dailySeries || [], start, end),
    anomalies: facet.anomalyCount?.[0]?.count ?? 0,
  };
}

function fillDailySeries(rows, start, end) {
  const map = new Map(rows.map((r) => [r._id, r.total]));
  const days = [];
  const cur = new Date(start);
  while (cur <= end) {
    const key = `${cur.getUTCFullYear()}-${String(cur.getUTCMonth() + 1).padStart(2, '0')}-${String(
      cur.getUTCDate()
    ).padStart(2, '0')}`;
    days.push({ date: key, total: map.get(key) || 0 });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}

module.exports = { getSummary };
