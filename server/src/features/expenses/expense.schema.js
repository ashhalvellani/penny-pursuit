const { z } = require('zod');
const CATEGORIES = require('../../../../shared/categories.json');

const SOURCES = ['manual', 'receipt', 'import'];

const baseShape = {
  merchant: z.string().trim().min(1, 'Merchant required').max(120),
  amount: z.coerce.number().min(0, 'Amount must be ≥ 0'),
  currency: z.string().trim().length(3).default('USD'),
  date: z.coerce.date(),
  category: z.enum(CATEGORIES, { message: 'Invalid category' }),
  note: z.string().trim().max(280).optional(),
  source: z.enum(SOURCES).optional(),
};

const createExpenseSchema = z.object(baseShape);

const updateExpenseSchema = z.object(baseShape).partial();

module.exports = {
  CATEGORIES,
  SOURCES,
  createExpenseSchema,
  updateExpenseSchema,
};
