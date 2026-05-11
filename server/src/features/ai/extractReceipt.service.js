const env = require('../../config/env');
const { categorizeMerchant } = require('./categorize.service');
const { CATEGORIES } = require('../expenses/expense.schema');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');

const TABSCANNER_BASE = 'https://api.tabscanner.com';
const POLL_INTERVAL_MS = 1000;
const MAX_POLLS = 30;

async function submitToTabscanner(imageBuffer) {
  const form = new FormData();
  form.append('file', new Blob([imageBuffer]), 'receipt.jpg');

  const res = await fetch(`${TABSCANNER_BASE}/api/2/process`, {
    method: 'POST',
    headers: { apikey: env.TABSCANNER_API_KEY },
    body: form,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.token) {
    logger.error({ status: res.status, body: data }, 'tabscanner submit failed');
    if (res.status === 401 || res.status === 403) {
      throw new AppError('Tabscanner API key invalid', 502);
    }
    if (res.status === 402 || data.code === 402) {
      throw new AppError('Tabscanner credits exhausted', 502);
    }
    throw new AppError(data.message || 'Tabscanner submit failed', 502);
  }

  return data.token;
}

async function pollResult(token) {
  for (let i = 0; i < MAX_POLLS; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const res = await fetch(`${TABSCANNER_BASE}/api/result/${token}`, {
      headers: { apikey: env.TABSCANNER_API_KEY },
    });
    const data = await res.json().catch(() => ({}));

    if (data.status === 'done') return data.result || {};
    if (data.status === 'failed') {
      throw new AppError(data.message || 'Receipt could not be parsed', 502);
    }
  }
  throw new AppError('Receipt extraction timed out', 504);
}

function normalizeDate(result) {
  const iso = typeof result.dateISO === 'string' ? result.dateISO : null;
  if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) return iso.slice(0, 10);

  const raw = typeof result.date === 'string' ? result.date : null;
  if (raw) {
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  }
  return null;
}

async function extractReceipt(imageBuffer) {
  if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
    throw new AppError('Image required', 400);
  }

  const submitStart = Date.now();
  const token = await submitToTabscanner(imageBuffer);
  const result = await pollResult(token);
  logger.info(
    {
      durationMs: Date.now() - submitStart,
      establishment: result.establishment,
      total: result.total,
      date: result.dateISO || result.date,
    },
    'tabscanner extraction done'
  );

  const merchant =
    typeof result.establishment === 'string' && result.establishment.trim()
      ? result.establishment.trim()
      : null;

  const amount =
    typeof result.total === 'number' && result.total >= 0
      ? result.total
      : null;

  const date = normalizeDate(result);

  let category = 'Other';
  let categoryConfidence = null;
  if (merchant) {
    try {
      const cat = await categorizeMerchant(merchant);
      if (CATEGORIES.includes(cat.category)) {
        category = cat.category;
        categoryConfidence = cat.confidence;
      }
    } catch (err) {
      logger.warn({ err: err?.message }, 'category inference failed; defaulting to Other');
    }
  }

  return {
    merchant,
    amount,
    date,
    category,
    confidence: categoryConfidence,
    source: 'tabscanner',
  };
}

module.exports = { extractReceipt };
