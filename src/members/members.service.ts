import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RegisterMemberDto } from './dto/register-member.dto';
import { Member, MemberDocument } from './schemas/member.schema';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { SetPasswordDto } from './dto/set-password.dto';
import { MemberLoginDto } from './dto/member-login.dto';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name)
    private readonly memberModel: Model<MemberDocument>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async register(registerMemberDto: RegisterMemberDto) {
    const age = this.calculateAge(new Date(registerMemberDto.dateOfBirth));

    if (age < 18) {
      throw new BadRequestException('Member must be at least 18 years old');
    }

    const existingMember = await this.memberModel.findOne({
      $or: [
        { email: registerMemberDto.email.toLowerCase() },
        { nationalIdNumber: registerMemberDto.nationalIdNumber },
      ],
    });

    if (existingMember) {
      throw new ConflictException('Email or national ID already exists');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const ttlMinutes =
      Number(this.configService.get<string>('OTP_TTL_MINUTES')) || 10;

    const otpExpiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const member = await this.memberModel.create({
      ...registerMemberDto,
      email: registerMemberDto.email.toLowerCase(),
      dateOfBirth: new Date(registerMemberDto.dateOfBirth),
      otpCode,
      otpExpiresAt,
    });

    return {
      success: true,
      message: 'Member registered successfully. OTP sent to email.',
      data: {
        id: member._id,
        fullName: member.fullName,
        email: member.email,
        dateOfBirth: member.dateOfBirth,
        isEmailVerified: member.isEmailVerified,
        otpPreviewForTesting: otpCode,
      },
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const member = await this.memberModel.findOne({
      email: verifyOtpDto.email.toLowerCase(),
    });

    if (!member) {
      throw new BadRequestException('Member not found');
    }

    if (member.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (!member.otpCode || !member.otpExpiresAt) {
      throw new BadRequestException('No OTP found for this member');
    }

    if (member.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    if (member.otpCode !== verifyOtpDto.otpCode) {
      throw new BadRequestException('Invalid OTP code');
    }

    member.isEmailVerified = true;
    member.otpCode = undefined;
    member.otpExpiresAt = undefined;

    await member.save();

    return {
      success: true,
      message: 'Email verified successfully',
      data: {
        id: member._id,
        fullName: member.fullName,
        email: member.email,
        isEmailVerified: member.isEmailVerified,
      },
    };
  }

  async setPassword(setPasswordDto: SetPasswordDto) {
    const member = await this.memberModel.findOne({
      email: setPasswordDto.email.toLowerCase(),
    });

    if (!member) {
      throw new BadRequestException('Member not found');
    }

    if (!member.isEmailVerified) {
      throw new BadRequestException('Email is not verified');
    }

    const hashedPassword = await bcrypt.hash(setPasswordDto.password, 10);

    member.password = hashedPassword;

    await member.save();

    return {
      success: true,
      message: 'Password set successfully',
    };
  }
  async login(memberLoginDto: MemberLoginDto) {
    const member = await this.memberModel.findOne({
      email: memberLoginDto.email.toLowerCase(),
    });

    if (!member || !member.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      memberLoginDto.password,
      member.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: member._id,
      email: member.email,
      role: 'MEMBER',
    });

    return {
      success: true,
      message: 'Member login successful',
      data: {
        accessToken,
        member: {
          id: member._id,
          fullName: member.fullName,
          email: member.email,
        },
      },
    };
  }

  private calculateAge(dateOfBirth: Date) {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();

    const monthDifference = today.getMonth() - dateOfBirth.getMonth();
    const dayDifference = today.getDate() - dateOfBirth.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    return age;
  }
}
