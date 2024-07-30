import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Response } from 'src/common/json.response.interface';
import { Test } from 'src/tests/interface/test.interface';
import * as xlsx from 'xlsx';
import { Answer } from './interface/answer.interface';
import {
  AlternativeKey,
  Question,
} from 'src/tests/interface/question.interface';
import { AnswerStatus } from './enums/question.status.enum';
import { TestStatus } from 'src/tests/enums/test.status.enum';
import { MarkConfig } from './interface/markingConfig.interface';
import { ConfigOption } from 'src/tests/enums/config.option.enum';
import * as ExcelJS from 'exceljs';
interface StudentScores {
  studentId: string;
  totalScore: string;
  isFlagged: boolean;
  [key: string]: number | string | boolean;
}
import { User } from 'src/users/interface/user.interface';

@Injectable()
export class AutoMarkService {
  async download(request: Request, id: string) {
    const test = await this.testModel.findById(id);
    if (
      test == null ||
      (!test.isPublished && test.developerId != request['user'].sub)
    ) {
      throw Error('Invalid Test or unauthorised');
    }
    const questionIds = test.questionIds;
    const questions = await this.questionModel.find({
      _id: { $in: questionIds },
    });
    const questionTitles = questions.map((q) => ({
      questionId: q._id.toString(),
      title: q.title,
    }));

    const answers = await this.answerModel.find({
      questionId: { $in: questionIds },
    });

    //create worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Scores');

    const columns = [
      'Student ID',
      ...questionTitles.map((qt) => qt.title),
      'Total',
    ];
    worksheet.addRow(columns);

    const studentScores = answers.reduce<{ [key: string]: StudentScores }>(
      (acc, answer) => {
        if (!acc[answer.name]) {
          acc[answer.name] = {
            studentId: answer.name,
            totalScore: '0',
            isFlagged: false,
          };
        }
        const questionTitle = questionTitles.find(
          (qt) => qt.questionId == answer.questionId,
        )?.title;
        if (questionTitle) {
          const scoreValue = answer.markGained;
          const scoredValue =
            answer.status === AnswerStatus.Flagged
              ? `${scoreValue}(flagged)`
              : scoreValue;

          // Assign the scored value to the corresponding question title
          acc[answer.name][questionTitle] = scoredValue;

          // Update the flag status only if the current answer is flagged
          if (answer.status === AnswerStatus.Flagged) {
            acc[answer.name].isFlagged = true;
          }

          // Update the total score, adding only the numeric part of the score
          const currentTotal = parseInt(acc[answer.name].totalScore) || 0;
          acc[answer.name].totalScore = `${currentTotal + scoreValue}`;
        }
        return acc;
      },
      {},
    );
    // After processing all answers, update the totalScore to include (flagged) if necessary
    Object.values(studentScores).forEach((student) => {
      if (student.isFlagged) {
        student.totalScore += '(flagged)';
      }
    });

    Object.values(studentScores).forEach((score: StudentScores) => {
      const row = columns.map((col) => {
        if (col === 'Total') {
          return score.totalScore.includes('(flagged)')
            ? score.totalScore
            : parseInt(score.totalScore);
        } else if (col === 'Student ID') {
          return score.studentId;
        } else {
          return score[col] || 0;
        }
      });
      worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
  async getMarkingReport(request: Request, id: string): Promise<Response<any>> {
    try {
      const test = await this.testModel.findById(id);
      if (
        test == null ||
        (!test.isPublished && test.developerId != request['user'].sub)
      ) {
        throw Error('Invalid Test or unauthorised');
      }
      if (
        test.status == TestStatus.Unmarked ||
        test.status == TestStatus.AutoMarking
      ) {
        return {
          statusCode: 200,
          message: null,
          data: {
            status: test.status,
            flagged: 0,
            completed: 0,
          },
        };
      }
      const questionIds = test.questionIds;
      let flagged = 0;
      let completed = 0;
      await this.answerModel
        .find({
          questionId: { $in: questionIds },
          status: AnswerStatus.Flagged,
        })
        .then((tests) => {
          flagged = tests.length;
        });
      await this.answerModel
        .find({
          questionId: { $in: questionIds },
          status: AnswerStatus.Completed,
        })
        .then((tests) => {
          completed = tests.length;
        });
      return {
        statusCode: 200,
        message: null,
        data: {
          status: test.status,
          flagged: flagged,
          completed: completed,
        },
      };
    } catch (error) {
      return {
        statusCode: -1,
        message: error['message'],
        data: null,
      };
    }
  }
  private spellChecker;
  private pluralize;
  constructor(
    @Inject('TEST_MODEL')
    private testModel: Model<Test>,
    @Inject('ANSWER_MODEL')
    private answerModel: Model<Answer>,
    @Inject('QUESTION_MODEL')
    private questionModel: Model<Question>,
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {
    this.initInstance();
  }
  private async initInstance(): Promise<void> {
    if (!this.spellChecker) {
      this.spellChecker = await import('spellchecker');
    }
    if (!this.pluralize) {
      this.pluralize = await import('pluralize');
    }
  }
  async autoMark(
    request: Request,
    file: Express.Multer.File,
    id: string,
  ): Promise<Response<any>> {
    try {
      //check testd
      const test = await this.testModel.findById(id);
      if (
        test == null ||
        (!test.isPublished && test.developerId != request['user'].sub)
      ) {
        throw Error('Invalid Test or unauthorised');
      }
      if (test.status != TestStatus.Unmarked) {
        throw Error('Test has been auto marked.');
      }
      //read excel file
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0]; // Assuming there's only one sheet
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[][] = xlsx.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
        blankrows: false,
      });
      const questionTitles = jsonData[0].slice(1); // Assuming the first row contains headers
      const dataRows = jsonData.slice(1); // All other rows
      //start transaction
      await this.answerModel.db.startSession().then(async (session) => {
        session.startTransaction();
        try {
          for (let i = 0; i < questionTitles.length; i++) {
            const title = questionTitles[i];
            const question = await this.questionModel
              .findOne({ title: title, testId: test.id })
              .session(session);
            if (!question) {
              throw new Error(`Question with title ${title} does not exist`);
            }

            for (let j = 0; j < dataRows.length; j++) {
              const studentId = dataRows[j][0];
              const answerText = dataRows[j][i + 1];
              // Logger.log(
              //   'Question:' +
              //     title +
              //     ', student ID:' +
              //     studentId +
              //     ', answer:' +
              //     answerText,
              // );
              const answer = new this.answerModel({
                name: `${studentId}`,
                questionId: question._id,
                markGained: 0,
                answer: answerText,
                status: AnswerStatus.Unmarked,
              });
              await answer.save({ session });
            }
          }
          await this.testModel
            .updateOne(
              { _id: id },
              { $set: { status: TestStatus.AutoMarking } },
            )
            .session(session);
          await session.commitTransaction();
          //start automarking here
          this.automarking(test);
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      });

      return {
        statusCode: 200,
        message: 'Success',
        data: null,
      };
    } catch (err) {
      return {
        statusCode: -1,
        message: err['message'],
        data: null,
      };
    }
  }
  async automarking(test: Test) {
    const questionIds = test.questionIds;
    const questions: Question[] = await this.questionModel.find({
      _id: { $in: questionIds },
    });
    let hasFlaggedAnswer = false;
    for (const question of questions) {
      const answers = await this.answerModel.find({ questionId: question._id });
      const ratingScale = question.ratingScale;
      const keys = Array.from(ratingScale.keys()).map(Number);
      const maxScore = Math.max(...keys);

      for (const answer of answers) {
        const score = this.scoreAnswer(
          answer.answer,
          question.keys,
          test.markConfig,
          maxScore,
        );
        // Logger.log('answer:' + answer.answer + ',score:' + score);
        if (score == -1) {
          hasFlaggedAnswer = true;
          await this.answerModel.updateOne(
            { _id: answer._id },
            { $set: { markGained: 0, status: AnswerStatus.Flagged } },
          );
        } else {
          await this.answerModel.updateOne(
            { _id: answer._id },
            { $set: { markGained: score, status: AnswerStatus.Completed } },
          );
        }
      }
    }
    if (hasFlaggedAnswer) {
      await this.testModel.updateOne(
        { _id: test._id },
        { $set: { status: TestStatus.Flagged } },
      );
    } else {
      await this.testModel.updateOne(
        { _id: test._id },
        { $set: { status: TestStatus.Completed } },
      );
    }
  }

  scoreAnswer(
    answer: string,
    keys: any[],
    markingOptions: MarkConfig,
    maxScore: number,
  ): number {
    if (answer == null || answer.length == 0) return 0;
    const isCorrect = this.checkAns(keys, answer);
    let score = isCorrect == true ? maxScore : 0;
    //find specific reasons
    if (isCorrect == false) {
      //case
      const normalizedAnswer = answer.toLowerCase();
      const keysWithLocerCases = this.processKeysToLowerCase(keys);
      if (this.checkAns(keysWithLocerCases, normalizedAnswer)) {
        if (markingOptions.caseMistakesOption === ConfigOption.Flag) {
          // Logger.log('Case Flagged');
          score = -1;
        } else if (
          markingOptions.caseMistakesOption == ConfigOption.Incorrect
        ) {
          // Logger.log('Case error');
          return 0;
        }
      }
      //punctuation
      const answerWithoutPunctuation = this.removePunctuation(answer);
      const keysWithoutPunctuation = keys.map((key) => ({
        ...key,
        key: this.removePunctuation(key.key),
        alternativeKeys: new Map(
          Array.from(key.alternativeKeys.entries()).map(
            ([word, alternatives]) => [
              this.removePunctuation(word),
              alternatives.map(this.removePunctuation),
            ],
          ),
        ),
      }));
      if (this.checkAns(keysWithoutPunctuation, answerWithoutPunctuation)) {
        if (markingOptions.punctuationMistakesOption === ConfigOption.Flag) {
          score = -1;
          // Logger.log('Punctuation Flagged');
        } else if (
          markingOptions.punctuationMistakesOption === ConfigOption.Incorrect
        ) {
          // Logger.log('Punctuation error');
          return 0;
        }
      }
      //check spelling
      const words = answer.split(/\s+/);
      let correctSpell = true;
      for (const word of words) {
        const isMisspelled = this.spellChecker.isMisspelled(word.toLowerCase());
        let foundInKeys = false;
        for (const key of keys) {
          if (this.containsWordInKeyAndAlternatives(key, word)) {
            foundInKeys = true;
            break;
          }
        }
        if (isMisspelled && !foundInKeys) {
          correctSpell = false;
          // Logger.log('Spelling mistakes:' + word);
        }
      }

      if (!correctSpell) {
        if (markingOptions.spellingMistakesOption === ConfigOption.Flag) {
          score = -1;
          // Logger.log('Spelling Mistakes Flagged');
        } else if (
          markingOptions.spellingMistakesOption === ConfigOption.Incorrect
        ) {
          // Logger.log('Spelling Mistakes error');
          return 0;
        }
      }
      //check grammar see if key and answer are the same when they are all converted to a singular form.
      if (this.checkPlural(keys, answer)) {
        if (markingOptions.grammaticalErrorsOption === ConfigOption.Flag) {
          score = -1;
          // Logger.log('Grammatical Mistakes Flagged');
        } else if (
          markingOptions.grammaticalErrorsOption === ConfigOption.Incorrect
        ) {
          // Logger.log('Grammatical Mistakes error');
          return 0;
        }
      }
      //contraction - just a rough check
      if (answer.includes("'")) {
        if (markingOptions.contractionMistakesOption === ConfigOption.Flag) {
          score = -1;
          // Logger.log('Contraction Flagged');
        } else if (
          markingOptions.contractionMistakesOption === ConfigOption.Incorrect
        ) {
          // Logger.log('Contraction error');
          return 0;
        }
      }
    }

    return score;
  }

  checkPlural(keys: any[], answer: string): boolean {
    let isCorrect = false;

    for (const key of keys) {
      let regexString = this.escapeRegExp(
        key.key.replace(/[.*+?^${}()|[\]\\]/g, ''),
      ); // Start with the original key string

      // Convert the original key to its singular form
      regexString = this.pluralize.singular(regexString);

      // Check if alternativeKeys exists and is a Map
      if (key.alternativeKeys instanceof Map) {
        key.alternativeKeys.forEach((alternatives, word) => {
          // Convert each word and its alternatives to their singular form
          const singularAlternatives = alternatives.map((alternative) =>
            this.pluralize.singular(alternative),
          );
          const singularWord = this.pluralize.singular(word);

          // Create a regex pattern that matches the singular word and its singular alternatives
          const alternativesRegex = `(${[singularWord, ...singularAlternatives].map(this.escapeRegExp).join('|')})`;

          // Replace the word in the key string with the alternatives regex
          regexString = regexString.replace(
            new RegExp(`\\b${this.escapeRegExp(singularWord)}\\b`, 'g'),
            alternativesRegex,
          );
        });
      }

      // Convert the modified string into a regex
      const regex = new RegExp(`^${regexString}$`, 'i');

      // Convert the answer to its singular form before testing
      const singularAnswer = this.pluralize.singular(answer);
      // Check if the singular form of the answer matches the regex
      if (regex.test(singularAnswer)) {
        isCorrect = true;
        break; // Assume the highest score if any key matches
      }
    }
    return isCorrect;
  }
  checkAns(keys: any[], answer: string): boolean {
    let isCorrect = false;

    // Iterate over each key
    for (const key of keys) {
      let regexString = this.escapeRegExp(key.key); // Start with the original key string

      // Check if alternativeKeys exists and is a Map
      if (key.alternativeKeys instanceof Map) {
        key.alternativeKeys.forEach((alternatives, word) => {
          // Create a regex pattern that matches the word and its alternatives
          const alternativesRegex = `(${[word, ...alternatives].map(this.escapeRegExp).join('|')})`;
          // Replace the word in the key string with the alternatives regex
          regexString = regexString.replace(
            new RegExp(`\\b${this.escapeRegExp(word)}\\b`, 'g'),
            alternativesRegex,
          );
        });
      }

      // Convert the modified string into a regex
      const regex = new RegExp(`^${regexString}$`, 'i');
      // Check if the answer matches the regex
      if (regex.test(answer)) {
        isCorrect = true;
        break; // Assume the highest score if any key matches
      }
    }
    return isCorrect;
  }
  escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
  }
  removePunctuation(text) {
    return text.replace(/[\.,\/#!$%\^&\*;:{}=\-_`~()\[\]\"\'\?<>\\|@]/g, '');
  }

  processKeysToLowerCase(keys: AlternativeKey[]): AlternativeKey[] {
    return keys.map((keyObject) => {
      const lowerKey = keyObject.key.toLowerCase();

      const lowerAlternativeKeys = new Map<string, string[]>();

      if (keyObject.alternativeKeys) {
        keyObject.alternativeKeys.forEach((values, key) => {
          lowerAlternativeKeys.set(
            key.toLowerCase(),
            values.map((value) => value.toLowerCase()),
          );
        });
      }
      return {
        key: lowerKey,
        alternativeKeys: lowerAlternativeKeys,
      };
    });
  }

  containsWordInKeyAndAlternatives(key, searchWord) {
    const escapedWord = this.escapeRegExp(searchWord);
    const wordRegex = new RegExp(`\\b${escapedWord}\\b`, 'i');

    if (wordRegex.test(key.key)) {
      return true;
    }

    if (key.alternativeKeys instanceof Map) {
      for (const [word, alternatives] of key.alternativeKeys) {
        // check word itself
        if (wordRegex.test(word)) {
          return true;
        }
        // check alternativeKeys
        for (const alternative of alternatives) {
          if (wordRegex.test(alternative)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  async getMarkerList() {
    try {
      const markers = await this.userModel.find(
        { roles: { $in: ['marker'] } },
        { _id: 1, username: 1 },
      );

      return {
        statusCode: 200,
        message: 'marker list fetched successfully',
        data: markers,
      };
    } catch (error) {
      return {
        statusCode: -1,
        message: error['message'],
        data: null,
      };
    }
  }
}
