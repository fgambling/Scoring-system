import { ConfigOption } from '../enums/config.option.enum';
import { Question } from './question.interface';

export interface TestDetail {
  _id: string;
  name: string;
  questionIds: Question[];
  isPublished: boolean;
  developerId: string;
  markConfig: {
    caseMistakesOption: ConfigOption;
    contractionMistakesOption: ConfigOption;
    punctuationMistakesOption: ConfigOption;
    spellingMistakesOption: ConfigOption;
    grammaticalErrorsOption: ConfigOption;
  };
}
