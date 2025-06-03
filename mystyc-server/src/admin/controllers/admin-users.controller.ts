import { Controller, Get } from '@nestjs/common';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { UserProfileService } from '@/users/user-profile.service';
import { logger } from '@/util/logger';

@Controller('admin/users')
export class AdminUsersController {

  constructor(
    private readonly userProfileService: UserProfileService
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    logger.info('Admin fetching all users', {}, 'AdminUsersController');
    
    const users = await this.userProfileService.findAll();
    
    logger.info('Admin users list retrieved', { count: users.length }, 'AdminUsersController');
    return users;
  }
}