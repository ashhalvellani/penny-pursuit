const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL'),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
  TABSCANNER_API_KEY: z.string().min(1, 'TABSCANNER_API_KEY is required'),
  ALLOWED_EMAILS: z.string().optional().default(''),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n  Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  }
  console.error('');
  process.exit(1);
}

module.exports = parsed.data;
