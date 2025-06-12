import { Injectable, NotFoundException } from '@nestjs/common';

import { FirebaseUser } from '@/common/interfaces/firebaseUser.interface';
import { User } from '@/common/interfaces/user.interface';
import { UserRole } from '@/common/enums/roles.enum';
import { Device } from '@/common/interfaces/device.interface';
import { UserProfileService } from './user-profile.service';
import { DeviceService } from '@/devices/device.service';
import { AuthEventService } from '@/auth-events/auth-event.service';
import { AuthEventLoginRegisterDto } from '@/auth-events/dto/auth-event-login-register.dto';
import { AuthEventLogoutDto } from '@/auth-events/dto/auth-event-logout.dto';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { logger } from '@/common/util/logger';

@Injectable()
export class UserService {
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly deviceService: DeviceService,
    private readonly authEventService: AuthEventService
  ) {}

  /**
   * Registers a user session by creating/retrieving user profile, upserting device, and recording login auth event
   * @param firebaseUser - Firebase authentication user object
   * @param loginRegisterDto - Login data including device info and client timestamp
   * @param serverIp - Server IP address for auth event logging
   * @returns Promise<User> - User object with firebase user and profile data
   */
  async registerSession(
    firebaseUser: FirebaseUser,
    loginRegisterDto: AuthEventLoginRegisterDto,
    serverIp: string
  ): Promise<User> {
    logger.info('Registering user session', {
      firebaseUid: firebaseUser.uid,
      deviceId: loginRegisterDto.device.deviceId
    }, 'UserService');

    try {
      // Register/update device
      const device = await this.deviceService.upsertDevice(
        firebaseUser.uid,
        loginRegisterDto.device
      );

      // Get or create user profile
      const { user, isNewUser } = await this.getOrCreateUser(firebaseUser, device);

      const type: 'create' | 'login' = isNewUser ? 'create' : 'login';

      // Record auth event with server IP
      const authEventDto = {
        firebaseUid: firebaseUser.uid,
        deviceId: loginRegisterDto.device.deviceId,
        type: type,
        ip: serverIp,
        clientTimestamp: loginRegisterDto.clientTimestamp
      };

      await this.authEventService.recordAuthEvent(authEventDto);

      logger.info('User session registered successfully', {
        firebaseUid: firebaseUser.uid,
        deviceId: device.deviceId,
        authType: type
      }, 'UserService');

      return user;
    } catch (error) {
      logger.error('User session registration failed', {
        firebaseUid: firebaseUser.uid,
        deviceId: loginRegisterDto.device.deviceId,
        error: error.message
      }, 'UserService');

      throw error;
    }
  }

  /**
   * Logs out user by clearing device FCM token and recording logout auth event
   * @param firebaseUser - Firebase authentication user object
   * @param logoutDto - Logout data including device ID and client timestamp
   * @param serverIp - Server IP address for auth event logging
   * @returns Promise<null> - Returns null on successful logout
   */
  async logout(
    firebaseUser: FirebaseUser,
    logoutDto: AuthEventLogoutDto,
    serverIp: string
  ) {
    logger.info('Logging out user session', {
      firebaseUid: firebaseUser.uid,
      deviceId: logoutDto.deviceId,
      authType: 'logout',
    }, 'UserService');

    try {
      // Get device to verify it exists
      const device = await this.deviceService.findByDeviceId(logoutDto.deviceId);

      if (!device) {
        throw new Error('Device not found');
      }

      // Clear FCM token for device
      await this.deviceService.logoutDevice(
        firebaseUser.uid,
        logoutDto
      );

      // Record logout auth event
      const authEventDto = {
        firebaseUid: firebaseUser.uid,
        deviceId: logoutDto.deviceId,
        type: 'logout' as const,
        ip: serverIp,
        clientTimestamp: logoutDto.clientTimestamp
      };

      await this.authEventService.recordAuthEvent(authEventDto);

      logger.info('User session logged out successfully', {
        firebaseUid: firebaseUser.uid,
        deviceId: device.deviceId,
        authType: 'logout'
      }, 'UserService');

      return null;
    } catch (error) {
      logger.error('User session logout failed', {
        firebaseUid: firebaseUser.uid,
        deviceId: logoutDto.deviceId,
        error: error.message
      }, 'UserService');

      throw error;
    }
  }

  /**
   * Gets existing user or creates new user profile if it doesn't exist
   * @param firebaseUser - Firebase authentication user object
   * @returns Promise<User> - User object with firebase user and profile data
   */
  async getOrCreateUser(
    firebaseUser: FirebaseUser,
    device: Device
  ): Promise<{ user: User; isNewUser: boolean }> {
    logger.debug('Getting or creating user', { firebaseUid: firebaseUser.uid });

    const userProfile = await this.userProfileService.findByFirebaseUid(firebaseUser.uid);

    if (userProfile) {
      logger.debug('Existing user found', {
        firebaseUid: firebaseUser.uid,
        profileId: userProfile.id,
      });

      return {
        user: { firebaseUser, userProfile, device }, 
        isNewUser: false
      };
    }

    logger.info('Creating new user from Firebase auth', {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
    });

    const createUserDto: CreateUserProfileDto = {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email || '',
      roles: [UserRole.USER],
    };

    try {
      const newUserProfile = await this.userProfileService.create(createUserDto);

      logger.info('New user created successfully', {
        firebaseUid: firebaseUser.uid,
        profileId: newUserProfile.id,
      });

      return {
        user: { firebaseUser, userProfile: newUserProfile, device }, 
        isNewUser: true
      };
    } catch(error) {
      logger.error('User creation failed', {
        firebaseUid: firebaseUser.uid,
        error: error.message
      }, 'UserService');

      throw error;
    }
  }

  /**
   * Finds user by Firebase UID, returns null if not found (service-level method)
   * @param firebaseUser - Firebase authentication user object
   * @returns Promise<User | null> - User object if found, null if not found
   */
  async findUser(firebaseUser: FirebaseUser): Promise<User | null> {
    logger.debug('Finding user', { firebaseUid: firebaseUser.uid });

    try {
      const userProfile = await this.userProfileService.findByFirebaseUid(firebaseUser.uid);

      if (!userProfile) {
        logger.debug('User not found', { firebaseUid: firebaseUser.uid });
        return null;
      }

      logger.debug('User found', {
        firebaseUid: firebaseUser.uid,
        profileId: userProfile.id,
      });

      return { firebaseUser, userProfile, device: null };
    } catch(error) {
      logger.error('User lookup failed', { 
        firebaseUid: firebaseUser.uid,
        error: error.message 
      }, 'UserService');
      throw error;
    }
  }

  /**
   * Gets user by Firebase UID, throws NotFoundException if not found (controller-level method)
   * @param firebaseUser - Firebase authentication user object
   * @returns Promise<User> - User object with firebase user and profile data
   * @throws NotFoundException when user is not found
   */
  async getUser(firebaseUser: FirebaseUser): Promise<User> {
    const user = await this.findUser(firebaseUser);
    
    if (!user) {
      throw new NotFoundException(`User with Firebase UID ${firebaseUser.uid} not found`);
    }

    return user;
  }
}