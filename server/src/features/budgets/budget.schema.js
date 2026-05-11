const { z } = require('zod');
const { CATEGORIES } = require('../expenses/expense.schema');

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const upsertBudgetSchema = z.object({
  category: z.enum(CATEGORIES, { message: 'Invalid category' }),
  month: z.string().regex(MONTH_REGEX, 'Month must be YYYY-MM'),
  amount: z.coerce.number().min(0, 'Amount must be ≥ 0'),
});

const copyBudgetsSchema = z
  .object({
    fromMonth: z.string().regex(MONTH_REGEX, 'fromMonth must be YYYY-MM'),
    toMonth: z.string().regex(MONTH_REGEX, 'toMonth must be YYYY-MM'),
  })
  .refine((v) => v.fromMonth !== v.toMonth, {
    message: 'fromMonth and toMonth must differ',
    path: ['toMonth'],
  });

module.exports = { upsertBudgetSchema, copyBudgetsSchema };
