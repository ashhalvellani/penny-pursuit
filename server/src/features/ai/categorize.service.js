const { getClient, MODELS } = require('./groq.client');
const { CATEGORIES } = require('../expenses/expense.schema');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');

const SYSTEM_TEXT = `You are an expense categorization assistant for a personal finance app.

Given a merchant name, pick the single best category from the allowed list and call the set_category tool. Pick "Other" only if nothing else fits.

Allowed categories:
${CATEGORIES.map((c) => `- ${c}`).join('\n')}

Calibration examples:
- "Chipotle" -> Food & Dining (0.97)
- "Starbucks" -> Food & Dining (0.97)
- "Whole Foods" -> Groceries (0.96)
- "Trader Joe's" -> Groceries (0.96)
- "Uber" -> Transport (0.95)
- "Lyft" -> Transport (0.95)
- "Shell" -> Transport (0.93)
- "Chevron" -> Transport (0.93)
- "Amazon" -> Shopping (0.85)
- "Target" -> Shopping (0.82)
- "Netflix" -> Subscriptions (0.97)
- "Spotify" -> Subscriptions (0.97)
- "AT&T" -> Bills & Utilities (0.95)
- "Comcast" -> Bills & Utilities (0.95)
- "CVS Pharmacy" -> Health (0.9)
- "Walgreens" -> Health (0.85)
- "Delta Airlines" -> Travel (0.96)
- "Marriott" -> Travel (0.95)
- "Coursera" -> Education (0.95)
- "AMC Theatres" -> Entertainment (0.95)
- "Steam" -> Entertainment (0.9)
- "Direct Deposit" -> Income (0.85)
- Unknown / unrecognized merchant -> Other (0.4)

Be deterministic. If unsure, prefer the more general category and lower the confidence.`;

const TOOL = {
  type: 'function',
  function: {
    name: 'set_category',
    description:
      'Assign exactly one expense category to the merchant, with a confidence score from 0 to 1.',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: CATEGORIES,
          description: 'The single best category for this merchant.',
        },
        confidence: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'How confident you are (0 = guess, 1 = certain).',
        },
      },
      required: ['category', 'confidence'],
    },
  },
};

async function categorizeMerchant(merchant) {
  const text = String(merchant || '').trim();
  if (!text) throw new AppError('Merchant required', 400);

  const client = getClient();
  let response;
  try {
    response = await client.chat.completions.create({
      model: MODELS.text,
      messages: [
        { role: 'system', content: SYSTEM_TEXT },
        { role: 'user', content: `Merchant: "${text}"` },
      ],
      tools: [TOOL],
      tool_choice: { type: 'function', function: { name: 'set_category' } },
      temperature: 0,
      max_tokens: 64,
    });
  } catch (err) {
    logger.error(
      { err: err?.message, status: err?.status },
      'groq categorize call failed'
    );
    throw new AppError('AI service unavailable', 502);
  }

  const usage = response.usage || {};
  logger.info(
    {
      model: MODELS.text,
      input: usage.prompt_tokens,
      output: usage.completion_tokens,
      durationMs: Math.round((usage.total_time || 0) * 1000),
    },
    'groq categorize usage'
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

  const { category, confidence } = parsed;
  if (!CATEGORIES.includes(category)) {
    throw new AppError('AI returned an unknown category', 502);
  }

  return {
    category,
    confidence: typeof confidence === 'number' ? confidence : null,
    model: MODELS.text,
  };
}

module.exports = { categorizeMerchant };
