import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Bootstrap function to initialize and start the NestJS application
 * This is the main entry point for the Automatic Scoring System backend
 */
async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(AppModule);

  // Enable CORS (Cross-Origin Resource Sharing) to allow frontend requests
  // This allows the frontend application to communicate with the backend API
  app.enableCors({
    origin: '*', // Allow all origins in development (should be restricted in production)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
  });

  // Configure Swagger API documentation
  // This creates interactive API documentation accessible at /api endpoint
  const config = new DocumentBuilder()
    .setTitle('Automatic Scoring System API')
    .setDescription('The Automatic Scoring System API description')
    .setVersion('1.0')
    .addTag('scoring')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the server on the configured port (default: 8081)
  const port = process.env.PORT || 8081;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
