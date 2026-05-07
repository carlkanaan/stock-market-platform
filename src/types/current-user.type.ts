import { UserRole } from './user-role.enum';

export type CurrentUser = {
  userId: string;
  email: string;
  role: UserRole;
};
