import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Type,
} from '@nestjs/common';

enum UserRole {
  admin = 'admin',
  moderator = 'moderator',
  participant = 'participant'
}

interface User {
  id: string;
  name: string;
  role: UserRole;
}

interface RequestWithUser extends Request {
  user: User;
}

export function UserRolesGuard(
  allowedRoles: UserRole[]
): Type<CanActivate> {
  @Injectable()
  class Guard implements CanActivate {
    private readonly allowedRoles: UserRole[] = allowedRoles;

    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest() as RequestWithUser;

      const user = req.user;

      return this.allowedRoles.includes(user.role);
    }
  }

  return Guard;
}
