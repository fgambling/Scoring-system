import * as mongoose from 'mongoose';

const AlternativeKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },
    alternativeKeys: {
      type: Map,
      of: [String],
    },
  },
  { _id: false },
);

export const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  keys: {
    type: [AlternativeKeySchema],
    required: true,
    validate: [arrayLimit, 'keys cannot be empty'],
  },
  ratingScale: {
    type: Map,
    of: String,
    required: true,
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
  },
});
function arrayLimit(val) {
  return val.length > 0;
}
