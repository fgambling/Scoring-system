import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { testProviders } from './tests.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TestsController],
  providers: [...testProviders, TestsService],
  exports: [...testProviders, TestsService],
})
export class TestsModule {}
