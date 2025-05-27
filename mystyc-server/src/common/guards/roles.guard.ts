import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { UsersService } from '@/users/users.service';
import { logger } from '@/util/logger';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userProfileService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      logger.debug('No roles required for this endpoint');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const firebaseUser = request.user; // This is the decoded Firebase token
    
    if (!firebaseUser?.uid) {
      logger.warn('Roles guard failed - no user in request');
      return false;
    }

    logger.debug('Checking user roles', { 
      uid: firebaseUser.uid,
      requiredRoles 
    });

    // Fetch the database user profile
    const dbUserProfile = await this.userProfileService.findByFirebaseUid(firebaseUser.uid);
    
    if (!dbUserProfile?.roles) {
      logger.warn('User has no roles assigned', { uid: firebaseUser.uid });
      return false;
    }

    const hasRole = requiredRoles.some((role) => dbUserProfile.roles.includes(role));
    
    if (hasRole) {
      logger.debug('Role check passed', { 
        uid: firebaseUser.uid,
        userRoles: dbUserProfile.roles,
        requiredRoles 
      });
    } else {
      logger.warn('Role check failed', { 
        uid: firebaseUser.uid,
        userRoles: dbUserProfile.roles,
        requiredRoles 
      });
    }

    return hasRole;
  }
}