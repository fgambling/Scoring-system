import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { usersProviders } from './users.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [...usersProviders, UsersService],
  exports: [...usersProviders, UsersService],
})
export class UsersModule {}
