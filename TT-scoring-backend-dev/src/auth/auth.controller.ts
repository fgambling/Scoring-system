import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from './roles.decorator';
import { UserRole } from 'src/users/enums/user-role.enum';
import { Public } from './constants';
import { LoginDto } from 'src/dto/login.dto';
import { RegisterDto } from 'src/dto/register.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Throttle({ auth: { limit: 10, ttl: 30 * 1000 } })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto.username, loginDto.password);
  }
  /**
   * This endpoint is only open to admin
   * @param registerDto
   * @returns
   */
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.username,
      registerDto.password,
      registerDto.roles,
      registerDto.email,
      'Active',
    );
  }
  /**
   * Get user's profile basede on current session.
   * @param req
   * @returns
   */
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
