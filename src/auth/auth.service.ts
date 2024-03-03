import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;
    const user = await this.usersService.getUser(email);

    if (!user) {
      throw new UnauthorizedException('Could not find the user');
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) throw new UnauthorizedException();

    const payload = { email: user.email };
    const token = await this.jwtService.signAsync(payload);

    const loginResponseDto: LoginResponseDto = {
      email: user.email,
      name: user.name,
      token: token,
    };

    return loginResponseDto;
  }
}
