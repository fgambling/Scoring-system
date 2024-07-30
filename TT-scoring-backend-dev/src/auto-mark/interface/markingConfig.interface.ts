import { ConfigOption } from 'src/tests/enums/config.option.enum';

export interface MarkConfig {
  caseMistakesOption: ConfigOption;
  contractionMistakesOption: ConfigOption;
  punctuationMistakesOption: ConfigOption;
  spellingMistakesOption: ConfigOption;
  grammaticalErrorsOption: ConfigOption;
}
