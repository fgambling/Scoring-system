import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/users/enums/user-role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'admin', description: 'The username of the user' })
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  password: string;

  @ApiProperty({
    example: '[admin, test deveoper]',
    description:
      'The roles of the user. Options: admin, test developer, marker.',
  })
  roles: UserRole[];
  // roles: string;

  @ApiProperty({
    example: '123@gamil.com',
    description: 'The email of the user',
  })
  email: string;
}
