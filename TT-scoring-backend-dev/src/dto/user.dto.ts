import { UserRole } from 'src/users/enums/user-role.enum';

export class UserDto {
  id: string;
  username: string;
  roles: UserRole[];
  // roles: string;
  email: string;
  status: string;

  constructor(user: any) {
    this.id = user._id;
    this.username = user.username;
    this.roles = user.roles;
    this.email = user.email;
    this.status = user.status;
  }
}
