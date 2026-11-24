
import { IRequest } from '@/common/interfaces/request.interface';
import { AuthUser } from '@/common/interfaces/auth-user.interface';

export function getCurrentUser(req: IRequest) {
  if (!req.user) {
    return 'User not authenticated';
  }

  const { userId } = req.user as AuthUser;

  if (!userId) {
    return 'User ID not found';
  }

  return req.user;
}
