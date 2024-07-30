import { Module } from '@nestjs/common';
import { AutoMarkService } from './auto-mark.service';
import { AutoMarkController } from './auto-mark.controller';
import { testProviders } from 'src/tests/tests.providers';
import { DatabaseModule } from 'src/database/database.module';
import { autoMarkProviders } from './auto-mark.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...testProviders, ...autoMarkProviders, AutoMarkService],
  controllers: [AutoMarkController],
})
export class AutoMarkModule {}
