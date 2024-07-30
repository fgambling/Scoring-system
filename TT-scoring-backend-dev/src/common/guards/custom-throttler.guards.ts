import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerLimitDetail } from '@nestjs/throttler/dist/throttler.guard.interface';
import { Response } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(
    context: ExecutionContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = 200;

    response.status(status).json({
      statusCode: -1,
      message: 'Too many requests, please try again later.',
    });
  }
}
