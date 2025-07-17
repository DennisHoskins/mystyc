import { Injectable, NotFoundException } from '@nestjs/common';

import { FirebaseUser } from '@/common/interfaces/firebase-user.interface';
import { User } from '@/common/interfaces/user.interface';
import { UserRole } from '@/common/enums/roles.enum';
import { SubscriptionLevel } from '@/common/enums/subscription-levels.enum';
import { Device } from '@/common/interfaces/device.interface';
import { UserProfilesService } from './user-profiles.service';
import { DevicesService } from '@/devices/devices.service';
import { AuthEventsService } from '@/auth-events/auth-events.service';
import { AuthEventLoginRegisterDto } from '@/auth-events/dto/auth-event-login-register.dto';
import { AuthEventLogoutDto } from '@/auth-events/dto/auth-event-logout.dto';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { logger } from '@/common/util/logger';

@Injectable()
export class UsersService {
  constructor(
    private readonly userProfileService: UserProfilesService,
    private readonly deviceService: DevicesService,
    private readonly authEventService: AuthEventsService
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
    }, 'UsersService');

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
        email: firebaseUser.email,
        deviceId: loginRegisterDto.device.deviceId,
        deviceName: device.deviceName,
        type: type,
        ip: serverIp,
        clientTimestamp: loginRegisterDto.clientTimestamp
      };

      await this.authEventService.recordAuthEvent(authEventDto);

      logger.info('User session registered successfully', {
        firebaseUid: firebaseUser.uid,
        deviceId: device.deviceId,
        authType: type
      }, 'UsersService');

      return user;
    } catch (error) {
      logger.error('User session registration failed', {
        firebaseUid: firebaseUser.uid,
        deviceId: loginRegisterDto.device.deviceId,
        error: error.message
      }, 'UsersService');

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
      deviceId: logoutDto.device.deviceId,
      authType: 'logout',
    }, 'UsersService');

    try {
      // Get device to verify it exists
      const device = await this.deviceService.findByDeviceId(logoutDto.device.deviceId);

      if (!device) {
        throw new Error('Device not found');
      }

      // Clear FCM token for device
      await this.deviceService.logoutDevice(
        firebaseUser.uid,
        logoutDto.device.deviceId,
        logoutDto.clientTimestamp
      );

      // Record logout auth event
      const authEventDto = {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        deviceId: logoutDto.device.deviceId,
        deviceName: device.deviceName,
        type: 'logout' as const,
        ip: serverIp,
        clientTimestamp: logoutDto.clientTimestamp
      };

      await this.authEventService.recordAuthEvent(authEventDto);

      logger.info('User session logged out successfully', {
        firebaseUid: firebaseUser.uid,
        deviceId: device.deviceId,
        authType: 'logout'
      }, 'UsersService');

      return null;
    } catch (error) {
      logger.error('User session logout failed', {
        firebaseUid: firebaseUser.uid,
        deviceId: logoutDto.device.deviceId,
        error: error.message
      }, 'UsersService');

      throw error;
    }
  }

  /**
   * Clears FCM token from device during logout to stop push notifications
   * @param firebaseUid - Firebase user unique identifier
   * @param deviceId - Device unique identifier
   * @throws NotFoundException when device is not found
   */
  async serverLogout(
    firebaseUid: string, 
    deviceId: string, 
    clientTimestamp: string,
    serverIp
  ): Promise<null> {
    logger.info('Server Logout', {
      firebaseUid: firebaseUid,
      deviceId: deviceId
    }, 'UsersService');

    try {
      const userProfile = await this.userProfileService.findByFirebaseUid(firebaseUid);
      if (!userProfile) {
        throw new Error('User not found');
      }

      // Get device to verify it exists
      const device = await this.deviceService.findByDeviceId(deviceId);

      if (!device) {
        throw new Error('Device not found');
      }

      // Clear FCM token for device
      await this.deviceService.logoutDevice(
        firebaseUid,
        deviceId,
        clientTimestamp
      );

      logger.info('FCM token cleared successfully', {
        firebaseUid: firebaseUid,
        deviceId,
      }, 'UsersService');

      // Record logout auth event
      const authEventDto = {
        firebaseUid: firebaseUid,
        email: userProfile.email,
        deviceId: deviceId,
        deviceName: device.deviceName,
        type: 'server-logout' as const,
        ip: serverIp,
        clientTimestamp: clientTimestamp
      };

      await this.authEventService.recordAuthEvent(authEventDto);

      logger.info('User session logged out successfully', {
        firebaseUid: firebaseUid,
        deviceId: device.deviceId,
        authType: 'server-logout'
      }, 'UsersService');

      return null;
    } catch (error) {
      logger.error('Server Logout FCM token update failed', {
        firebaseUid: firebaseUid,
        deviceId: deviceId,
        error: error.message
      }, 'UsersService');

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
      subscription: {
        level: SubscriptionLevel.USER,
        startDate: null, // No paid subscription yet
        creditBalance: 0
      }      
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
      }, 'UsersService');

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
      }, 'UsersService');
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