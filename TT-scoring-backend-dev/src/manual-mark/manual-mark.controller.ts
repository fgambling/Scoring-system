import { Controller, Patch, Body, Get, Param } from '@nestjs/common';
import { ManualMarkService } from './manual-mark.service';

@Controller('manual-mark')
export class ManualMarkController {
  constructor(private readonly manualMarkService: ManualMarkService) {}

  @Get('/:userId/questions-and-answers')
  async getTestDetails(@Param('userId') userId: string) {
    return await this.manualMarkService.findQuestionsAndAnswersForUser(userId);
  }

  @Patch('answers/:answerId/mark')
  async updateAnswerMark(
    @Param('answerId') answerId: string,
    @Body('newMark') newMark: number,
  ) {
    try {
      const { answer, testId } = await this.manualMarkService.updateAnswerMark(
        answerId,
        newMark,
      );
      const test =
        await this.manualMarkService.checkAndUpdateTestStatus(testId);
      return { message: 'Answer and Test updated successfully.', answer, test };
    } catch (error) {
      return { message: error.message };
    }
  }
}
