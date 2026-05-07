import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { CmsUsersService } from '../cms-users/cms-users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly cmsUsersService: CmsUsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usersResponse = await this.cmsUsersService.findAll();

    const users = usersResponse.data;

    const user = users.find(
      (cmsUser) => cmsUser.email === loginDto.email.toLowerCase(),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const fullUser = await this.cmsUsersService['cmsUserModel'].findById(
      user._id,
    );
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      fullUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: fullUser._id,
      email: fullUser.email,
      role: fullUser.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: fullUser._id,
          fullName: fullUser.fullName,
          email: fullUser.email,
          role: fullUser.role,
        },
      },
    };
  }
}
