import { 
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  Patch,
} from '@nestjs/common';

import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/enums/user-role.enum';
import { UserDto } from 'src/dto/user.dto'
import { UsersService } from './users.service'
import { User } from './interface/user.interface'
import { RegisterDto } from 'src/dto/register.dto';
import { ChangePasswordDto } from 'src/dto/change-password.dto';
import { Response } from 'express';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get()
    async findAll(): Promise<User[]> {
      return this.usersService.findAll();
    }

    // @Post()
    // async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    //   return this.usersService.create(createUserDto);
    // }

    @Roles(UserRole.Admin)
    @HttpCode(HttpStatus.OK)
    @Post('create')
    async create(@Body() registerDto: RegisterDto) {
      return this.usersService.register(
        registerDto.username,
        registerDto.password,
        registerDto.roles,
        registerDto.email,
        "Active",
      );
    }

    @Patch(':username/password')
    async changePassword(
        @Param('username') username: string,
        @Body() changePasswordDto: ChangePasswordDto,
        @Res() res: Response
    )   {
        const { newPassword, confirmPassword } = changePasswordDto;

        if (newPassword !== confirmPassword) {
            return res.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Passwords do not match.',
            data: null,
            });
        }

        try {
        const userDto = await this.usersService.changePassword(username, newPassword);
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            message: 'Password updated successfully.',
            data: userDto,
        });
        } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error.message,
            data: null,
        });
        }
    }


    @Delete('by-username/:username')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteByUsername(@Param('username') username: string): Promise<void> {
        await this.usersService.deleteByUsername(username);
    }

    @Patch('status-by-username/:username')
    async toggleStatusByUsername(@Param('username') username: string): Promise<User> {
        return this.usersService.toggleStatusByUsername(username);
    }
}
