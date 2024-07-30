import { UserRole } from '../enums/user-role.enum';

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  status: string;
  roles: UserRole[];
  salt: string;
}
