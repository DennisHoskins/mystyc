export interface StatDefinition {
  key: string;
  method: string;
  endpoint?: string;
}

export interface StatsModuleConfig {
  service: any;
  serviceName: string;
  stats: StatDefinition[];
}

export const STATS_REGISTRY = new Map<string, StatsModuleConfig>();

export function RegisterStatsModule(config: StatsModuleConfig) {
  return function(target: any) {
    STATS_REGISTRY.set(config.serviceName, config);
    return target;
  };
}