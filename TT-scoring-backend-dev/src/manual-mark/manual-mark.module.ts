import { Module } from '@nestjs/common';
import { ManualMarkController } from './manual-mark.controller';
import { ManualMarkService } from './manual-mark.service';
import { manualMarkProviders } from './manual-mark.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ManualMarkController],
  providers: [...manualMarkProviders, ManualMarkService],
  exports: [...manualMarkProviders, ManualMarkService],
})
export class ManualMarkModule {}
