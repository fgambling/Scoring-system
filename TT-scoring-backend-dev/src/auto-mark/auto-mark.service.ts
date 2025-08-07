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
import { AwsService } from '../aws/aws.service';

/**
 * Interface for student score data structure
 */
interface StudentScores {
  studentId: string;
  totalScore: string;
  isFlagged: boolean;
  [key: string]: number | string | boolean;
}

import { User } from 'src/users/interface/user.interface';

/**
 * Automatic marking service that handles automated test scoring
 * Provides functionality for scoring answers, downloading results, and managing marking reports
 * Integrated with AWS services for file storage and monitoring
 */
@Injectable()
export class AutoMarkService {
  /**
   * Downloads test results as an Excel file
   * @param request - HTTP request object containing user information
   * @param id - Test ID to download results for
   * @returns Excel file buffer containing student scores
   */
  async download(request: Request, id: string) {
    // Verify test exists and user has permission to access it
    const test = await this.testModel.findById(id);
    if (
      test == null ||
      (!test.isPublished && test.developerId != request['user'].sub)
    ) {
      throw Error('Invalid Test or unauthorised');
    }
    
    // Get question information for the test
    const questionIds = test.questionIds;
    const questions = await this.questionModel.find({
      _id: { $in: questionIds },
    });
    const questionTitles = questions.map((q) => ({
      questionId: q._id.toString(),
      title: q.title,
    }));

    // Get all answers for the test questions
    const answers = await this.answerModel.find({
      questionId: { $in: questionIds },
    });

    // Create Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Scores');

    // Define column headers
    const columns = [
      'Student ID',
      ...questionTitles.map((qt) => qt.title),
      'Total',
    ];
    worksheet.addRow(columns);

    // Process student scores from answers
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
    
    // Mark total score as flagged if any answer is flagged
    Object.values(studentScores).forEach((student) => {
      if (student.isFlagged) {
        student.totalScore += '(flagged)';
      }
    });

    // Add student score rows to worksheet
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

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Upload to S3 if AWS is configured
    if (process.env.AWS_S3_BUCKET) {
      try {
        const s3Key = this.awsService.generateS3Key('results', `test-${id}-results.xlsx`);
        await this.awsService.uploadToS3(buffer, s3Key);
        
        // Send CloudWatch metric for download
        await this.awsService.sendMetric(
          'ScoringSystem',
          'TestResultsDownloaded',
          1,
          'Count'
        );
        
        // Send SNS notification
        await this.awsService.sendNotification(
          `Test results downloaded for test: ${test.name}`,
          'Test Results Downloaded',
        );
      } catch (error) {
        console.error('AWS integration error:', error);
        // Continue with local buffer if AWS fails
      }
    }
    
    return buffer;
  }

  /**
   * Gets marking report with statistics for a test
   * @param request - HTTP request object
   * @param id - Test ID
   * @returns Marking report with status and statistics
   */
  async getMarkingReport(request: Request, id: string): Promise<Response<any>> {
    try {
      // Verify test exists and user has permission
      const test = await this.testModel.findById(id);
      if (
        test == null ||
        (!test.isPublished && test.developerId != request['user'].sub)
      ) {
        throw Error('Invalid Test or unauthorised');
      }
      
      // Return early if test is not marked yet
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
      
      // Count flagged and completed answers
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

  // Private property for pluralization
  private pluralize;

  /**
   * Constructor initializes database models and external libraries
   */
  constructor(
    @Inject('TEST_MODEL')
    private testModel: Model<Test>,
    @Inject('ANSWER_MODEL')
    private answerModel: Model<Answer>,
    @Inject('QUESTION_MODEL')
    private questionModel: Model<Question>,
    @Inject('USER_MODEL')
    private userModel: Model<User>,
    private readonly awsService: AwsService,
  ) {
    this.initInstance();
  }

  /**
   * Initializes pluralization library
   */
  private async initInstance(): Promise<void> {
    if (!this.pluralize) {
      this.pluralize = await import('pluralize');
    }
  }

  /**
   * Initiates automatic marking process for a test
   * @param request - HTTP request object
   * @param file - Excel file containing student answers
   * @param id - Test ID
   * @returns Success or error response
   */
  async autoMark(
    request: Request,
    file: Express.Multer.File,
    id: string,
  ): Promise<Response<any>> {
    try {
      // Verify test exists and user has permission
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
      
      // Read and parse Excel file
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0]; // Assuming there's only one sheet
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[][] = xlsx.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
        blankrows: false,
      });
      const questionTitles = jsonData[0].slice(1); // First row contains headers
      const dataRows = jsonData.slice(1); // All other rows contain student data
      
      // Start database transaction for data consistency
      await this.answerModel.db.startSession().then(async (session) => {
        session.startTransaction();
        try {
          // Process each question and student answer
          for (let i = 0; i < questionTitles.length; i++) {
            const title = questionTitles[i];
            const question = await this.questionModel
              .findOne({ title: title, testId: test.id })
              .session(session);
            if (!question) {
              throw new Error(`Question with title ${title} does not exist`);
            }

            // Process each student's answer for this question
            for (let j = 0; j < dataRows.length; j++) {
              const studentId = dataRows[j][0];
              const answerText = dataRows[j][i + 1];
              
              // Create answer record in database
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
          
          // Update test status to AutoMarking
          await this.testModel
            .updateOne(
              { _id: id },
              { $set: { status: TestStatus.AutoMarking } },
            )
            .session(session);
          await session.commitTransaction();
          
          // Start the actual marking process
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

  /**
   * Performs the actual automatic marking of all answers for a test
   * @param test - Test object to mark
   */
  async automarking(test: Test) {
    const questionIds = test.questionIds;
    const questions: Question[] = await this.questionModel.find({
      _id: { $in: questionIds },
    });
    let hasFlaggedAnswer = false;
    
    // Process each question
    for (const question of questions) {
      const answers = await this.answerModel.find({ questionId: question._id });
      const ratingScale = question.ratingScale;
      const keys = Array.from(ratingScale.keys()).map(Number);
      const maxScore = Math.max(...keys);

      // Score each answer
      for (const answer of answers) {
        const score = await this.scoreAnswer(
          answer.answer,
          question.keys,
          test.markConfig,
          maxScore,
        );
        
        // Update answer with score and status
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
    
    // Update test status based on whether any answers were flagged
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

  /**
   * Scores a single answer based on marking configuration
   * @param answer - Student's answer text
   * @param keys - Correct answer keys with alternatives
   * @param markingOptions - Marking configuration options
   * @param maxScore - Maximum possible score for this question
   * @returns Score (0 to maxScore) or -1 if flagged
   */
  async scoreAnswer(
    answer: string,
    keys: any[],
    markingOptions: MarkConfig,
    maxScore: number,
  ): Promise<number> {
    if (answer == null || answer.length == 0) return 0;
    
    const isCorrect = this.checkAns(keys, answer);
    let score = isCorrect == true ? maxScore : 0;
    
    // Apply marking rules if answer is incorrect
    if (isCorrect == false) {
      // Check case sensitivity
      const normalizedAnswer = answer.toLowerCase();
      const keysWithLocerCases = this.processKeysToLowerCase(keys);
      if (this.checkAns(keysWithLocerCases, normalizedAnswer)) {
        if (markingOptions.caseMistakesOption === ConfigOption.Flag) {
          score = -1;
        } else if (
          markingOptions.caseMistakesOption == ConfigOption.Incorrect
        ) {
          return 0;
        }
      }
      
      // Check punctuation
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
        } else if (
          markingOptions.punctuationMistakesOption === ConfigOption.Incorrect
        ) {
          return 0;
        }
      }
      
      // Check spelling using cspell
      const words = answer.split(/\s+/);
      let correctSpell = true;
      for (const word of words) {
        // Use cspell to check spelling
        const spellCheckResult = await import('cspell-lib').then(
          (cspell) => cspell.spellCheckDocument(
            { uri: 'temp', text: word },
            {},
            {}
          )
        );
        const isMisspelled = spellCheckResult.issues.length > 0;
        
        let foundInKeys = false;
        for (const key of keys) {
          if (this.containsWordInKeyAndAlternatives(key, word)) {
            foundInKeys = true;
            break;
          }
        }
        if (isMisspelled && !foundInKeys) {
          correctSpell = false;
        }
      }

      if (!correctSpell) {
        if (markingOptions.spellingMistakesOption === ConfigOption.Flag) {
          score = -1;
        } else if (
          markingOptions.spellingMistakesOption === ConfigOption.Incorrect
        ) {
          return 0;
        }
      }
      
      // Check grammar (plural/singular forms)
      if (this.checkPlural(keys, answer)) {
        if (markingOptions.grammaticalErrorsOption === ConfigOption.Flag) {
          score = -1;
        } else if (
          markingOptions.grammaticalErrorsOption === ConfigOption.Incorrect
        ) {
          return 0;
        }
      }
      
      // Check contractions
      if (answer.includes("'")) {
        if (markingOptions.contractionMistakesOption === ConfigOption.Flag) {
          score = -1;
        } else if (
          markingOptions.contractionMistakesOption === ConfigOption.Incorrect
        ) {
          return 0;
        }
      }
    }

    return score;
  }

  /**
   * Checks if answer matches any key when converted to singular form
   * @param keys - Answer keys
   * @param answer - Student answer
   * @returns True if answer matches in singular form
   */
  checkPlural(keys: any[], answer: string): boolean {
    let isCorrect = false;

    for (const key of keys) {
      let regexString = this.escapeRegExp(
        key.key.replace(/[.*+?^${}()|[\]\\]/g, ''),
      );

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
        break;
      }
    }
    return isCorrect;
  }

  /**
   * Checks if answer matches any key exactly
   * @param keys - Answer keys with alternatives
   * @param answer - Student answer
   * @returns True if answer matches any key
   */
  checkAns(keys: any[], answer: string): boolean {
    let isCorrect = false;

    // Iterate over each key
    for (const key of keys) {
      let regexString = this.escapeRegExp(key.key);

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
        break;
      }
    }
    return isCorrect;
  }

  /**
   * Escapes special regex characters in a string
   * @param text - Text to escape
   * @returns Escaped text
   */
  escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Removes punctuation from text
   * @param text - Text to process
   * @returns Text without punctuation
   */
  removePunctuation(text) {
    return text.replace(/[\.,\/#!$%\^&\*;:{}=\-_`~()\[\]\"\'\?<>\\|@]/g, '');
  }

  /**
   * Converts all keys to lowercase for case-insensitive comparison
   * @param keys - Original keys
   * @returns Keys converted to lowercase
   */
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

  /**
   * Checks if a word exists in the key or its alternatives
   * @param key - Answer key
   * @param searchWord - Word to search for
   * @returns True if word is found in key or alternatives
   */
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

  /**
   * Gets list of available markers (users with marker role)
   * @returns List of marker users
   */
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
