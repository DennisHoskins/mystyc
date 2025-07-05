import { Controller, Query, Get, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { UserProfilesService } from '@/users/user-profiles.service';
import { AdminUsersStatsService } from '@/admin/services/admin-users-stats.service';
import { UserProfile } from '@/common/interfaces/userProfile.interface';
import { 
  RegistrationStatsResponse,
  ProfileCompletionStats,
  UserActivityStats
} from '@/common/interfaces/admin/adminUserStats.interface';
import { AdminController } from '../admin.controller';
import { AdminUserStatsQueryDto } from '../../dto/stats/admin-user-stats-query.dto';

@Controller('admin/users')
export class AdminUsersStatsController extends AdminController<UserProfile> {
  protected serviceName = 'Users';

  constructor(
    protected service: UserProfilesService,
    private readonly adminUsersStatsService: AdminUsersStatsService,
  ) {
    super();
  }

  @Get('stats/registration')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getRegistrationStats(@Query() query: AdminUserStatsQueryDto): Promise<RegistrationStatsResponse> {
    return this.adminUsersStatsService.getRegistrationStats(query);
  }

  @Get('stats/profile-completion')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getProfileCompletionStats(@Query() query: AdminUserStatsQueryDto): Promise<ProfileCompletionStats> {
    return this.adminUsersStatsService.getProfileCompletionStats(query);
  }

  @Get('stats/activity')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getActivityStats(@Query() query: AdminUserStatsQueryDto): Promise<UserActivityStats> {
    return this.adminUsersStatsService.getActivityStats(query);
  }
}