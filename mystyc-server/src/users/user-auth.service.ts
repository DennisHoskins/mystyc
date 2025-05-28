import { Injectable } from '@nestjs/common';

import { FirebaseUser } from '@/common/interfaces/firebaseUser.interface';
import { User } from '@/common/interfaces/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { logger } from '@/util/logger';

import { UserService } from './user.service';
import { UserRolesService } from './user-roles.service';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRolesService: UserRolesService
  ) {}

  async getOrCreateUser(firebaseUser: FirebaseUser): Promise<User> {
    return this.userService.getOrCreateUser(firebaseUser);
  }

  async getUserProfile(firebaseUid: string, firebaseUser: FirebaseUser): Promise<User | null> {
    return this.userService.getUserProfile(firebaseUid, firebaseUser);
  }

  async updateUserProfile(firebaseUid: string, updates: UpdateUserDto, firebaseUser: FirebaseUser): Promise<User> {
    return this.userService.updateUserProfile(firebaseUid, updates, firebaseUser);
  }

  async promoteToAdmin(firebaseUid: string): Promise<User | null> {
    logger.info('Promoting user to admin', { firebaseUid });

    const existingUser = await this.userService.getUserProfile(firebaseUid, {
      uid: firebaseUid,
    });

    if (!existingUser) {
      logger.warn('Cannot promote - user not found', { firebaseUid });
      return null;
    }

    await this.userRolesService.promoteToAdmin(firebaseUid);
    return existingUser;
  }

  async revokeAdminAccess(firebaseUid: string): Promise<User | null> {
    logger.info('Revoking admin access', { firebaseUid });

    const existingUser = await this.userService.getUserProfile(firebaseUid, {
      uid: firebaseUid,
    });

    if (!existingUser) {
      logger.warn('Cannot revoke - user not found', { firebaseUid });
      return null;
    }

    await this.userRolesService.revokeAdminAccess(firebaseUid);
    return existingUser;
  }
}
