import { ConfigOption } from 'src/tests/enums/config.option.enum';
import { Question } from 'src/tests/interface/question.interface';

export class TestDto {
  _id: string;
  name: string;
  questionIds: Question[];
  isPublished: boolean;
  markConfig: {
    caseMistakesOption: ConfigOption;
    contractionErrorsOption: ConfigOption;
    punctuationErrorsOption: ConfigOption;
    spellingMistakesOption: ConfigOption;
    grammaticalErrorsOption: ConfigOption;
  };
}
