import { Controller, Query, Get, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { ScheduleService } from '@/schedule/schedule.service';
import { AdminScheduleStatsService } from '@/admin/services/admin-schedule-stats.service';
import { Schedule } from '@/common/interfaces/schedule.interface';
import { AdminStatsQueryDto } from '@/admin/dto/admin-stats-query.dto'; 
import { 
  ScheduleSummaryStats,
  SchedulePerformanceStats,
  ScheduleFailureStats,
  ScheduleStats
} from '@/common/interfaces/admin/stats/admin-schedule-stats.interface';
import { AdminController } from '../admin.controller';

@Controller('admin/stats/schedules')
export class AdminScheduleStatsController extends AdminController<Schedule> {
  protected serviceName = 'Schedule';

  constructor(
    protected service: ScheduleService,
    private readonly adminScheduleStatsService: AdminScheduleStatsService,
  ) {
    super();
  }

  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats(@Query() query: AdminStatsQueryDto): Promise<ScheduleStats> {
    const [summary, performance, failures] = await Promise.all([
      this.adminScheduleStatsService.getSummaryStats(query),
      this.adminScheduleStatsService.getPerformanceStats(query),
      this.adminScheduleStatsService.getFailureStats(query)
    ]);
    return {
      summary,
      performance,
      failures
    };
  }

  @Get('summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSummaryStats(@Query() query: AdminStatsQueryDto): Promise<ScheduleSummaryStats> {
    return this.adminScheduleStatsService.getSummaryStats(query);
  }

  @Get('performance')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPerformanceStats(@Query() query: AdminStatsQueryDto): Promise<SchedulePerformanceStats> {
    return this.adminScheduleStatsService.getPerformanceStats(query);
  }

  @Get('failures')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getFailureStats(@Query() query: AdminStatsQueryDto): Promise<ScheduleFailureStats> {
    return this.adminScheduleStatsService.getFailureStats(query);
  }
}