const { z } = require('zod');
const { categorizeMerchant } = require('./categorize.service');
const { extractReceipt } = require('./extractReceipt.service');
const { getInsights } = require('./insights.service');
const AppError = require('../../utils/AppError');

const categorizeBody = z.object({
  merchant: z.string().trim().min(1).max(120),
});

async function categorize(req, res) {
  const { merchant } = categorizeBody.parse(req.body);
  const result = await categorizeMerchant(merchant);
  res.json(result);
}

async function receipt(req, res) {
  if (!req.file) throw new AppError('Image required', 400);
  const result = await extractReceipt(req.file.buffer);
  res.json(result);
}

async function insights(req, res) {
  const refresh = req.query.refresh === '1' || req.query.refresh === 'true';
  const result = await getInsights(req.user._id, req.query.month, { refresh });
  res.json(result);
}

module.exports = { categorize, receipt, insights };
