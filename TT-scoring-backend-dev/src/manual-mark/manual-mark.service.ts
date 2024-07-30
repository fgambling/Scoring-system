import { Inject, Injectable, Logger, NotFoundException} from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { Test } from 'src/tests/interface/test.interface';
import { Question } from 'src/tests/interface/question.interface';
import { Answer } from 'src/auto-mark/interface/answer.interface'

@Injectable()
export class ManualMarkService {
    private readonly logger = new Logger(ManualMarkService.name);
    constructor(
        @Inject('TEST_MODEL')
        private testModel: Model<Test>,
        @Inject('QUESTION_MODEL')
        private questionModel: Model<Question>,
        @Inject('ANSWER_MODEL')
        private answerModel: Model<Answer>,
    ) {}

    async findQuestionsAndAnswersForUser(userId: string): Promise<any> {
        const tests = await this.testModel.find({ markedBy: userId, isPublished: true, status: "auto mark flagged" });

        if (!tests.length) {
            return [];
        }

        const questionIds = tests.flatMap(test => test.questionIds);
        const questions = await this.questionModel.find({ _id: { $in: questionIds } });
        const answers = await this.answerModel.find({ questionId: { $in: questionIds }, status: "flagged" });

        const questionToAnswersMap = answers.reduce((map, answer) => {
            if (!map[answer.questionId]) {
              map[answer.questionId] = [];
            }
            map[answer.questionId].push({
              answer_id: answer._id.toString(),
              name: answer.name,
              answer_value: answer.answer
            });
            return map;
        }, {});

        const testList = tests.map(test => ({
            test_id: test._id.toString(),
            test_name: test.name,
            developId: test.developerId,
            questions: test.questionIds.map(questionId => {
              const question = questions.find(q => q._id.toString() === questionId.toString());
              const simplifiedKeys = question.keys.map(keyItem => keyItem.key);
              return {
                question_id: questionId.toString(),
                question_title: question.title,
                question_keys: simplifiedKeys,
                answers: questionToAnswersMap[questionId] || []
              };
            })
        }));
        return testList;
    }

    async updateAnswerMark(answerId: string, newMark: number): Promise<any> {
        const answer = await this.answerModel.findByIdAndUpdate(
            answerId,
            { markGained: newMark, status: 'completed' },
            { new: true }
        );
      
    
        if (!answer) {
          throw new NotFoundException('Answer not found.');
        }
    
        const question = await this.questionModel.findById(answer.questionId);
        if (!question) {
            throw new NotFoundException('Question not found for the given answer.');
        }

        // Find the test that contains this question's ID in its array of questionIds
        const test = await this.testModel.findOne({ questionIds: question._id });
        if (!test) {
            throw new NotFoundException('Test not found for the given question.');
        }

        return { answer, testId: test._id.toString() };
    }

    async checkAndUpdateTestStatus(testId: string): Promise<Test> {
        // Find the test to get the list of questionIds
        const test = await this.testModel.findById(testId);
        if (!test) {
            throw new NotFoundException('Test not found.');
        }

        // Fetch all questions associated with the test
        const questionIds = test.questionIds.map(id => id.toString());

        // Fetch all answers that belong to these questions
        const answers = await this.answerModel.find({
            questionId: { $in: questionIds }
        });

        // Check if all answers are marked as completed
        const allCompleted = answers.every(answer => answer.status === 'completed');

        if (allCompleted) {
            // Update the test status to 'marking completed'
            const updatedTest = await this.testModel.findByIdAndUpdate(
                testId,
                { status: 'marking completed' },
                { new: true }
            );

            if (!updatedTest) {
                throw new NotFoundException('Failed to update test status.');
            }

            return updatedTest;
        } 
    }
}

