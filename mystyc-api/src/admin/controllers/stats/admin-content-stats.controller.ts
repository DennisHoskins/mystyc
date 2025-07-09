import { Controller, Query, Get, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { ContentService } from '@/content/content.service';
import { AdminContentStatsService } from '@/admin/services/admin-content-stats.service';
import { Content } from '@/common/interfaces/content.interface';
import { 
  ContentSummaryStats,
  ContentStats,
  ContentSourceStats,
  ContentGenerationStats,
  ContentTimelineStats
} from '@/common/interfaces/admin/adminContentStats.interface';
import { AdminController } from '../admin.controller';
import { AdminStatsQueryDto } from '@/admin/dto/admin-stats-query.dto'; 

@Controller('admin/stats/content')
export class AdminContentStatsController extends AdminController<Content> {
  protected serviceName = 'Content';

  constructor(
    protected service: ContentService,
    private readonly adminContentStatsService: AdminContentStatsService,
  ) {
    super();
  }

  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats(@Query() query: AdminStatsQueryDto): Promise<ContentStats> {
    const [summary, sources, generation, timeline] = await Promise.all([
      this.adminContentStatsService.getSummaryStats(query),
      this.adminContentStatsService.getSourceStats(query),
      this.adminContentStatsService.getGenerationStats(query),
      this.adminContentStatsService.getTimelineStats(query),
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
  async getSummaryStats(@Query() query: AdminStatsQueryDto): Promise<ContentSummaryStats> {
    return this.adminContentStatsService.getSummaryStats(query);
  }

  @Get('stats/sources')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSourceStats(@Query() query: AdminStatsQueryDto): Promise<ContentSourceStats> {
    return this.adminContentStatsService.getSourceStats(query);
  }

  @Get('stats/generation')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getGenerationStats(@Query() query: AdminStatsQueryDto): Promise<ContentGenerationStats> {
    return this.adminContentStatsService.getGenerationStats(query);
  }

  @Get('stats/timeline')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getTimelineStats(@Query() query: AdminStatsQueryDto): Promise<ContentTimelineStats> {
    return this.adminContentStatsService.getTimelineStats(query);
  }
}