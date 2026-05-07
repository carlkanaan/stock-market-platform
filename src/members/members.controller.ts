import { Body, Controller, Post } from '@nestjs/common';

import { RegisterMemberDto } from './dto/register-member.dto';
import { MembersService } from './members.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { MemberLoginDto } from './dto/member-login.dto';

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
}
