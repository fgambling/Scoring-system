import { Test, TestingModule } from '@nestjs/testing';
import { ManualMarkService } from './manual-mark.service';

describe('ManualMarkService', () => {
  let service: ManualMarkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManualMarkService],
    }).compile();

    service = module.get<ManualMarkService>(ManualMarkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
