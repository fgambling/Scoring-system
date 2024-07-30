import { Test, TestingModule } from '@nestjs/testing';
import { ManualMarkController } from './manual-mark.controller';

describe('ManualMarkController', () => {
  let controller: ManualMarkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManualMarkController],
    }).compile();

    controller = module.get<ManualMarkController>(ManualMarkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
