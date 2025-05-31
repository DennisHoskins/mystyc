import { Injectable, NotFoundException } from '@nestjs/common';

import { FirebaseUser } from '@/common/interfaces/firebaseUser.interface';
import { User } from '@/common/interfaces/user.interface';
import { UserRole } from '@/common/enums/roles.enum';
import { UserProfileService } from './user-profile.service';
import { DeviceService } from '@/devices/device.service';
import { AuthEventService } from '@/auth-events/auth-event.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterSessionDto } from './dto/register-session.dto';
import { logger } from '@/util/logger';

@Injectable()
export class UserService {
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly deviceService: DeviceService,
    private readonly authEventService: AuthEventService
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

  async registerSession(
    firebaseUser: FirebaseUser,
    registerSessionDto: RegisterSessionDto,
    serverIp: string
  ): Promise<User> {
    logger.info('Registering user session', {
      firebaseUid: firebaseUser.uid,
      deviceId: registerSessionDto.device.deviceId,
      authType: registerSessionDto.authEvent.type,
      platform: registerSessionDto.device.platform
    }, 'UserService');

    try {
      // Get or create user profile
      const user = await this.getOrCreateUser(firebaseUser);

      // Register/update device
      const device = await this.deviceService.upsertDevice(
        firebaseUser.uid,
        registerSessionDto.device
      );

      // Record auth event with server IP
      const authEventDto = {
        ...registerSessionDto.authEvent,
        ip: serverIp // Use server-detected IP, not client-provided
      };

      await this.authEventService.recordAuthEvent(
        firebaseUser.uid,
        authEventDto
      );

      // Update current device ID on user profile
      const updatedProfile = await this.userProfileService.updateProfile(
        firebaseUser.uid,
        { currentDeviceId: device.deviceId }
      );

      if (!updatedProfile) {
        logger.error('Failed to update current device ID', {
          firebaseUid: firebaseUser.uid,
          deviceId: device.deviceId
        }, 'UserService');
        
        throw new NotFoundException('User profile not found during device update');
      }

      logger.info('Session registered successfully', {
        firebaseUid: firebaseUser.uid,
        deviceId: device.deviceId,
        currentDeviceId: updatedProfile.currentDeviceId,
        authType: registerSessionDto.authEvent.type
      }, 'UserService');

      return {
        firebaseUser,
        userProfile: updatedProfile
      };
    } catch (error) {
      logger.error('Session registration failed', {
        firebaseUid: firebaseUser.uid,
        deviceId: registerSessionDto.device.deviceId,
        error: error.message
      }, 'UserService');

      throw error;
    }
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

    logger.info('UserProfileService.updateProfile returned:', {
      firebaseUid,
      userProfile,
      isNull: userProfile === null,
      profileId: userProfile?.id,
    });

    if (!userProfile) {
      logger.error('User profile update failed - user not found', { firebaseUid });
      throw new NotFoundException('User profile not found');
    }

    const result = { firebaseUser, userProfile };
    
    logger.info('User profile updated successfully - returning result:', {
      firebaseUid,
      profileId: userProfile.id,
      resultStructure: {
        hasFirebaseUser: !!result.firebaseUser,
        hasUserProfile: !!result.userProfile,
        firebaseUserUid: result.firebaseUser?.uid,
        userProfileId: result.userProfile?.id
      }
    });

    return result;
  }
}