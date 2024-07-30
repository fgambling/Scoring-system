import { Test, TestingModule } from '@nestjs/testing';
import { AutoMarkController } from './auto-mark.controller';

describe('AutoMarkController', () => {
  let controller: AutoMarkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutoMarkController],
    }).compile();

    controller = module.get<AutoMarkController>(AutoMarkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
