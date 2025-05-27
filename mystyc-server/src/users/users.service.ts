import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserProfileDocument } from './schemas/userProfile.schema';
import { UserProfile } from '../common/interfaces/userProfile.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { logger } from '@/util/logger';

@Injectable()
export class UsersService {
  constructor(@InjectModel("UserProfile") private userModel: Model<UserProfileDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserProfile> {
    logger.info('Creating new user', { 
      firebaseUid: createUserDto.firebaseUid,
      email: createUserDto.email 
    });

    try {
      const newUser = new this.userModel(createUserDto);
      const savedUser = await newUser.save();
      
      logger.info('User created successfully', { 
        firebaseUid: createUserDto.firebaseUid,
        profileId: savedUser._id.toString() 
      });
      
      return this.transformToUserProfile(savedUser);
    } catch (err) {
      logger.error('Failed to create user', { 
        firebaseUid: createUserDto.firebaseUid,
        error: err.message,
        code: err.code 
      });
      throw new ConflictException('Could not create user');
    }
  }

  async findAll(): Promise<UserProfile[]> {
    logger.debug('Finding all users');
    
    const users = await this.userModel.find().exec();
    
    logger.debug('Found users', { count: users.length });
    return users.map(user => this.transformToUserProfile(user));
  }

  async findByFirebaseUid(firebaseUid: string): Promise<UserProfile | null> {
    logger.debug('Finding user by Firebase UID', { firebaseUid });
    
    const user = await this.userModel.findOne({ firebaseUid }).exec();
    
    if (user) {
      logger.debug('User found', { 
        firebaseUid,
        profileId: user._id.toString() 
      });
      return this.transformToUserProfile(user);
    }
    
    logger.debug('User not found', { firebaseUid });
    return null;
  }

  async updateProfile(uid: string, updates: UpdateUserDto): Promise<UserProfile | null> {
    logger.info('Updating user profile', { 
      firebaseUid: uid,
      updateFields: Object.keys(updates) 
    });
    
    const updatedUser = await this.userModel.findOneAndUpdate(
      { firebaseUid: uid }, 
      updates, 
      { new: true }
    );
    
    if (updatedUser) {
      logger.info('User profile updated', { 
        firebaseUid: uid,
        profileId: updatedUser._id.toString() 
      });
      return this.transformToUserProfile(updatedUser);
    }
    
    logger.warn('User profile update failed - user not found', { firebaseUid: uid });
    return null;
  }

  async updateRoles(firebaseUid: string, roles: string[]): Promise<UserProfile> {
    logger.info('Updating user roles', { firebaseUid, roles }, 'UsersService');
    
    const updatedUser = await this.userModel.findOneAndUpdate(
      { firebaseUid },
      { roles, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      logger.warn('User roles update failed - user not found', { firebaseUid }, 'UsersService');
      throw new NotFoundException('User profile not found');
    }
    
    logger.info('User roles updated successfully', { 
      firebaseUid,
      profileId: updatedUser._id.toString(),
      newRoles: roles 
    }, 'UsersService');
    
    return this.transformToUserProfile(updatedUser);
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
      updatedAt: doc.updatedAt
    };
  }
}