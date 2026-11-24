
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { Role } from '@/common/enums/role.enum';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user?: {
    userId?: string;
    roles?: string[];
  };
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const userRoles = request.user?.roles ?? [];

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    const allowedRoles = requiredRoles?.length
      ? requiredRoles
      : [Role.ADMIN, Role.SUPER_ADMIN];

    const hasPermission = allowedRoles.some((role) =>
      userRoles.includes(role),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
