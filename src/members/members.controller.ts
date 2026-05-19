import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { MemberLoginDto } from './dto/member-login.dto';
import { RegisterMemberDto } from './dto/register-member.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../types/user-role.enum';
import { Throttle } from '@nestjs/throttler'; //rate limiting

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  //apply rate limiting for feature
  @Throttle({ default: { limit: 4, ttl: 60000 } })
  @Post('register')
  register(@Body() registerMemberDto: RegisterMemberDto) {
    return this.membersService.register(registerMemberDto);
  }
  //apply rate limiting for feature
  @Throttle({ default: { limit: 4, ttl: 60000 } }) //5 requests max per 1 min
  @Post('verify-otp')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.membersService.verifyOtp(verifyOtpDto);
  }

  @Post('set-password')
  setPassword(@Body() setPasswordDto: SetPasswordDto) {
    return this.membersService.setPassword(setPasswordDto);
  }
  //apply rate limiting for feature
  @Throttle({ default: { limit: 4, ttl: 60000 } })
  @Post('login')
  login(@Body() memberLoginDto: MemberLoginDto) {
    return this.membersService.login(memberLoginDto);
  }

  @Patch(':id/approve-identity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  approveIdentity(@Param('id') id: string) {
    return this.membersService.approveIdentity(id);
  }

  @Patch(':id/reject-identity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  rejectIdentity(@Param('id') id: string, @Body('reason') reason: string) {
    return this.membersService.rejectIdentity(id, reason);
  }

  @Patch(':id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  suspendMember(@Param('id') id: string, @Body('reason') reason: string) {
    return this.membersService.suspendMember(id, reason);
  }

  @Patch(':id/reinstate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_AGENT)
  reinstateMember(@Param('id') id: string) {
    return this.membersService.reinstateMember(id);
  }
}
