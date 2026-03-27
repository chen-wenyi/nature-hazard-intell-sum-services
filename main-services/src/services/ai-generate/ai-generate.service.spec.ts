import { Test, TestingModule } from '@nestjs/testing';
import { AiGenerateService } from './ai-generate.service';

describe('AiGenerateService', () => {
  let service: AiGenerateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiGenerateService],
    }).compile();

    service = module.get<AiGenerateService>(AiGenerateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
