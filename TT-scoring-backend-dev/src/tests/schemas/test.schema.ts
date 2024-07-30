import * as mongoose from 'mongoose';
import { TestStatus } from '../enums/test.status.enum';
import { ConfigOption } from '../enums/config.option.enum';

export const TestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  lastStatusChangeTime: {
    type: Date,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(TestStatus),
  },
  markConfig: {
    caseMistakesOption: {
      type: String,
      required: true,
      enum: Object.values(ConfigOption),
    },
    contractionMistakesOption: {
      type: String,
      required: true,
      enum: Object.values(ConfigOption),
    },
    punctuationMistakesOption: {
      type: String,
      required: true,
      enum: Object.values(ConfigOption),
    },
    spellingMistakesOption: {
      type: String,
      required: true,
      enum: Object.values(ConfigOption),
    },
    grammaticalErrorsOption: {
      type: String,
      required: true,
      enum: Object.values(ConfigOption),
    },
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  developerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublished: {
    type: Boolean,
    required: true,
  },
});
// UTC
TestSchema.pre('save', function (next) {
  this.lastStatusChangeTime = new Date();
  next();
});

TestSchema.pre('findOneAndUpdate', function (next) {
  this.set({ lastStatusChangeTime: new Date() });
  next();
});

TestSchema.pre('updateOne', function (next) {
  this.set({ lastStatusChangeTime: new Date() });
  next();
});
