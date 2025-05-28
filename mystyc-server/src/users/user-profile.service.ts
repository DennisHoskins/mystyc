import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserProfileDocument } from './schemas/userProfile.schema';
import { UserProfile } from '@/common/interfaces/userProfile.interface';
import { UserRole } from '@/common/enums/roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { logger } from '@/util/logger';

@Injectable()
export class UserProfileService {
  constructor(@InjectModel('UserProfile') private userModel: Model<UserProfileDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserProfile> {
    logger.info('Creating new user profile', {
      firebaseUid: createUserDto.firebaseUid,
      email: createUserDto.email,
    });

    try {
      const newUser = new this.userModel(createUserDto);
      const savedUser = await newUser.save();

      logger.info('User profile created successfully', {
        firebaseUid: createUserDto.firebaseUid,
        profileId: savedUser._id.toString(),
      });

      return this.transformToUserProfile(savedUser);
    } catch (err) {
      logger.error('Failed to create user profile', {
        firebaseUid: createUserDto.firebaseUid,
        error: err.message,
        code: err.code,
      });

      throw new ConflictException('Could not create user');
    }
  }

  async findByFirebaseUid(firebaseUid: string): Promise<UserProfile | null> {
    logger.debug('Finding user profile by Firebase UID', { firebaseUid });

    const user = await this.userModel.findOne({ firebaseUid }).exec();

    if (!user) {
      logger.debug('User profile not found', { firebaseUid });
      return null;
    }

    logger.debug('User profile found', {
      firebaseUid,
      profileId: user._id.toString(),
    });

    return this.transformToUserProfile(user);
  }

  async updateProfile(firebaseUid: string, updates: UpdateUserDto): Promise<UserProfile | null> {
    logger.info('Updating user profile', {
      firebaseUid,
      updateFields: Object.keys(updates),
    });

    const updatedUser = await this.userModel.findOneAndUpdate(
      { firebaseUid },
      updates,
      { new: true }
    );

    if (!updatedUser) {
      logger.warn('User profile update failed - user not found', { firebaseUid });
      return null;
    }

    logger.info('User profile updated', {
      firebaseUid,
      profileId: updatedUser._id.toString(),
    });

    return this.transformToUserProfile(updatedUser);
  }

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

  async findAll(): Promise<UserProfile[]> {
    logger.debug('Finding all user profiles');

    const users = await this.userModel.find().exec();

    logger.debug('User profiles found', { count: users.length });
    return users.map(user => this.transformToUserProfile(user));
  }

  async deleteAll(): Promise<number> {
    logger.warn('Deleting all user profiles');
    const result = await this.userModel.deleteMany({});
    logger.warn('All user profiles deleted', { deletedCount: result.deletedCount });
    return result.deletedCount || 0;
  }

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
