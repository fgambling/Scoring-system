import { Test, TestingModule } from '@nestjs/testing';
import { AutoMarkService } from './auto-mark.service';

describe('AutoMarkService', () => {
  let service: AutoMarkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutoMarkService],
    }).compile();

    service = module.get<AutoMarkService>(AutoMarkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
