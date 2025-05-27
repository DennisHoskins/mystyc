import { Injectable } from '@nestjs/common';

import { FirebaseUser } from '../common/interfaces/firebaseUser.interface';
import { User } from '../common/interfaces/user.interface';
import { UserRole } from '@/common/enums/roles.enum';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { logger } from '@/util/logger';

@Injectable()
export class UserAuthService {

  constructor(private readonly userProfileService: UsersService) {}

  async getOrCreateUser(firebaseUser: FirebaseUser): Promise<User> {
    logger.debug('Getting or creating user', { firebaseUid: firebaseUser.uid });
    
    // Try to find existing user
    let userProfile = await this.userProfileService.findByFirebaseUid(firebaseUser.uid);
    
    if (userProfile) {
      logger.debug('Existing user found', { 
        firebaseUid: firebaseUser.uid,
        profileId: userProfile.id 
      });
      return { firebaseUser, userProfile };
    }

    // Create new user with defaults
    logger.info('Creating new user from Firebase auth', { 
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email 
    });

    const createUserDto: CreateUserDto = {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email || '',
      roles: [UserRole.USER], // Default role
    };

    userProfile = await this.userProfileService.create(createUserDto);
    
    logger.info('New user created successfully', { 
      firebaseUid: firebaseUser.uid,
      profileId: userProfile.id 
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
      profileId: userProfile.id 
    });
    
    return { firebaseUser, userProfile };
  }

  async updateUserProfile(firebaseUid: string, updates: UpdateUserDto, firebaseUser: FirebaseUser): Promise<User> {
    logger.info('Updating user profile', { 
      firebaseUid, 
      updateFields: Object.keys(updates) 
    });
    
    const userProfile = await this.userProfileService.updateProfile(firebaseUid, updates);
    
    logger.info('User profile updated successfully', { 
      firebaseUid,
      profileId: userProfile.id 
    });
    
    return { firebaseUser, userProfile };
  }

  async promoteToAdmin(firebaseUid: string): Promise<User | null> {
    logger.info('Promoting user to admin', { firebaseUid });
    
    const existingProfile = await this.userProfileService.findByFirebaseUid(firebaseUid);
    if (!existingProfile) {
      logger.warn('Cannot promote user - profile not found', { firebaseUid });
      return null;
    }

    const currentRoles = existingProfile.roles || [UserRole.USER];
    if (currentRoles.includes(UserRole.ADMIN)) {
      logger.info('User is already an admin', { firebaseUid });
      return null;
    }

    const newRoles = [...currentRoles, UserRole.ADMIN];
    const updatedProfile = await this.userProfileService.updateRoles(firebaseUid, newRoles);

    logger.info('User promoted to admin successfully', { 
      firebaseUid,
      profileId: updatedProfile.id,
      newRoles 
    });

    // We don't have firebaseUser here, so return null - controller should handle this
    return null;
  }

  async revokeAdminAccess(firebaseUid: string): Promise<User | null> {
    logger.info('Revoking admin access', { firebaseUid });
    
    const existingProfile = await this.userProfileService.findByFirebaseUid(firebaseUid);
    if (!existingProfile) {
      logger.warn('Cannot revoke admin - profile not found', { firebaseUid });
      return null;
    }

    const currentRoles = existingProfile.roles || [];
    const newRoles = currentRoles.filter(role => role !== UserRole.ADMIN);

    if (currentRoles.length === newRoles.length) {
      logger.info('User was not an admin', { firebaseUid });
      return null;
    }

    const updatedProfile = await this.userProfileService.updateRoles(firebaseUid, newRoles);

    logger.info('Admin access revoked successfully', { 
      firebaseUid,
      profileId: updatedProfile.id,
      newRoles 
    });

    return null;
  }
}