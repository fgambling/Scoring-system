import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

/**
 * AWS service for handling S3 file operations, CloudWatch monitoring, and SNS notifications
 */
@Injectable()
export class AwsService {
  private s3Client: S3Client;
  private cloudWatchClient: CloudWatchClient;
  private snsClient: SNSClient;

  constructor() {
    // Initialize AWS clients
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    this.cloudWatchClient = new CloudWatchClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    this.snsClient = new SNSClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  /**
   * Upload file to S3
   * @param file - File buffer
   * @param key - S3 object key
   * @param bucket - S3 bucket name
   * @returns Upload result
   */
  async uploadToS3(file: Buffer, key: string, bucket?: string): Promise<string> {
    const bucketName = bucket || process.env.AWS_S3_BUCKET;
    
    if (!bucketName) {
      throw new Error('S3 bucket name not configured');
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: this.getContentType(key),
    });

    try {
      await this.s3Client.send(command);
      return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  /**
   * Download file from S3
   * @param key - S3 object key
   * @param bucket - S3 bucket name
   * @returns File buffer
   */
  async downloadFromS3(key: string, bucket?: string): Promise<Buffer> {
    const bucketName = bucket || process.env.AWS_S3_BUCKET;
    
    if (!bucketName) {
      throw new Error('S3 bucket name not configured');
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      const chunks: Buffer[] = [];
      
      if (response.Body) {
        for await (const chunk of response.Body as any) {
          chunks.push(chunk);
        }
      }
      
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('S3 download error:', error);
      throw new Error('Failed to download file from S3');
    }
  }

  /**
   * Delete file from S3
   * @param key - S3 object key
   * @param bucket - S3 bucket name
   */
  async deleteFromS3(key: string, bucket?: string): Promise<void> {
    const bucketName = bucket || process.env.AWS_S3_BUCKET;
    
    if (!bucketName) {
      throw new Error('S3 bucket name not configured');
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  /**
   * Send metric to CloudWatch
   * @param namespace - Metric namespace
   * @param metricName - Metric name
   * @param value - Metric value
   * @param unit - Metric unit
   */
  async sendMetric(namespace: string, metricName: string, value: number, unit: string = 'Count'): Promise<void> {
    const command = new PutMetricDataCommand({
      Namespace: namespace,
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Timestamp: new Date(),
        },
      ],
    });

    try {
      await this.cloudWatchClient.send(command);
    } catch (error) {
      console.error('CloudWatch metric error:', error);
      // Don't throw error for metrics to avoid breaking main functionality
    }
  }

  /**
   * Send notification via SNS
   * @param message - Message to send
   * @param subject - Message subject
   * @param topicArn - SNS topic ARN
   */
  async sendNotification(message: string, subject: string, topicArn?: string): Promise<void> {
    const topic = topicArn || process.env.AWS_SNS_TOPIC_ARN;
    
    if (!topic) {
      console.warn('SNS topic ARN not configured, skipping notification');
      return;
    }

    const command = new PublishCommand({
      TopicArn: topic,
      Subject: subject,
      Message: message,
    });

    try {
      await this.snsClient.send(command);
    } catch (error) {
      console.error('SNS notification error:', error);
      // Don't throw error for notifications to avoid breaking main functionality
    }
  }

  /**
   * Get content type based on file extension
   * @param filename - File name
   * @returns Content type
   */
  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'csv':
        return 'text/csv';
      case 'pdf':
        return 'application/pdf';
      case 'json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Generate unique S3 key
   * @param prefix - Key prefix
   * @param filename - Original filename
   * @returns Unique S3 key
   */
  generateS3Key(prefix: string, filename: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = filename.split('.').pop();
    return `${prefix}/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;
  }
} 