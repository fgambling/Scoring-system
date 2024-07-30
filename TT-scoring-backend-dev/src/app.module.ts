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
@Module({
  imports: [
    UsersModule,
    AuthModule,
    DatabaseModule,
    TestsModule,
    AutoMarkModule,
    ManualMarkModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'auth',
          ttl: 60,
          limit: 10,
        },
      ],
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    ManualMarkController,
    TestsController,
  ],

  providers: [
    AppService,
    UsersService,
    AuthService,
    ManualMarkService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
