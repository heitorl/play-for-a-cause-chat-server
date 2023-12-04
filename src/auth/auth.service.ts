import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

export interface IUserPayload {
  id: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  login(user: User) {
    console.log('ntrou user service 1');
    const payload: IUserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const token = this.jwtService.sign(payload);
    console.log({ ...payload });
    return {
      access_token: token,
      user: { ...payload },
    };
  }

  async validateUser(email: string, password: string) {
    const user: User = await this.userService.findByEmail(email);
    console.log('entrou validate service 1');
    if (user) {
      console.log('ntrou user validate service 2');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('ntrou user validate service 3', isPasswordValid);
      if (isPasswordValid) {
        return {
          ...user,
          password: undefined,
        };
      }
    }

    throw new Error('Email address or password provided is incorrect.');
  }
}
