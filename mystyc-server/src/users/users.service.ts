import { Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';

import { z } from 'zod';
import { FirebaseUser, User, Device, validateUserSafe } from 'mystyc-common/schemas/';
import { UserRole, SubscriptionLevel } from 'mystyc-common/constants/';
import { LoginRegisterRequestSchema, LogoutRequestSchema } from 'mystyc-common/schemas/requests';
import { CreateUserProfileSchema } from 'mystyc-common/schemas/user-profile.schema';

import { logger } from '@/common/util/logger';
import { DevicesService } from '@/devices/devices.service';
import { AuthEventsService } from '@/auth-events/auth-events.service';
import { UserProfilesService } from './user-profiles.service';

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
    loginRegisterDto: z.infer<typeof LoginRegisterRequestSchema>,
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
        error
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
    logoutDto: z.infer<typeof LogoutRequestSchema>,
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
        error
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
    serverIp: string,
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
        error
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

      const userData = { firebaseUser, userProfile, device };

      const validation = validateUserSafe(userData);
      if (!validation.success) {
        throw validation.error;
      }

      return {
        user: validation.data, 
        isNewUser: false
      };
    }

    logger.info('Creating new user from Firebase auth', {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
    });

    const createUserDto: z.infer<typeof CreateUserProfileSchema> = {
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
        error
      }, 'UsersService');

      throw error;
    }
  }

  /**
   * Creates a Stripe subscription checkout session for a user
   * @param firebaseUser - Firebase authentication user object
   * @param priceId - Stripe price ID for the subscription plan (e.g., 'price_plus_monthly', 'price_pro_yearly')
   * @param successUrl - Frontend URL to redirect to after successful payment completion
   * @param cancelUrl - Frontend URL to redirect to if user cancels the payment process
   * @returns Promise<Stripe.Checkout.Session> - Stripe checkout session object with payment URL
   */
  async createSubscriptionSession(
    firebaseUid: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    logger.info('Creating subscription session', { firebaseUid, priceId });

    const stripeCustomerId = await this.userProfileService.createStripeCustomer(firebaseUid);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        firebaseUid,
      },
    });

    logger.info('Subscription session created', {
      firebaseUid,
      sessionId: session.id,
      customerId: stripeCustomerId
    });

    return session;
  }  

  /**
   * Creates a Stripe Customer Portal session for billing management
   * @param firebaseUid - Firebase user unique identifier  
   * @param returnUrl - URL to redirect user after portal session
   * @returns Promise<string> - Stripe customer portal URL
   * @throws NotFoundException when user profile is not found
   * @throws Error when user has no Stripe customer ID
   */
  async createCustomerPortalSession(firebaseUid: string, returnUrl: string): Promise<string> {
    logger.info('Creating customer portal session', { firebaseUid });

    const userProfile = await this.userProfileService.findByFirebaseUid(firebaseUid);
    if (!userProfile) {
      throw new NotFoundException('User not found');
    }

    if (!userProfile.stripeCustomerId) {
      throw new Error('User does not have a Stripe customer ID');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    const session = await stripe.billingPortal.sessions.create({
      customer: userProfile.stripeCustomerId,
      return_url: returnUrl,
    });

    logger.info('Customer portal session created', {
      firebaseUid,
      sessionId: session.id,
      customerId: userProfile.stripeCustomerId
    });

    return session.url!;
  }

  /**
   * Cancels user's active subscription immediately with no refund
   * @param firebaseUid - Firebase user unique identifier
   * @returns Promise<void>
   * @throws NotFoundException when user profile is not found
   * @throws Error when no active subscription found or cancellation fails
   */
  async cancelSubscription(firebaseUid: string): Promise<void> {
    logger.info('Cancelling subscription', { firebaseUid });

    const userProfile = await this.userProfileService.findByFirebaseUid(firebaseUid);
    if (!userProfile) {
      throw new NotFoundException('User not found');
    }

    if (!userProfile.stripeCustomerId) {
      throw new Error('User does not have a Stripe customer ID');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    // Find active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: userProfile.stripeCustomerId,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      throw new Error('No active subscription to cancel');
    }

    // Cancel all active subscriptions (should only be 1)
    for (const subscription of subscriptions.data) {
      await stripe.subscriptions.cancel(subscription.id);
      logger.info('Subscription cancelled', {
        firebaseUid,
        subscriptionId: subscription.id,
        customerId: userProfile.stripeCustomerId
      });
    }

    logger.info('All subscriptions cancelled successfully', {
      firebaseUid,
      cancelledCount: subscriptions.data.length
    });
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
        error
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