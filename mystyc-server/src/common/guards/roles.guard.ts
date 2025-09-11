import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { UserRole } from 'mystyc-common/constants/roles.enum';
import { UserProfilesService } from '@/users/user-profiles.service';
import { logger } from '@/common/util/logger';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userProfileService: UserProfilesService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      logger.debug('No roles required for this endpoint');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const firebaseUser = request.user;
    
    if (!firebaseUser?.uid) {
      logger.warn('Roles guard failed - no user in request');
      return false;
    }

    logger.debug('Checking user roles', { 
      uid: firebaseUser.uid,
      requiredRoles 
    });

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