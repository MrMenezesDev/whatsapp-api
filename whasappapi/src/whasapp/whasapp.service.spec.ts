import { Test, TestingModule } from '@nestjs/testing';
import { WhasappService } from './whasapp.service';

describe('WhasappService', () => {
  let service: WhasappService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhasappService],
    }).compile();

    service = module.get<WhasappService>(WhasappService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
