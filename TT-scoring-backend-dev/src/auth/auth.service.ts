import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from '../common/json.response.interface';
import { UserDto } from 'src/dto/user.dto';
import { UserRole } from 'src/users/enums/user-role.enum';

/**
 * Authentication service that handles user login and registration
 * Provides JWT token generation and password hashing functionality
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Authenticates a user and returns a JWT access token
   * @param username - The user's username
   * @param pass - The user's password
   * @returns Promise with JWT token or throws UnauthorizedException
   */
  async signIn(
    username: string,
    pass: string,
  ): Promise<Response<{ access_token: string }>> {
    // Find user by username
    const user = await this.usersService.findOne(username);
    if (user == null) {
      throw new UnauthorizedException();
    }
    
    // Check if user account is active
    if (user?.status !== 'Active') {
      throw new UnauthorizedException();
    }
    
    // Verify password using bcrypt
    const salt = user.salt;
    const hashedPass = await bcrypt.hash(pass, salt);
    if (user?.password !== hashedPass) {
      throw new UnauthorizedException();
    }
    
    // Create JWT payload with user information
    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles,
      email: user.email,
    };
    
    // Return JWT token
    return {
      statusCode: 200,
      message: 'Success',
      data: {
        access_token: await this.jwtService.signAsync(payload),
      },
    };
  }

  /**
   * Registers a new user in the system
   * @param username - The new user's username
   * @param pass - The new user's password
   * @param roles - Array of user roles (ADMIN, TEST_DEVELOPER, MARKER)
   * @param email - The user's email address
   * @param status - The user's account status
   * @returns Promise with created user data or error message
   */
  async register(
    username: string,
    pass: string,
    roles: UserRole[],
    email: string,
    status: string,
  ): Promise<Response<UserDto>> {
    try {
      // Validate that all required fields are provided
      if (!username || !pass || !roles || !email) {
        return {
          statusCode: -1,
          message: 'Incomplete user information.',
          data: null,
        };
      }
      
      // Validate that all roles are valid
      if (!roles.every((r) => Object.values(UserRole).includes(r))) {
        return {
          statusCode: -1,
          message: 'Invalid role.',
          data: null,
        };
      }
      
      // Generate salt and hash password for security
      const salt = await bcrypt.genSalt();
      const hashedPass = await bcrypt.hash(pass, salt);
      
      // Create user in database
      const user = await this.usersService.insertOne(
        username,
        hashedPass,
        roles,
        salt,
        email,
        status,
      );
      
      // Create user DTO for response
      const userDto: UserDto = {
        id: user.id,
        username: user.username,
        roles: user.roles,
        email: user.email,
        status: 'Active',
      };
      
      // Return success response
      return {
        statusCode: 200,
        message: 'Success',
        data: userDto,
      };
    } catch (error) {
      // Handle duplicate username error
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
