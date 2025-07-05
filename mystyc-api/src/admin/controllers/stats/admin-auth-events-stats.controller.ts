import { Controller, Query, Get, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { AuthEventsService } from '@/auth-events/auth-events.service';
import { AdminAuthEventsStatsService } from '@/admin/services/admin-auth-events-stats.service';
import { AuthEvent } from '@/common/interfaces/authEvent.interface';
import { 
  AuthEventSummaryStats,
  AuthenticationPatternsStats,
  SessionDurationStats,
  GeographicDistributionStats
} from '@/common/interfaces/admin/adminAuthEventStats.interface';
import { AdminController } from '../admin.controller';
import { AuthEventStatsQueryDto } from '../../dto/stats/admin-auth-event-stats-query.dto';

@Controller('admin/auth-events')
export class AdminAuthEventsStatsController extends AdminController<AuthEvent> {
  protected serviceName = 'AuthEvents';

  constructor(
    protected service: AuthEventsService,
    private readonly adminAuthEventsStatsService: AdminAuthEventsStatsService,
  ) {
    super();
  }

  @Get('stats/summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getEventSummaryStats(@Query() query: AuthEventStatsQueryDto): Promise<AuthEventSummaryStats> {
    return this.adminAuthEventsStatsService.getSummaryStats(query);
  }

  @Get('stats/pattern')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getEventPatternStats(@Query() query: AuthEventStatsQueryDto): Promise<AuthenticationPatternsStats> {
    return this.adminAuthEventsStatsService.getPatternStats(query);
  }

  @Get('stats/duration')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getEventDurationStats(@Query() query: AuthEventStatsQueryDto): Promise<SessionDurationStats> {
    return this.adminAuthEventsStatsService.getSessionDurationStats(query);
  }

  @Get('stats/distribution')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getEventDistributionStats(@Query() query: AuthEventStatsQueryDto): Promise<GeographicDistributionStats> {
    return this.adminAuthEventsStatsService.getGeographicStats(query);
  }
}