import { UserRole } from './user-role.enum';

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};
