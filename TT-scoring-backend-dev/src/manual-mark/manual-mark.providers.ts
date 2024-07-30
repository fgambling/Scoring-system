import { Connection } from 'mongoose';
import { Answer } from 'src/auto-mark/schemas/answer.schema';
import { TestSchema } from 'src/tests/schemas/test.schema';
import { QuestionSchema } from 'src/tests/schemas/question.schema';

export const manualMarkProviders = [
  {
    provide: 'ANSWER_MODEL',
    useFactory: (connection: Connection) => connection.model('Answer', Answer),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'TEST_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Test', TestSchema),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'QUESTION_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Question', QuestionSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
