const { Schema, model } = require('mongoose');
const { CATEGORIES } = require('../expenses/expense.schema');

const budgetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    amount: { type: Number, required: true, min: 0 },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });
budgetSchema.index({ userId: 1, month: 1 });

budgetSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = model('Budget', budgetSchema);
