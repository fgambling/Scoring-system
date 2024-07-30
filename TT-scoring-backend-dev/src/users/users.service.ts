import { Inject, Injectable, Logger , NotFoundException} from '@nestjs/common';
import { User } from './interface/user.interface';
import { Model } from 'mongoose';
import { UserRole } from './enums/user-role.enum';
import { UserDto } from 'src/dto/user.dto'
import { Response } from '../common/json.response.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find({}, { password: 0, salt: 0 }).exec()
  }

//   async create(createUserDto: CreateUserDto): Promise<User> {
//     const newUser = new this.userModel(createUserDto);
//     return newUser.save();
//   }

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
    //   if (!roles.every((r) => Object.values(UserRole).includes(r))) {
    //     return {
    //       statusCode: -1,
    //       message: 'Invalid role.',
    //       data: null,
    //     };
    //   }
      //hashing password
      const salt = await bcrypt.genSalt();
      const hashedPass = await bcrypt.hash(pass, salt);
      const user = await this.insertOne(
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
        status: "Active",
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

  async changePassword(username: string, newPassword: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.salt = salt;
    await user.save();

    return {
      id: user._id,
      username: user.username,
      roles: user.roles,
      email: user.email,
      status: user.status
    };
  }

  async deleteByUsername(username: string): Promise<void> {
    const result = await this.userModel.deleteOne({ username });
    if (result.deletedCount === 0) {
        throw new NotFoundException('User not found');
    }
  }

  async toggleStatusByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
        throw new NotFoundException('User not found');
    }
    user.status = user.status === 'Active' ? 'Disabled' : 'Active';
    await user.save();
    return user;
  } 

  async findOne(username: string) {
    return this.userModel.findOne({ username: username });
  }

  async insertOne(username: string, password: string, roles: UserRole[],
    salt: string, email: string, status: string): Promise<User> {
    const newUser = new this.userModel({
        username,
        password,
        roles,
        salt,
        email,
        status,
    });
    return newUser.save();
  }
}


