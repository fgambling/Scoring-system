import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';

/**
 * AWS module that provides AWS service integration
 * Includes S3 file operations, CloudWatch monitoring, and SNS notifications
 */
@Module({
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {} 