import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const emailLower = createUserDto.email.toLowerCase();
      const { password } = createUserDto;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.userModel.create({
        ...createUserDto,
        email: emailLower,
        password: hashedPassword,
      });

      return await user.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`User already exist`);
      }
      throw new InternalServerErrorException(
        `Ops!.. try again in a few minutes`,
      );
    }
  }

  async getUser(email: string) {
    const emailLower = email.toLowerCase();
    const user = await this.userModel.findOne({ email: emailLower });
    return user;
  }
}
