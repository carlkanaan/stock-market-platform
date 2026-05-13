import { Test, TestingModule } from '@nestjs/testing';
import { SystemAlertsService } from './system-alerts.service';

describe('SystemAlertsService', () => {
  let service: SystemAlertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemAlertsService],
    }).compile();

    service = module.get<SystemAlertsService>(SystemAlertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
