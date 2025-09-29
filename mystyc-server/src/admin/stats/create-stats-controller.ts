import { Get, Query, Param, UseGuards, NotFoundException } from '@nestjs/common';

import { UserRole } from 'mystyc-common/constants/roles.enum';
import { AdminStatsQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { STATS_REGISTRY } from './stats-registry';

export function createStatsController<T>(moduleName: string) {
  const config = STATS_REGISTRY.get(moduleName);
  
  if (!config) {
    throw new Error(`Stats module ${moduleName} not found in registry`);
  }

  class DynamicStatsController {
    public serviceName = config!.serviceName;
    
    constructor(public service: any) {}

    // Main aggregated endpoint - calls all stat methods
    @Get()
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getStats(@Query() query: AdminStatsQuery) {
      const promises = config!.stats.map(stat => 
        this.service[stat.method](query)
      );
      const results = await Promise.all(promises);
      
      return config!.stats.reduce<Record<string, any>>((acc, stat, index) => {
        acc[stat.key] = results[index];
        return acc;
      }, {});
    }

    // Individual stat endpoints - auto-generated
    @Get('stats/:statType')
    @UseGuards(FirebaseAuthGuard, RolesGuard) 
    @Roles(UserRole.ADMIN)
    async getStatByType(
      @Param('statType') statType: string, 
      @Query() query: AdminStatsQuery
    ) {
      const stat = config!.stats.find(s => s.key === statType);
      if (!stat) {
        throw new NotFoundException(`Stat type ${statType} not found`);
      }
      return this.service[stat.method](query);
    }
  }
  
  return DynamicStatsController;
}