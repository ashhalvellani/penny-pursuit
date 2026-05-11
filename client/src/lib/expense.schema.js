import { z } from 'zod';
import categories from '../../../shared/categories.json';

export const CATEGORIES = categories;

export const expenseFormSchema = z.object({
  merchant: z.string().trim().min(1, 'Required').max(120),
  amount: z.coerce.number({ message: 'Required' }).min(0, 'Must be ≥ 0'),
  date: z.string().min(1, 'Required'),
  category: z.enum(categories, { message: 'Pick one' }),
  note: z.string().trim().max(280).optional().or(z.literal('')),
});

export const defaultFormValues = () => ({
  merchant: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  category: '',
  note: '',
});
