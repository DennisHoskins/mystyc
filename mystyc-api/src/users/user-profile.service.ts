import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserProfileDocument } from './schemas/userProfile.schema';
import { UserProfile } from '@/common/interfaces/userProfile.interface';
import { UserRole } from '@/common/enums/roles.enum';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { BaseAdminQueryDto } from '@/admin/dto/base-admin-query.dto';
import { logger } from '@/common/util/logger';

@Injectable()
export class UserProfileService {
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
        error: error.message
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
   * Retrieves user profiles with pagination and sorting (admin use)
   * @param query - Query parameters including limit, offset, sortBy, sortOrder
   * @returns Promise<UserProfile[]> - Array of user profiles with applied query params
   */
  async findAll(query: BaseAdminQueryDto): Promise<UserProfile[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
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

  // POST/PUT/PATCH Methods (Write Operations)

  /**
   * Creates a new user profile in the database
   * @param createUserDto - User creation data including firebaseUid, email, and roles
   * @returns Promise<UserProfile> - Created user profile object
   * @throws ConflictException when user creation fails (duplicate key, validation errors)
   */
  async create(createUserDto: CreateUserProfileDto): Promise<UserProfile> {
    logger.info('Creating new user profile', {
      firebaseUid: createUserDto.firebaseUid,
      email: createUserDto.email,
    }, 'UserProfileService');

    try {
      const newUser = new this.userModel(createUserDto);
      const savedUser = await newUser.save();

      logger.info('User profile created successfully', {
        firebaseUid: createUserDto.firebaseUid,
        profileId: savedUser._id.toString(),
      }, 'UserProfileService');

      return this.transformToUserProfile(savedUser);
    } catch (err) {
      logger.error('Failed to create user profile', {
        firebaseUid: createUserDto.firebaseUid,
        error: err.message,
        code: err.code,
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
  async updateProfile(firebaseUid: string, updates: UpdateUserProfileDto): Promise<UserProfile> {
    logger.info('Updating user profile', {
      firebaseUid,
      updateFields: Object.keys(updates),
    }, 'UserProfileService');

    const updatedUser = await this.userModel.findOneAndUpdate(
      { firebaseUid },
      updates,
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
   * Updates user roles for authorization purposes
   * @param firebaseUid - Firebase user unique identifier
   * @param roles - Array of user roles to assign
   * @returns Promise<UserProfile> - Updated user profile object
   * @throws NotFoundException when user profile is not found
   */
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

  // Utility Methods

  /**
   * Transforms MongoDB document to clean UserProfile interface
   * @param doc - MongoDB user profile document
   * @returns UserProfile - Clean user profile object
   */
  private transformToUserProfile(doc: UserProfileDocument): UserProfile {
    return {
      id: doc._id.toString(),
      firebaseUid: doc.firebaseUid,
      email: doc.email,
      fullName: doc.fullName,
      dateOfBirth: doc.dateOfBirth,
      zodiacSign: doc.zodiacSign,
      roles: doc.roles,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}