import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterMemberDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  nationalIdNumber: string;

  @IsDateString()
  dateOfBirth: string;
}
