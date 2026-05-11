const { Schema, model } = require('mongoose');
const { CATEGORIES, SOURCES } = require('./expense.schema');

const expenseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    merchant: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    category: { type: String, enum: CATEGORIES, required: true },
    note: { type: String, maxlength: 280 },
    source: { type: String, enum: SOURCES, default: 'manual' },
    aiMeta: {
      model: { type: String },
      confidence: { type: Number },
      raw: { type: Schema.Types.Mixed },
    },
    isAnomaly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1, date: -1 });
expenseSchema.index({ userId: 1, merchant: 1 });

expenseSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = model('Expense', expenseSchema);
