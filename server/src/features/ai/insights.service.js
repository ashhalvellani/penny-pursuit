const Expense = require('../expenses/expense.model');
const Budget = require('../budgets/budget.model');
const { getClient, MODELS } = require('./groq.client');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');

const TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map();

function cacheKey(userId, month) {
  return `${userId.toString()}:${month}`;
}

function normalizeMonth(input) {
  if (typeof input === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(input)) return input;
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function parseRange(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  const prevStart = new Date(Date.UTC(y, m - 2, 1, 0, 0, 0, 0));
  const prevEnd = new Date(Date.UTC(y, m - 1, 0, 23, 59, 59, 999));
  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(start);
  return { start, end, prevStart, prevEnd, monthLabel };
}

function round2(n) {
  return Math.round((n || 0) * 100) / 100;
}

async function gatherStats(userId, monthKey) {
  const { start, end, prevStart, prevEnd, monthLabel } = parseRange(monthKey);

  const matchInMonth = {
    userId,
    date: { $gte: start, $lte: end },
    category: { $ne: 'Income' },
  };
  const matchPrev = {
    userId,
    date: { $gte: prevStart, $lte: prevEnd },
    category: { $ne: 'Income' },
  };

  const [thisFacet, prevByCat, largestArr, budgets] = await Promise.all([
    Expense.aggregate([
      { $match: matchInMonth },
      {
        $facet: {
          total: [{ $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }],
          byCategory: [
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } },
          ],
          byMerchant: [
            { $group: { _id: '$merchant', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 3 },
          ],
          anomalyCount: [{ $match: { isAnomaly: true } }, { $count: 'count' }],
        },
      },
    ]),
    Expense.aggregate([
      { $match: matchPrev },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
    Expense.find(matchInMonth).sort({ amount: -1 }).limit(1).lean(),
    Budget.find({ userId, month: monthKey }).lean(),
  ]);

  const facet = thisFacet[0] || {};
  const total = facet.total?.[0]?.total ?? 0;
  const count = facet.total?.[0]?.count ?? 0;
  const byCat = facet.byCategory || [];
  const prevMap = new Map(prevByCat.map((r) => [r._id, r.total]));
  const prevTotal = prevByCat.reduce((s, r) => s + r.total, 0);

  const stats = {
    monthLabel,
    monthKey,
    daysInMonth: end.getUTCDate(),
    isCurrentMonth:
      monthKey ===
      `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}`,
    today: new Date().toISOString().slice(0, 10),
    total: round2(total),
    transactions: count,
    prevTotal: round2(prevTotal),
    deltaPct:
      prevTotal > 0 ? round2(((total - prevTotal) / prevTotal) * 100) : null,
    topCategories: byCat.slice(0, 5).map((c) => {
      const prev = prevMap.get(c._id) || 0;
      return {
        category: c._id,
        total: round2(c.total),
        count: c.count,
        prevTotal: round2(prev),
        deltaPct: prev > 0 ? round2(((c.total - prev) / prev) * 100) : null,
      };
    }),
    topMerchants: (facet.byMerchant || []).map((m) => ({
      merchant: m._id,
      total: round2(m.total),
      count: m.count,
    })),
    largestExpense: largestArr[0]
      ? {
          merchant: largestArr[0].merchant,
          amount: round2(largestArr[0].amount),
          date: largestArr[0].date.toISOString().slice(0, 10),
          category: largestArr[0].category,
        }
      : null,
    anomalies: facet.anomalyCount?.[0]?.count ?? 0,
    budgets: budgets.map((b) => {
      const spent = byCat.find((c) => c._id === b.category)?.total || 0;
      return {
        category: b.category,
        budget: round2(b.amount),
        spent: round2(spent),
        pctUsed: b.amount > 0 ? round2((spent / b.amount) * 100) : null,
      };
    }),
  };

  return stats;
}

const SYSTEM_TEXT = `You are a personal-finance assistant. Given a JSON blob of monthly spending stats, write exactly 3 short bullets surfacing the most useful, specific observations.

Style:
- Each bullet: ONE sentence, MAX 25 words.
- Use specific numbers (dollar amounts, percentages, counts) drawn from the stats.
- Compare to last month or budgets when interesting.
- Prefer actionable observations over compliments.
- Do NOT start every bullet with "Your".
- Do NOT make up data not in the stats.
- Do NOT mention that you are an AI.

Output JSON ONLY: { "bullets": ["...", "...", "..."] }`;

const TOOL = {
  type: 'function',
  function: {
    name: 'record_insights',
    description:
      'Record exactly 3 short, specific bullet observations about this month\'s spending.',
    parameters: {
      type: 'object',
      properties: {
        bullets: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
          maxItems: 4,
          description: 'Each bullet: one sentence, max 25 words, specific numbers.',
        },
      },
      required: ['bullets'],
    },
  },
};

async function callLLM(stats) {
  const client = getClient();
  let response;
  try {
    response = await client.chat.completions.create({
      model: MODELS.text,
      messages: [
        { role: 'system', content: SYSTEM_TEXT },
        { role: 'user', content: `Stats:\n${JSON.stringify(stats, null, 2)}` },
      ],
      tools: [TOOL],
      tool_choice: { type: 'function', function: { name: 'record_insights' } },
      temperature: 0.3,
      max_tokens: 512,
    });
  } catch (err) {
    logger.error(
      { err: err?.message, status: err?.status },
      'groq insights call failed'
    );
    throw new AppError('Insights unavailable', 502);
  }

  const usage = response.usage || {};
  logger.info(
    {
      model: MODELS.text,
      input: usage.prompt_tokens,
      output: usage.completion_tokens,
      durationMs: Math.round((usage.total_time || 0) * 1000),
    },
    'groq insights usage'
  );

  const toolCall = response.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) {
    throw new AppError('AI did not return a tool call', 502);
  }

  let parsed;
  try {
    parsed = JSON.parse(toolCall.function.arguments);
  } catch {
    throw new AppError('AI did not return parseable JSON', 502);
  }
  return Array.isArray(parsed.bullets) ? parsed.bullets.filter((s) => typeof s === 'string') : [];
}

async function getInsights(userId, monthInput, { refresh } = {}) {
  const monthKey = normalizeMonth(monthInput);
  const key = cacheKey(userId, monthKey);

  if (!refresh) {
    const hit = cache.get(key);
    if (hit && hit.expiresAt > Date.now()) {
      return { monthKey, bullets: hit.bullets, cached: true };
    }
  }

  const stats = await gatherStats(userId, monthKey);

  if (stats.total === 0) {
    const bullets = ['No spending recorded for this month yet — add some expenses to see insights.'];
    cache.set(key, { bullets, expiresAt: Date.now() + TTL_MS });
    return { monthKey, bullets, cached: false };
  }

  const bullets = await callLLM(stats);
  cache.set(key, { bullets, expiresAt: Date.now() + TTL_MS });
  return { monthKey, bullets, cached: false };
}

function invalidateInsights(userId, monthKey) {
  if (!userId || !monthKey) return;
  cache.delete(cacheKey(userId, monthKey));
}

function invalidateAllInsights(userId) {
  if (!userId) return;
  const prefix = `${userId.toString()}:`;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

function monthKeyOf(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

module.exports = { getInsights, invalidateInsights, invalidateAllInsights, monthKeyOf };
