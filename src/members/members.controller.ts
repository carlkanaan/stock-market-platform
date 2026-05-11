import { Body, Controller, Param, Patch, Post } from '@nestjs/common';

import { MemberLoginDto } from './dto/member-login.dto';
import { RegisterMemberDto } from './dto/register-member.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { MembersService } from './members.service';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post('register')
  register(@Body() registerMemberDto: RegisterMemberDto) {
    return this.membersService.register(registerMemberDto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.membersService.verifyOtp(verifyOtpDto);
  }

  @Post('set-password')
  setPassword(@Body() setPasswordDto: SetPasswordDto) {
    return this.membersService.setPassword(setPasswordDto);
  }

  @Post('login')
  login(@Body() memberLoginDto: MemberLoginDto) {
    return this.membersService.login(memberLoginDto);
  }

  @Patch(':id/approve-identity')
  approveIdentity(@Param('id') id: string) {
    return this.membersService.approveIdentity(id);
  }

  @Patch(':id/reject-identity')
  rejectIdentity(@Param('id') id: string, @Body('reason') reason: string) {
    return this.membersService.rejectIdentity(id, reason);
  }

  @Patch(':id/suspend')
  suspendMember(@Param('id') id: string, @Body('reason') reason: string) {
    return this.membersService.suspendMember(id, reason);
  }

  @Patch(':id/reinstate')
  reinstateMember(@Param('id') id: string) {
    return this.membersService.reinstateMember(id);
  }
}
