import * as mongoose from 'mongoose';
import { QuestionStatus } from '../../tests/enums/question.status.enum';

export const Answer = new mongoose.Schema({
  name: { type: String, required: true },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  answer: {
    type: String,
  },
  markGained: {
    type: Number,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(QuestionStatus),
  },
});
