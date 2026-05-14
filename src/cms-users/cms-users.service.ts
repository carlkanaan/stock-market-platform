import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { CreateCmsUserDto } from './dto/create-cms-user.dto';
import { CmsUser, CmsUserDocument } from './schemas/cms-user.schema';

import { EmailService } from '../notifications/email.service';

@Injectable()
export class CmsUsersService {
  constructor(
    @InjectModel(CmsUser.name)
    private readonly cmsUserModel: Model<CmsUserDocument>,

    private readonly emailService: EmailService,
  ) {}

  async create(createCmsUserDto: CreateCmsUserDto) {
    const existingUser = await this.cmsUserModel.findOne({
      email: createCmsUserDto.email.toLowerCase(),
    });

    if (existingUser) {
      throw new ConflictException('CMS user email already exists');
    }

    const hashedPassword = await bcrypt.hash(createCmsUserDto.password, 10);

    const user = await this.cmsUserModel.create({
      ...createCmsUserDto,
      email: createCmsUserDto.email.toLowerCase(),
      password: hashedPassword,
    });

    await this.emailService.sendCmsProvisioningEmail(
      user.email,
      user.fullName,
      createCmsUserDto.password,
    );

    return {
      success: true,
      message: 'CMS user created successfully',
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  async findAll() {
    const users = await this.cmsUserModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 });

    return {
      success: true,
      data: users,
    };
  }

  async findByEmailWithPassword(email: string) {
    return this.cmsUserModel.findOne({
      email: email.toLowerCase(),
    });
  }
}
