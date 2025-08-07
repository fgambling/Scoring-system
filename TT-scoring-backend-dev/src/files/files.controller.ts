import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AwsService } from '../aws/aws.service';

/**
 * Files controller for handling S3 file operations
 * Provides endpoints for uploading, downloading, and deleting files
 */
@Controller('files')
export class FilesController {
  constructor(private readonly awsService: AwsService) {}

  /**
   * Upload file to S3
   * @param file - Uploaded file
   * @returns Upload result with S3 URL
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      const s3Key = this.awsService.generateS3Key('uploads', file.originalname);
      const s3Url = await this.awsService.uploadToS3(file.buffer, s3Key);
      
      // Send CloudWatch metric
      await this.awsService.sendMetric(
        'ScoringSystem',
        'FilesUploaded',
        1,
        'Count'
      );

      return {
        statusCode: 200,
        message: 'File uploaded successfully',
        data: {
          originalName: file.originalname,
          s3Key: s3Key,
          s3Url: s3Url,
          size: file.size,
        },
      };
    } catch (error) {
      return {
        statusCode: -1,
        message: 'Failed to upload file',
        data: null,
      };
    }
  }

  /**
   * Download file from S3
   * @param key - S3 object key
   * @param res - Express response object
   */
  @Get('download/:key')
  async downloadFile(@Param('key') key: string, @Res() res: Response) {
    try {
      const fileBuffer = await this.awsService.downloadFromS3(key);
      
      // Send CloudWatch metric
      await this.awsService.sendMetric(
        'ScoringSystem',
        'FilesDownloaded',
        1,
        'Count'
      );

      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${key.split('/').pop()}"`,
      });
      
      res.send(fileBuffer);
    } catch (error) {
      res.status(404).json({
        statusCode: -1,
        message: 'File not found',
        data: null,
      });
    }
  }

  /**
   * Delete file from S3
   * @param key - S3 object key
   * @returns Deletion result
   */
  @Delete('delete/:key')
  async deleteFile(@Param('key') key: string) {
    try {
      await this.awsService.deleteFromS3(key);
      
      // Send CloudWatch metric
      await this.awsService.sendMetric(
        'ScoringSystem',
        'FilesDeleted',
        1,
        'Count'
      );

      return {
        statusCode: 200,
        message: 'File deleted successfully',
        data: null,
      };
    } catch (error) {
      return {
        statusCode: -1,
        message: 'Failed to delete file',
        data: null,
      };
    }
  }
} 