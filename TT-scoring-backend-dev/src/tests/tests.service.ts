import { Inject, Injectable, Logger } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { Test } from './interface/test.interface';
import { Question } from './interface/question.interface';
import { TestDto } from 'src/dto/test.dto';
import { KeysDto } from 'src/dto/keys.dto';
import { TestStatus } from './enums/test.status.enum';
import { spawn } from 'child_process';
import * as xlsx from 'xlsx';
import { ConfigOption } from './enums/config.option.enum';
import { TestDetail } from './interface/testDetail.interface';
import { Response } from 'src/common/json.response.interface';
import { AssignMarkerDto } from 'src/dto/assign.marker.dto';
import { User } from 'src/users/interface/user.interface';
import { UserRole } from 'src/users/enums/user-role.enum';

/**
 * Test management service that handles CRUD operations for tests
 * Provides functionality for creating, editing, deleting, and managing tests
 * Includes features for importing tests from Excel files and generating alternative answer keys
 */
@Injectable()
export class TestsService {
  private readonly logger = new Logger(TestsService.name);
  
  constructor(
    @Inject('TEST_MODEL')
    private testModel: Model<Test>,
    @Inject('QUESTION_MODEL')
    private questionModel: Model<Question>,
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  /**
   * Saves or updates a test with proper authorization checks
   * Test developers can only edit published tests or tests created by themselves
   * @param request - HTTP request object containing user information
   * @param testDto - Test data transfer object with test information
   * @returns Promise with saved test details or error response
   */
  async saveTest(
    request: Request,
    testDto: TestDto,
  ): Promise<Response<{ test: TestDetail }>> {
    // Validate required fields
    if (testDto.name == null || testDto.name == '') {
      return {
        statusCode: -1,
        message: 'Test name cannot be empty',
        data: null,
      };
    }
    
    // Start database transaction for data consistency
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Check if test exists for updates
      let test: Test;
      if (testDto._id != null) {
        test = await this.testModel.findById(testDto._id);
        // Security check: ensure unpublished tests belong to the requesting user
        if (
          test != null &&
          !test.isPublished &&
          test.developerId != request['user'].sub
        ) {
          throw Error('Test not found or unauthorised');
        }
      }

      const newQuestionIds = [];
      const oldQuestionIds = test ? test.questionIds : [];
      
      if (test) {
        // Update existing test - preserve status and developer ID
        test = await this.testModel
          .findOneAndUpdate(
            { _id: testDto._id },
            {
              $set: {
                name: testDto.name,
                questionIds: oldQuestionIds,
                markConfig: testDto.markConfig,
                isPublished: testDto.isPublished,
              },
            },
            { new: true, session, upsert: true, runValidators: true },
          )
          .session(session);
      } else {
        // Create new test with initial unmarked status
        [test] = await this.testModel.create(
          [
            {
              name: testDto.name,
              questionIds: newQuestionIds,
              markConfig: testDto.markConfig,
              status: TestStatus.Unmarked,
              isPublished: testDto.isPublished,
              developerId: request['user'].sub,
            },
          ],
          {
            session,
          },
        );
      }

      // handle questions
      for (const question of testDto.questionIds) {
        let questionDoc;
        //assign test id to questions
        question.testId = test._id.toString();
        if (test != null && mongoose.isValidObjectId(question._id)) {
          const existsInDatabase = await this.questionModel.exists({
            _id: question._id,
          });
          //if the question exists, update the question.
          if (
            existsInDatabase &&
            oldQuestionIds.includes(question._id.toString())
          ) {
            questionDoc = await this.questionModel.findOneAndUpdate(
              { _id: question._id },
              question,
              { new: true, session, runValidators: true },
            );
          } else {
            // Security check: Question ID exists but this question is not belong to this test
            // then create a new question
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id, ...questionWithoutId } = question;
            [questionDoc] = await this.questionModel.create(
              [questionWithoutId],
              { session },
            );
          }
        } else {
          // Create new question if test is new or question._id is not valid
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, ...questionWithoutId } = question;
          [questionDoc] = await this.questionModel.create([questionWithoutId], {
            session,
          });
        }
        newQuestionIds.push(questionDoc._id.toString());
      }
      // Find and remove questions that are no longer needed
      const questionIdsToRemove = oldQuestionIds.filter(
        (oldId) =>
          !newQuestionIds
            .map((id) => id.toString())
            .includes(oldId.toString().trim()),
      );
      if (questionIdsToRemove.length > 0) {
        await this.questionModel
          .deleteMany({ _id: { $in: questionIdsToRemove } })
          .session(session);
      }
      //update question ids for the test
      await this.testModel.updateOne(
        { _id: test._id },
        { $set: { questionIds: newQuestionIds } },
        { session: session },
      );

      // get test and sort questions by title
      const newTest = (await this.testModel
        .findById(test._id)
        .session(session)
        .populate({
          path: 'questionIds',
          options: { sort: { title: 1 } },
        })) as unknown as TestDetail;

      // submit transaction
      await session.commitTransaction();

      return {
        statusCode: 200,
        message: 'Success',
        data: {
          test: newTest,
        },
      };
    } catch (error) {
      // roll back
      await session.abortTransaction();
      return {
        statusCode: -1,
        message: 'Failed to save test: ' + error,
        data: null,
      };
    } finally {
      // end session
      session.endSession();
    }
  }

  /**
   * fetch all tests that are either published or are unpublished but belong to a specific test developer
   * @param request request Request with the jwt token
   * @returns
   */
  async getTests(request: Request): Promise<Response<any>> {
    const developerId = request['user'].sub;
    return {
      statusCode: 200,
      message: null,
      data: await this.testModel.find({
        $or: [
          { isPublished: true },
          { isPublished: false, developerId: developerId },
        ],
      }),
    };
  }

  /**
   * An unpublished test is only visible to the test developer who created it.
   * @param request Request with the jwt token
   * @returns
   */
  async getTestById(
    request: Request,
    id: string,
  ): Promise<Response<TestDetail>> {
    const developerId = request['user'].sub;
    if (!mongoose.isValidObjectId(id)) {
      return {
        statusCode: -1,
        message: 'Invalid Test',
        data: null,
      };
    }

    const test = (await this.testModel
      .findOne({
        _id: id,
      })
      .populate({
        path: 'questionIds',
        options: { sort: { title: 1 } },
      })) as unknown as TestDetail;

    if (!test) {
      // Correctly checking if the test is null
      return {
        statusCode: -1,
        message: 'Test not found',
        data: null,
      };
    }

    if (!test.isPublished && test.developerId.toString() !== developerId) {
      return {
        statusCode: -1,
        message: 'No permission',
        data: null,
      };
    }

    return {
      statusCode: 200,
      message: null,
      data: test,
    };
  }

  /**
   * Test developer can only delete the tests created by themselves
   * @param request Request with the jwt token
   * @param id The id of the test
   * @returns
   */
  async deleteTestById(request: Request, id: string): Promise<Response<any>> {
    const developerId = request['user'].sub;
    if (!mongoose.isValidObjectId(id)) {
      return {
        statusCode: -1,
        message: 'Invalid Test',
        data: null,
      };
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // delete test
      const deleteResult = await this.testModel.deleteOne(
        { _id: id, developerId: developerId },
        { session },
      );
      if (deleteResult.deletedCount === 0) {
        throw new Error('Test not found or unauthorized');
      }
      // delete question
      await this.questionModel.deleteMany({ testId: id }, { session });

      await session.commitTransaction();

      return {
        statusCode: 200,
        message: 'Deletion successful',
        data: null,
      };
    } catch (error) {
      // roll back
      await session.abortTransaction();
      return {
        statusCode: -1,
        message: 'Failed to delete test: ' + error,
        data: null,
      };
    } finally {
      // end
      session.endSession();
    }
  }

  /**
   * Test developer can only duplicate the published test or tests created by themselves.
   * @param request request Request with the jwt token
   * @param id id The id of the test
   * @returns
   */
  async duplicateTestById(
    request: Request,
    id: string,
  ): Promise<Response<any>> {
    const developerId = request['user'].sub;
    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      const originalTest = await this.testModel
        .findOne({
          _id: id,
        })
        .session(session);
      //Security check
      //if test deos not exist or the test is not published and this developer is not who created it, return error
      if (
        !originalTest ||
        (!originalTest.isPublished &&
          originalTest.developerId.toString() != developerId.toString())
      ) {
        await session.abortTransaction();
        session.endSession();
        return {
          statusCode: -1,
          message: 'Test not found or unauthorized',
          data: null,
        };
      }

      // copy new test
      const newTest = new this.testModel({
        ...originalTest.toObject(),
        _id: new mongoose.Types.ObjectId(),
        name: 'Duplicate of ' + originalTest.name + ' ' + Date.now(),
        questionIds: [],
        status: TestStatus.Unmarked,
        isPublished: false,
      });
      await newTest.save({ session });

      // copy all questions
      const questions = await this.questionModel
        .find({ testId: originalTest._id })
        .session(session);
      const newQuestionIds = [];
      for (const question of questions) {
        const newQuestion = new this.questionModel({
          ...question.toObject(),
          _id: new mongoose.Types.ObjectId(),
          testId: newTest._id,
        });
        await newQuestion.save({ session });
        newQuestionIds.push(newQuestion._id);
      }
      //update test's questionIds
      await this.testModel.findByIdAndUpdate(
        newTest._id,
        {
          $set: { questionIds: newQuestionIds },
        },
        { session },
      );
      await session.commitTransaction();
      session.endSession();

      return {
        statusCode: 200,
        message: 'Test duplicated successfully',
        data: { newTestId: newTest._id },
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return {
        statusCode: -1,
        message: 'Failed to duplicate test: ' + error,
        data: null,
      };
    }
  }

  async generateAlternativeKeys(keysDto: KeysDto): Promise<any> {
    if (keysDto.keys == null) {
      return {
        statusCode: -1,
        message: 'Invalid keys',
        data: null,
      };
    }
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('./python/venv/bin/python3', [
        './python/generateKeys.py',
      ]);

      let data = '';
      pythonProcess.stdout.on('data', (chunk) => {
        data += chunk.toString();
      });

      let error = '';
      pythonProcess.stderr.on('data', (chunk) => {
        error += chunk.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script exited with code ${code}: ${error}`));
          return;
        } else {
          try {
            const result = JSON.parse(data);
            resolve({
              statusCode: 200,
              message: 'Success',
              data: result,
            });
          } catch (err) {
            reject(err);
          }
        }
      });

      pythonProcess.stdin.write(JSON.stringify(keysDto));
      pythonProcess.stdin.end();
    });
  }

  /**
   * Import Test Excel File
   * @param file must be an xlsx file
   * @param name
   * @returns
   */
  async importTest(
    file: Express.Multer.File,
    name: string,
  ): Promise<Response<TestDetail>> {
    try {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0]; // Assuming there's only one sheet
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);
      //check if the file is valid
      //at least two rows: first row is the header
      if (!jsonData || jsonData.length < 2) {
        return {
          statusCode: -1,
          message: 'Excel file must have at least 2 rows of data',
          data: null,
        };
      }
      //at least two columns: the first column is question no.
      if (Object.keys(jsonData[0]).length < 3) {
        return {
          statusCode: -1,
          message: 'Excel file must have at least three columns of data',
          data: null,
        };
      }
      // Process the JSON data as needed
      const questions: Question[] = jsonData.map((item: any) => {
        const itemKeys = Object.keys(item);
        const lastKey = itemKeys[itemKeys.length - 1]; // Get the last key
        const ratingScaleString = item[lastKey]; // Access the value of the last column
        // Process the ratingScale
        const ratingScale = {};
        if (ratingScaleString && typeof ratingScaleString === 'string') {
          // Split the string by line breaks to handle multiple entries if present
          ratingScaleString.split('\n').forEach((pair) => {
            const [key, value] = pair.split('–').map((part) => part.trim());
            ratingScale[key] = value;
          });
        }
        const keysData = itemKeys.slice(1, itemKeys.length - 1).map((key) => {
          const keyText = item[key];
          const words = keyText.split(' ').map((part) => part.trim());
          const newKey = [];
          const alternativeKeys = words.reduce((acc, word) => {
            if (word.includes('/')) {
              // keyTextPart1 is the first part of the split word after trimming and removing punctuation
              // rest contains the remaining parts of the split word
              const parts = word.split('/').map((part) => part.trim());
              // get punctuation
              const lastPart = parts[parts.length - 1].replace(/[\w\s]/g, '');
              //remove punctuation
              const [keyTextPart1, ...rest] = parts.map((part) =>
                part.replace(/[^\w\s]/g, ''),
              );
              // add new key
              newKey.push(keyTextPart1 + lastPart);
              acc[keyTextPart1] = rest.filter((item) => item.trim().length > 0);
            } else {
              newKey.push(word);
            }
            return acc;
          }, {});
          const newKeyString = newKey.join(' ');
          return {
            key: newKeyString,
            alternativeKeys: alternativeKeys,
          };
        });
        return {
          title: item[Object.keys(item)[0]],
          keys: keysData.flat(1),
          ratingScale: ratingScale,
        } as Question;
      });
      return {
        statusCode: 200,
        message: 'File uploaded successfully',
        data: {
          name: name,
          questionIds: questions,
          //default values
          isPublished: false,
          _id: null,
          developerId: null,
          markConfig: {
            caseMistakesOption: ConfigOption.Incorrect,
            contractionMistakesOption: ConfigOption.Incorrect,
            spellingMistakesOption: ConfigOption.Incorrect,
            punctuationMistakesOption: ConfigOption.Incorrect,
            grammaticalErrorsOption: ConfigOption.Incorrect,
          },
        },
      };
    } catch (exception) {
      return {
        statusCode: -1,
        message: 'Invalid Excel File or format',
        data: null,
      };
    }
  }
  async assignMarker(request: Request, assignMakerDto: AssignMarkerDto) {
    try {
      if (assignMakerDto.markerId == null) {
        throw Error('Invalid marker id');
      }
      const test = await this.testModel.findById(assignMakerDto.testId);
      //Security check: check if the unpublished test belongs to this test developer
      if (
        test != null &&
        !test.isPublished &&
        test.developerId != request['user'].sub
      ) {
        throw Error('Test not found or unauthorised');
      }
      const marker = await this.userModel.findById(assignMakerDto.markerId);
      if (!marker.roles.includes(UserRole.Marker)) {
        throw Error('The user is not a marker');
      }
      await this.testModel.updateOne(
        { _id: test.id },
        { $set: { markedBy: marker.id } },
      );
      return {
        statusCode: 200,
        message: 'Success',
        data: null,
      };
    } catch (error) {
      return {
        statusCode: -1,
        message: 'Failed to assign marker: ' + error,
        data: null,
      };
    }
  }
}
