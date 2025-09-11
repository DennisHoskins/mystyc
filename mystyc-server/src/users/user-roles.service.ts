import { Injectable, NotFoundException } from '@nestjs/common';

import { UserRole } from 'mystyc-common/constants/roles.enum';

import { logger } from '@/common/util/logger';
import { UserProfilesService } from './user-profiles.service';

@Injectable()
export class UserRolesService {
  constructor(private readonly userProfileService: UserProfilesService) {}

  /**
   * Promotes user to admin role by adding ADMIN to their existing roles
   * Operation is idempotent - safe to call multiple times
   * @param firebaseUid - Firebase user unique identifier
   * @returns Promise<void>
   * @throws NotFoundException when user profile is not found
   */
  async promoteToAdmin(firebaseUid: string): Promise<void> {
    logger.info('Promoting user to admin', { firebaseUid }, 'UserRolesService');

    const profile = await this.userProfileService.findByFirebaseUid(firebaseUid);
    if (!profile) {
      logger.warn('Cannot promote - profile not found', { firebaseUid }, 'UserRolesService');
      throw new NotFoundException('User not found');
    }

    const currentRoles = (profile.roles || [UserRole.USER]) as UserRole[];
    if (currentRoles.includes(UserRole.ADMIN)) {
      logger.info('User is already an admin', { firebaseUid }, 'UserRolesService');
      return;
    }

    const updatedRoles = [...currentRoles, UserRole.ADMIN];
    await this.userProfileService.updateRoles(firebaseUid, updatedRoles);

    logger.info('User promoted to admin', { firebaseUid, newRoles: updatedRoles }, 'UserRolesService');
  }

  /**
   * Revokes admin access by removing ADMIN role from user's roles
   * Operation is idempotent - safe to call multiple times
   * @param firebaseUid - Firebase user unique identifier  
   * @returns Promise<void>
   * @throws NotFoundException when user profile is not found
   */
  async revokeAdminAccess(firebaseUid: string): Promise<void> {
    logger.info('Revoking admin access', { firebaseUid }, 'UserRolesService');

    const profile = await this.userProfileService.findByFirebaseUid(firebaseUid);
    if (!profile) {
      logger.warn('Cannot revoke - profile not found', { firebaseUid }, 'UserRolesService');
      throw new NotFoundException('User not found');
    }

    const currentRoles = (profile.roles || []) as UserRole[];
    const updatedRoles = currentRoles.filter(role => role !== UserRole.ADMIN);

    if (updatedRoles.length === currentRoles.length) {
      logger.info('User was not an admin', { firebaseUid }, 'UserRolesService');
      return;
    }

    await this.userProfileService.updateRoles(firebaseUid, updatedRoles);

    logger.info('Admin access revoked', { firebaseUid, newRoles: updatedRoles }, 'UserRolesService');
  }

  /**
   * Retrieves all roles assigned to a user
   * @param firebaseUid - Firebase user unique identifier
   * @returns Promise<UserRole[]> - Array of user's current roles
   * @throws NotFoundException when user profile is not found
   */
  async getRoles(firebaseUid: string): Promise<UserRole[]> {
    const profile = await this.userProfileService.findByFirebaseUid(firebaseUid);

    if (!profile) {
      logger.warn('User roles lookup failed - user not found', { firebaseUid }, 'UserRolesService');
      throw new NotFoundException('User not found');
    }

    return (profile.roles || []).map(role => role as UserRole);
  }
}