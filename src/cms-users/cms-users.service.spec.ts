import { Test, TestingModule } from '@nestjs/testing';
import { CmsUsersService } from './cms-users.service';

describe('CmsUsersService', () => {
  let service: CmsUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CmsUsersService],
    }).compile();

    service = module.get<CmsUsersService>(CmsUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
