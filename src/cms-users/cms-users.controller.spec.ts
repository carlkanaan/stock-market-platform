import { Test, TestingModule } from '@nestjs/testing';
import { CmsUsersController } from './cms-users.controller';

describe('CmsUsersController', () => {
  let controller: CmsUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CmsUsersController],
    }).compile();

    controller = module.get<CmsUsersController>(CmsUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
