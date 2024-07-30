import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from '../common/json.response.interface';
import { UserDto } from 'src/dto/user.dto';
import { UserRole } from 'src/users/enums/user-role.enum';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<Response<{ access_token: string }>> {
    const user = await this.usersService.findOne(username);
    if (user == null) {
      throw new UnauthorizedException();
    }
    if (user?.status !== 'Active') {
      throw new UnauthorizedException();
    }
    const salt = user.salt;
    const hashedPass = await bcrypt.hash(pass, salt);
    if (user?.password !== hashedPass) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles,
      email: user.email,
    };
    return {
      statusCode: 200,
      message: 'Success',
      data: {
        access_token: await this.jwtService.signAsync(payload),
      },
    };
  }

  async register(
    username: string,
    pass: string,
    roles: UserRole[],
    // roles: string,
    email: string,
    status: string,
  ): Promise<Response<UserDto>> {
    try {
      // empty value validation
      if (!username || !pass || !roles || !email) {
        return {
          statusCode: -1,
          message: 'Incomplete user information.',
          data: null,
        };
      }
      //role validation
      if (!roles.every((r) => Object.values(UserRole).includes(r))) {
        return {
          statusCode: -1,
          message: 'Invalid role.',
          data: null,
        };
      }
      //hashing password
      const salt = await bcrypt.genSalt();
      const hashedPass = await bcrypt.hash(pass, salt);
      const user = await this.usersService.insertOne(
        username,
        hashedPass,
        roles,
        salt,
        email,
        status,
      );
      //create user dto
      const userDto: UserDto = {
        id: user.id,
        username: user.username,
        roles: user.roles,
        email: user.email,
        status: 'Active',
      };
      //return result
      return {
        statusCode: 200,
        message: 'Success',
        data: userDto,
      };
    } catch (error) {
      let msg = 'Error';
      if (error.code === 11000) {
        msg = 'Username already exists';
      }
      return {
        statusCode: -1,
        message: msg,
        data: null,
      };
    }
  }
}
