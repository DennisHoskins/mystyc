import { Injectable } from '@nestjs/common';

import { FirebaseUser } from '@/common/interfaces/firebaseUser.interface';
import { User } from '@/common/interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@/common/enums/roles.enum';

import { UserProfileService } from './user-profile.service';
import { logger } from '@/util/logger';

@Injectable()
export class UserService {
  constructor(
    private readonly userProfileService: UserProfileService
  ) {}

  async getOrCreateUser(firebaseUser: FirebaseUser): Promise<User> {
    logger.debug('Getting or creating user', { firebaseUid: firebaseUser.uid });

    let userProfile = await this.userProfileService.findByFirebaseUid(firebaseUser.uid);

    if (userProfile) {
      logger.debug('Existing user found', {
        firebaseUid: firebaseUser.uid,
        profileId: userProfile.id,
      });

      return { firebaseUser, userProfile };
    }

    logger.info('Creating new user from Firebase auth', {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
    });

    const createUserDto: CreateUserDto = {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email || '',
      roles: [UserRole.USER],
    };

    userProfile = await this.userProfileService.create(createUserDto);

    logger.info('New user created successfully', {
      firebaseUid: firebaseUser.uid,
      profileId: userProfile.id,
    });

    return { firebaseUser, userProfile };
  }

  async getUserProfile(firebaseUid: string, firebaseUser: FirebaseUser): Promise<User | null> {
    logger.debug('Getting user profile', { firebaseUid });

    const userProfile = await this.userProfileService.findByFirebaseUid(firebaseUid);

    if (!userProfile) {
      logger.debug('User profile not found', { firebaseUid });
      return null;
    }

    logger.debug('User profile retrieved', {
      firebaseUid,
      profileId: userProfile.id,
    });

    return { firebaseUser, userProfile };
  }

  async updateUserProfile(firebaseUid: string, updates: UpdateUserDto, firebaseUser: FirebaseUser): Promise<User> {
    logger.info('Updating user profile', {
      firebaseUid,
      updateFields: Object.keys(updates),
    });

    const userProfile = await this.userProfileService.updateProfile(firebaseUid, updates);

    logger.info('User profile updated successfully', {
      firebaseUid,
      profileId: userProfile?.id,
    });

    return { firebaseUser, userProfile };
  }
}
