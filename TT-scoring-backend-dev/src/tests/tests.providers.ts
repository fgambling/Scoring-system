import { Connection } from 'mongoose';
import { TestSchema } from './schemas/test.schema';
import { QuestionSchema } from './schemas/question.schema';
import { UserSchema } from 'src/users/schemas/user.schema';

export const testProviders = [
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
  {
    provide: 'USER_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('User', UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
