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
  DailyContentStats,
  DailyContentSourceStats,
  DailyContentGenerationStats,
  DailyContentTimelineStats
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
    const [summary, sources, generation, timeline] = await Promise.all([
      this.adminDailyContentStatsService.getSummaryStats(query),
      this.adminDailyContentStatsService.getSourceStats(query),
      this.adminDailyContentStatsService.getGenerationStats(query),
      this.adminDailyContentStatsService.getTimelineStats(query),
    ]);
    return {
      summary,
      sources,
      generation,
      timeline
    }
  }

  @Get('stats/summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSummaryStats(@Query() query: DailyContentStatsQueryDto): Promise<DailyContentSummaryStats> {
    return this.adminDailyContentStatsService.getSummaryStats(query);
  }

  @Get('stats/sources')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSourceStats(@Query() query: DailyContentStatsQueryDto): Promise<DailyContentSourceStats> {
    return this.adminDailyContentStatsService.getSourceStats(query);
  }

  @Get('stats/generation')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getGenerationStats(@Query() query: DailyContentStatsQueryDto): Promise<DailyContentGenerationStats> {
    return this.adminDailyContentStatsService.getGenerationStats(query);
  }

  @Get('stats/timeline')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getTimelineStats(@Query() query: DailyContentStatsQueryDto): Promise<DailyContentTimelineStats> {
    return this.adminDailyContentStatsService.getTimelineStats(query);
  }
}