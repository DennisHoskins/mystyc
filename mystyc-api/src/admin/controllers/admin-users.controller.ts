import { Controller } from '@nestjs/common';

import { UserProfileService } from '@/users/user-profile.service';
import { UserProfile } from '@/common/interfaces/userProfile.interface';
import { AdminController } from './admin.controller';

@Controller('admin/users')
export class AdminUsersController extends AdminController<UserProfile> {
  protected serviceName = 'Users';
  
  constructor(protected service: UserProfileService) {
    super();
  }
}