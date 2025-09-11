import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SUBSCRIPTION_LEVELS_KEY } from '@/common/decorators/subscription-levels.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { SubscriptionLevel } from 'mystyc-common/constants/subscription-levels.enum';
import { UserProfilesService } from '@/users/user-profiles.service';
import { logger } from '@/common/util/logger';

@Injectable()
export class SubscriptionLevelGuard implements CanActivate {
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

    const requiredLevels = this.reflector.getAllAndOverride<SubscriptionLevel[]>(SUBSCRIPTION_LEVELS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredLevels || requiredLevels.length === 0) {
      logger.debug('No subscription levels required for this endpoint');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const firebaseUser = request.user;
    
    if (!firebaseUser?.uid) {
      logger.warn('Subscription level guard failed - no user in request');
      return false;
    }

    logger.debug('Checking user subscription level', { 
      uid: firebaseUser.uid,
      requiredLevels 
    });

    const dbUserProfile = await this.userProfileService.findByFirebaseUid(firebaseUser.uid);
    
    if (!dbUserProfile?.subscription) {
      logger.warn('User has no subscription data', { uid: firebaseUser.uid });
      return false;
    }

    const userLevel = dbUserProfile.subscription.level;
    const hasLevel = requiredLevels.includes(userLevel);
    
    if (hasLevel) {
      logger.debug('Subscription level check passed', { 
        uid: firebaseUser.uid,
        userLevel,
        requiredLevels 
      });
    } else {
      logger.warn('Subscription level check failed', { 
        uid: firebaseUser.uid,
        userLevel,
        requiredLevels 
      });
    }

    return hasLevel;
  }
}