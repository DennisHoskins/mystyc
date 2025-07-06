import { Controller, Query, Get, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { DailyContentService } from '@/daily-content/daily-content.service';
import { AdminDailyContentStatsService } from '@/admin/services/admin-daily-content-stats.service';
import { DailyContent } from '@/common/interfaces/dailyContent.interface';
import { 
  DailyContentSummaryStats,
  DailyContentStats
} from '@/common/interfaces/admin/adminDailyContentStats.interface';
import { AdminController } from '../admin.controller';
import { DailyContentStatsQueryDto } from '../../dto/stats/admin-daily-content-stats-query.dto';

@Controller('admin/stats/daily-content')
export class AdminDailyContentStatsController extends AdminController<DailyContent> {
  protected serviceName = 'DailyContent';

  constructor(
    protected service: DailyContentService,
    private readonly adminDailyContentStatsService: AdminDailyContentStatsService,
  ) {
    super();
  }

  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats(@Query() query: DailyContentStatsQueryDto): Promise<DailyContentStats> {
    const [summary] = await Promise.all([
      this.adminDailyContentStatsService.getSummaryStats(query),
    ]);
    return {
      summary,
    }
  }

  @Get('stats/summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getEventSummaryStats(@Query() query: DailyContentStatsQueryDto): Promise<DailyContentSummaryStats> {
    return this.adminDailyContentStatsService.getSummaryStats(query);
  }
}