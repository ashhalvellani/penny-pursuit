const { z } = require('zod');
const { CATEGORIES } = require('../expenses/expense.schema');

const upsertBudgetSchema = z.object({
  category: z.enum(CATEGORIES, { message: 'Invalid category' }),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be YYYY-MM'),
  amount: z.coerce.number().min(0, 'Amount must be ≥ 0'),
});

module.exports = { upsertBudgetSchema };
