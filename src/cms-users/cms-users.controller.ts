import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CmsUsersService } from './cms-users.service';
import { CreateCmsUserDto } from './dto/create-cms-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../types/user-role.enum';

@Controller('cms-users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CmsUsersController {
  constructor(private readonly cmsUsersService: CmsUsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createCmsUserDto: CreateCmsUserDto) {
    return this.cmsUsersService.create(createCmsUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.cmsUsersService.findAll();
  }
}
