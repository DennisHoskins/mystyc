import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';

import { z } from 'zod';
import { UserRole, SubscriptionLevel } from 'mystyc-common/constants';
import { UserProfile, BirthLocation } from 'mystyc-common/schemas';
import { AstrologyCalculated } from 'mystyc-common/interfaces';
import { UpdateUserProfileSchema } from 'mystyc-common/schemas/requests';
import { CreateUserProfileSchema } from 'mystyc-common/schemas/user-profile.schema';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { UserProfileDocument } from './schemas/user-profile.schema';

// Define validation schemas once at module level
const CREATE_USER_VALIDATION = CreateUserProfileSchema;
const UPDATE_PROFILE_VALIDATION = UpdateUserProfileSchema;

@Injectable()
export class UserProfilesService {
  constructor(@InjectModel('UserProfile') private userModel: Model<UserProfileDocument>) {}

  // GET Methods (Read Operations)

  /**
   * Finds user profile by MongoDB ID, returns null if not found (admin use)
   * @param id - MongoDB ObjectId as string
   * @returns Promise<UserProfile | null> - User profile if found, null if not found
   */
  async findById(id: string): Promise<UserProfile | null> {
    logger.debug('Finding user profile by ID', { id }, 'UserProfileService');

    try {
      const user = await this.userModel.findById(id).exec();

      if (!user) {
        logger.debug('User profile not found', { id }, 'UserProfileService');
        return null;
      }

      logger.debug('User profile found', {
        id,
        firebaseUid: user.firebaseUid,
      }, 'UserProfileService');

      return this.transformToUserProfile(user);
    } catch (error) {
      logger.error('Failed to find user profile by ID', {
        id,
        error
      }, 'UserProfileService');

      return null;
    }
  }

  /**
   * Finds user profile by Firebase UID, returns null if not found (service-level method)
   * @param firebaseUid - Firebase user unique identifier
   * @returns Promise<UserProfile | null> - User profile if found, null if not found
   */
  async findByFirebaseUid(firebaseUid: string): Promise<UserProfile | null> {
    logger.debug('Finding user profile by Firebase UID', { firebaseUid }, 'UserProfileService');

    const user = await this.userModel.findOne({ firebaseUid }).exec();

    if (!user) {
      logger.debug('User profile not found', { firebaseUid }, 'UserProfileService');
      return null;
    }

    logger.debug('User profile found', {
      firebaseUid,
      profileId: user._id.toString(),
    }, 'UserProfileService');

    return this.transformToUserProfile(user);
  }

  /**
   * @returns number - Retrieves userProfile records total
   */
  async getTotal(): Promise<number> {
    return await this.userModel.countDocuments();
  }  

  /**
   * Retrieves user profiles with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<UserProfile[]> - Array of user profiles with applied query params
   */
  async findAll(queryRaw: BaseAdminQuery): Promise<UserProfile[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding user profiles with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'UserProfileService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await this.userModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('User profiles found', { 
      count: users.length, 
      limit, 
      offset,
      sortBy,
      sortOrder
    }, 'UserProfileService');
    
    return users.map(user => this.transformToUserProfile(user));
  }

  /**
   * Find user profiles by array of firebaseUids with pagination
   * @param firebaseUids - Array of firebaseUids to find
   * @param query - Query parameters for pagination and sorting
   * @returns Promise<UserProfile[]> - Array of user profiles
   */
  async findByFirebaseUids(firebaseUids: string[], queryRaw: BaseAdminQuery): Promise<UserProfile[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await this.userModel
      .find({ firebaseUid: { $in: firebaseUids } })
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .exec();

    return users.map(user => this.transformToUserProfile(user));
  }

  /**
   * Find user profiles by stripe customer id
   * @param stripeCustomerId - Stripe customer identifier
   * @returns Promise<UserProfile> Matching user profile
   */
  async findByStripeCustomerId(stripeCustomerId: string): Promise<UserProfile | null> {
    const user = await this.userModel.findOne({ stripeCustomerId }).exec();
    return user ? this.transformToUserProfile(user) : null;
  }

  /**
   * Find user profiles by subscription tier with pagination (admin use)
   * @param tier - Subscription tier to filter by
   * @param query - Query parameters for pagination and sorting
   * @returns Promise<UserProfile[]> - Array of user profiles with specified tier
   */
  async findBySubscriptionTier(tier: SubscriptionLevel, queryRaw: BaseAdminQuery): Promise<UserProfile[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding user profiles by subscription tier', { 
      tier,
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'UserProfileService');

    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await this.userModel
      .find({ 'subscription.level': tier })
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .exec();

    logger.debug('User profiles found by subscription tier', {
      tier,
      count: users.length,
      limit,
      offset,
      sortBy,
      sortOrder
    }, 'UserProfileService');

    return users.map(user => this.transformToUserProfile(user));
  }

  /**
   * Get total count of users by subscription tier (admin use)
   * @param tier - Subscription tier to count
   * @returns Promise<number> - Count of users with specified tier
   */
  async getTotalBySubscriptionTier(tier: SubscriptionLevel): Promise<number> {
    return await this.userModel.countDocuments({ 'subscription.level': tier });
  }

  // POST/PUT/PATCH Methods (Write Operations)

  /**
   * Creates a new user profile in the database
   * @param createUserDto - User creation data including firebaseUid, email, and roles
   * @returns Promise<UserProfile> - Created user profile object
   * @throws ConflictException when user creation fails (duplicate key, validation errors)
   */
  async create(createUserDto: z.infer<typeof CreateUserProfileSchema>): Promise<UserProfile> {
    logger.info('Creating new user profile', {
      firebaseUid: createUserDto.firebaseUid,
      email: createUserDto.email,
    }, 'UserProfileService');

    try {
      const validatedData = CREATE_USER_VALIDATION.parse(createUserDto);
      const newUser = new this.userModel(validatedData);
      const savedUser = await newUser.save();

      logger.info('User profile created successfully', {
        firebaseUid: createUserDto.firebaseUid,
        profileId: savedUser._id.toString(),
      }, 'UserProfileService');

      return this.transformToUserProfile(savedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('User profile validation failed', {
          firebaseUid: createUserDto.firebaseUid,
          errors: error.flatten().fieldErrors,
        }, 'UserProfileService');
        throw new ConflictException('Invalid user data provided');
      }

      logger.error('Failed to create user profile', {
        firebaseUid: createUserDto.firebaseUid,
        error,
      }, 'UserProfileService');

      throw new ConflictException('Could not create user');
    }
  }

  /**
   * Updates user profile with provided data
   * @param firebaseUid - Firebase user unique identifier
   * @param updates - Profile update data
   * @returns Promise<UserProfile> - Updated user profile object
   * @throws NotFoundException when user profile is not found
   */
  async updateProfile(firebaseUid: string, email: string, updates: z.infer<typeof UpdateUserProfileSchema>): Promise<UserProfile> {
    logger.info('Updating user profile', {
      firebaseUid,
      email,
      updateFields: Object.keys(updates),
    }, 'UserProfileService');

    const updatedUser = await this.userModel.findOneAndUpdate(
      { firebaseUid },
      { ...updates, email },
      { new: true }
    );

    if (!updatedUser) {
      logger.warn('User profile update failed - user not found', { firebaseUid }, 'UserProfileService');
      throw new NotFoundException('User profile not found');
    }

    logger.info('User profile updated successfully', {
      firebaseUid,
      profileId: updatedUser._id.toString(),
    }, 'UserProfileService');

    return this.transformToUserProfile(updatedUser);
  }

  /**
   * Creates a stripe customer id
   * @param firebaseUid - Firebase user unique identifier
   * @param stripeCustomerId - Stripe customer identifier
   * @returns Promise<UserProfile> - Updated user profile object
   * @throws NotFoundException when user profile is not found
   */
  async createStripeCustomer(firebaseUid: string): Promise<string> {
    logger.info('Creating or retrieving Stripe customer', { firebaseUid });

    const userProfile = await this.findByFirebaseUid(firebaseUid);
    if (!userProfile) throw new NotFoundException('User not found');

    // If user already has a Stripe customer, return it
    if (userProfile.stripeCustomerId) {
      logger.debug('User already has Stripe customer', { 
        firebaseUid, 
        stripeCustomerId: userProfile.stripeCustomerId 
      });
      return userProfile.stripeCustomerId;
    }

    // Create new Stripe customer
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    // Combine firstName and lastName for Stripe customer name
    const customerName = userProfile.firstName && userProfile.lastName 
      ? `${userProfile.firstName} ${userProfile.lastName}` 
      : userProfile.firstName || userProfile.lastName || undefined;
      
    const customer = await stripe.customers.create({
      email: userProfile.email,
      name: customerName,
      metadata: { 
        firebaseUid,
        source: 'mystyc-server'
      }
    });

    // Save Stripe customer ID to user profile
    await this.updateStripeCustomerId(firebaseUid, customer.id);

    logger.info('Stripe customer created and linked', {
      firebaseUid,
      stripeCustomerId: customer.id
    });

    return customer.id;
  }

  /**
   * Updates stripe customer id
   * @param firebaseUid - Firebase user unique identifier
   * @param stripeCustomerId - Stripe customer identifier
   * @returns Promise<UserProfile> - Updated user profile object
   * @throws NotFoundException when user profile is not found
   */
  async updateStripeCustomerId(firebaseUid: string, stripeCustomerId: string): Promise<UserProfile> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { firebaseUid },
      { stripeCustomerId, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedUser) {
      throw new NotFoundException('User profile not found');
    }

    return this.transformToUserProfile(updatedUser);
  }

  /**
   * Updates user roles for authorization purposes
   * @param firebaseUid - Firebase user unique identifier
   * @param roles - Array of user roles to assign
   * @returns Promise<UserProfile> - Updated user profile object
   * @throws NotFoundException when user profile is not found
   */
  async updateRoles(firebaseUid: string, roles: UserRole[]): Promise<UserProfile> {
    logger.info('Updating user roles', { firebaseUid, roles }, 'UserProfileService');

    const updatedUser = await this.userModel.findOneAndUpdate(
      { firebaseUid },
      { roles, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      logger.warn('User roles update failed - user not found', { firebaseUid }, 'UserProfileService');
      throw new NotFoundException('User profile not found');
    }

    logger.info('User roles updated successfully', {
      firebaseUid,
      profileId: updatedUser._id.toString(),
      newRoles: roles
    }, 'UserProfileService');

    return this.transformToUserProfile(updatedUser);
  }

  /**
   * Updates user subscription tier for subscription management
   * @param firebaseUid - Firebase user unique identifier
   * @param tier - Subscription tier to assign
   * @param startDate - Optional start date for paid subscriptions
   * @returns Promise<UserProfile> - Updated user profile object
   * @throws NotFoundException when user profile is not found
   */
  async updateSubscriptionTier(firebaseUid: string, tier: SubscriptionLevel, startDate?: Date | null): Promise<UserProfile> {
    logger.info('Updating user subscription tier', { firebaseUid, tier, startDate }, 'UserProfileService');

    const updates: any = { 
      'subscription.level': tier,
      updatedAt: new Date()
    };

    // Set start date for paid subscriptions
    if (startDate) {
      updates['subscription.startDate'] = startDate;
    } else if (tier !== SubscriptionLevel.USER) {
      // If upgrading to paid tier without explicit start date, use current date
      updates['subscription.startDate'] = new Date();
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { firebaseUid },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      logger.warn('User subscription tier update failed - user not found', { firebaseUid }, 'UserProfileService');
      throw new NotFoundException('User profile not found');
    }

    logger.info('User subscription tier updated successfully', {
      firebaseUid,
      profileId: updatedUser._id.toString(),
      newTier: tier,
      startDate: updates['subscription.startDate']
    }, 'UserProfileService');

    return this.transformToUserProfile(updatedUser);
  }

  /**
   * Updates user credit balance for PRO users
   * @param firebaseUid - Firebase user unique identifier
   * @param credits - Credit amount to set (positive number)
   * @returns Promise<UserProfile> - Updated user profile object
   * @throws NotFoundException when user profile is not found
   */
  async updateCreditBalance(firebaseUid: string, credits: number): Promise<UserProfile> {
    logger.info('Updating user credit balance', { firebaseUid, credits }, 'UserProfileService');

    const updatedUser = await this.userModel.findOneAndUpdate(
      { firebaseUid },
      { 
        $set: { 
          'subscription.creditBalance': Math.max(0, credits), // Ensure non-negative
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      logger.warn('User credit balance update failed - user not found', { firebaseUid }, 'UserProfileService');
      throw new NotFoundException('User profile not found');
    }

    logger.info('User credit balance updated successfully', {
      firebaseUid,
      profileId: updatedUser._id.toString(),
      newBalance: updatedUser.subscription.creditBalance
    }, 'UserProfileService');

    return this.transformToUserProfile(updatedUser);
  }

  // Utility Methods

  /**
   * Checks if user can access content for a specific tier and date
   * @param user - User profile to check
   * @param date - Date string in YYYY-MM-DD format
   * @param tier - Content tier to check access for
   * @returns boolean - True if user can access the content
   */
  canAccessTierContent(user: UserProfile, date: string, tier: SubscriptionLevel): boolean {
    // Free tier content is always accessible
    if (tier === SubscriptionLevel.USER) {
      return true;
    }

    // User must have at least the required tier
    if (user.subscription.level === SubscriptionLevel.USER) {
      return false; // Free users can't access paid content
    }

    // Check if user's tier is sufficient
    const tierHierarchy = [SubscriptionLevel.USER, SubscriptionLevel.PLUS, SubscriptionLevel.PRO];
    const userTierIndex = tierHierarchy.indexOf(user.subscription.level);
    const requiredTierIndex = tierHierarchy.indexOf(tier);
    
    if (userTierIndex < requiredTierIndex) {
      return false; // User tier is insufficient
    }

    // Check subscription start date for paid content
    if (!user.subscription.startDate) {
      return false; // No subscription start date
    }

    // Compare dates at DAY level, not timestamp level
    const requestDateString = date; // Already in YYYY-MM-DD format
    const subscriptionStartString = new Date(user.subscription.startDate).toISOString().split('T')[0];
    
    // User can access content from their subscription start date forward (day level)
    return requestDateString >= subscriptionStartString;
  }

  /**
   * Transforms MongoDB document to clean UserProfile interface
   * @param doc - MongoDB user profile document
   * @returns UserProfile - Clean user profile object
   */
  private transformToUserProfile(doc: UserProfileDocument): UserProfile {
    let astrology;
    if (doc.astrology) {
      const astrologyPlain = JSON.parse(JSON.stringify(doc.astrology));
      astrology = {
        ...astrologyPlain,
        createdAt: new Date(astrologyPlain.createdAt),
        lastCalculatedAt: new Date(astrologyPlain.lastCalculatedAt)
      };
    }

    return {
      id: doc._id.toString(),
      firebaseUid: doc.firebaseUid,
      email: doc.email,
      firstName: doc.firstName,
      lastName: doc.lastName,
      dateOfBirth: doc.dateOfBirth,
      timeOfBirth: doc.timeOfBirth,
      hasTimeOfBirth: doc.hasTimeOfBirth,
      birthLocation: doc.birthLocation ? JSON.parse(JSON.stringify(doc.birthLocation)) : undefined,
      astrology: astrology,
      roles: doc.roles,
      stripeCustomerId: doc.stripeCustomerId,
      subscription: JSON.parse(JSON.stringify(doc.subscription)),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}