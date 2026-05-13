import { Test, TestingModule } from '@nestjs/testing';
import { SystemAlertsController } from './system-alerts.controller';

describe('SystemAlertsController', () => {
  let controller: SystemAlertsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemAlertsController],
    }).compile();

    controller = module.get<SystemAlertsController>(SystemAlertsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
