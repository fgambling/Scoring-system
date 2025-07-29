import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { RolesGuard } from './auth/role.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { ManualMarkController } from './manual-mark/manual-mark.controller';
import { ManualMarkService } from './manual-mark/manual-mark.service';
import { ManualMarkModule } from './manual-mark/manual-mark.module';
import { TestsController } from './tests/tests.controller';
import { TestsModule } from './tests/tests.module';
import { AutoMarkModule } from './auto-mark/auto-mark.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guards';

/**
 * Main application module that configures all dependencies and modules
 * This module serves as the root module for the Automatic Scoring System
 */
@Module({
  imports: [
    // Core modules for user management and authentication
    UsersModule,        // Handles user CRUD operations
    AuthModule,         // Handles authentication and authorization
    DatabaseModule,     // Database connection and configuration
    
    // Feature modules for test management and scoring
    TestsModule,        // Manages test creation, editing, and metadata
    AutoMarkModule,     // Handles automatic scoring functionality
    ManualMarkModule,   // Handles manual marking functionality
    
    // Rate limiting configuration to prevent API abuse
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'auth',
          ttl: 60,        // Time window in seconds
          limit: 10,      // Maximum requests per time window
        },
      ],
    }),
  ],
  
  // Controllers handle HTTP requests and define API endpoints
  controllers: [
    AppController,           // Basic app endpoints
    AuthController,          // Authentication endpoints (login, register)
    UsersController,         // User management endpoints
    ManualMarkController,    // Manual marking endpoints
    TestsController,         // Test management endpoints
  ],

  // Providers include services and guards that provide business logic
  providers: [
    AppService,             // Basic application service
    UsersService,           // User management business logic
    AuthService,            // Authentication business logic
    ManualMarkService,      // Manual marking business logic
    
    // Global guards that apply to all routes
    { provide: APP_GUARD, useClass: AuthGuard },           // JWT authentication guard
    { provide: APP_GUARD, useClass: RolesGuard },          // Role-based access control guard
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,                       // Rate limiting guard
    },
  ],
})
export class AppModule {}
