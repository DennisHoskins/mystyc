import { Controller, Query, Get, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { OpenAIService } from '@/openai/openai.service';
import { AdminOpenAIStatsService } from '@/admin/services/admin-openai-stats.service';
import { OpenAIRequest } from '@/common/interfaces/openai-request.interface';
import { 
  OpenAIRequestSummaryStats,
  OpenAIRequestStats
} from '@/common/interfaces/admin/stats/admin-openai-request-stats.interface';
import { AdminController } from '../admin.controller';
import { AdminStatsQueryDto } from '@/admin/dto/admin-stats-query.dto'; 

@Controller('admin/stats/openai')
export class AdminOpenAIStatsController extends AdminController<OpenAIRequest> {
  protected serviceName = 'OpenAI';

  constructor(
    protected service: OpenAIService,
    private readonly adminOpenAIStatsService: AdminOpenAIStatsService,
  ) {
    super();
  }

  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats(@Query() query: AdminStatsQueryDto): Promise<OpenAIRequestStats> {
    const [summary] = await Promise.all([
      this.adminOpenAIStatsService.getSummaryStats(query),
    ]);
    return {
      summary,
    }
  }

  @Get('stats/summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSummaryStats(@Query() query: AdminStatsQueryDto): Promise<OpenAIRequestSummaryStats> {
    return this.adminOpenAIStatsService.getSummaryStats(query);
  }
}