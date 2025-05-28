import { Injectable } from '@nestjs/common';

import { FirebaseUser } from '@/common/interfaces/firebaseUser.interface';
import { User } from '@/common/interfaces/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';

import { UserService } from './user.service';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly userService: UserService
  ) {}

  async getOrCreateUser(firebaseUser: FirebaseUser): Promise<User> {
    return this.userService.getOrCreateUser(firebaseUser);
  }

  async getUserProfile(firebaseUid: string, firebaseUser: FirebaseUser): Promise<User | null> {
    return this.userService.getUserProfile(firebaseUid, firebaseUser);
  }

  async updateUserProfile(firebaseUid: string, updates: UpdateUserDto, firebaseUser: FirebaseUser): Promise<User> {
    return this.userService.updateUserProfile(firebaseUid, updates, firebaseUser);
  }
}