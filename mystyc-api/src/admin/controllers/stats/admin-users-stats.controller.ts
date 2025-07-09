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
  UserActivityStats,
  UserStats
} from '@/common/interfaces/admin/stats/adminUserStats.interface';
import { AdminController } from '../admin.controller';
import { AdminStatsQueryDto } from '@/admin/dto/admin-stats-query.dto'; 

@Controller('admin/stats/users')
export class AdminUsersStatsController extends AdminController<UserProfile> {
  protected serviceName = 'Users';

  constructor(
    protected service: UserProfilesService,
    private readonly adminUsersStatsService: AdminUsersStatsService,
  ) {
    super();
  }

  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats(@Query() query: AdminStatsQueryDto): Promise<UserStats> {
    const [registrations, profiles, activity] = await Promise.all([
      this.adminUsersStatsService.getRegistrationStats(query),
      this.adminUsersStatsService.getProfileCompletionStats(query),
      this.adminUsersStatsService.getActivityStats(query),
    ]);
    return {
      registrations,
      profiles,
      activity
    }
  }

  @Get('stats/registration')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getRegistrationStats(@Query() query: AdminStatsQueryDto): Promise<RegistrationStatsResponse> {
    return this.adminUsersStatsService.getRegistrationStats(query);
  }

  @Get('stats/profile-completion')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getProfileCompletionStats(@Query() query: AdminStatsQueryDto): Promise<ProfileCompletionStats> {
    return this.adminUsersStatsService.getProfileCompletionStats(query);
  }

  @Get('stats/activity')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getActivityStats(@Query() query: AdminStatsQueryDto): Promise<UserActivityStats> {
    return this.adminUsersStatsService.getActivityStats(query);
  }
}