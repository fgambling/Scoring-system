import { ConfigOption } from '../enums/config.option.enum';
import { TestStatus } from '../enums/test.status.enum';

export interface Test {
  _id: string;
  name: string;
  questionIds: string[];
  isPublished: boolean;
  markedBy: string;
  developerId: string;
  markConfig: {
    caseMistakesOption: ConfigOption;
    contractionMistakesOption: ConfigOption;
    punctuationMistakesOption: ConfigOption;
    spellingMistakesOption: ConfigOption;
    grammaticalErrorsOption: ConfigOption;
  };
  status: TestStatus;
}
