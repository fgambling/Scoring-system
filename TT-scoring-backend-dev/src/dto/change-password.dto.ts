import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @MinLength(8, {
    message: 'New password must be at least 8 characters long.',
  })
  newPassword: string;

  @IsNotEmpty()
  @MinLength(8, {
    message: 'Confirm password must be at least 8 characters long.',
  })
  confirmPassword: string;
}
