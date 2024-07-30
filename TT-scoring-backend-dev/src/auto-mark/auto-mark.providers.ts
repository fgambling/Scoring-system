import { Connection } from 'mongoose';
import { Answer } from './schemas/answer.schema';

export const autoMarkProviders = [
  {
    provide: 'ANSWER_MODEL',
    useFactory: (connection: Connection) => connection.model('Answer', Answer),
    inject: ['DATABASE_CONNECTION'],
  },
];
