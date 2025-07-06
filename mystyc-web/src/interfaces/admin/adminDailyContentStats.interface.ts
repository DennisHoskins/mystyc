export interface DailyContentSummaryStats {
  totalContent: number;
  generatedContent: number;
  failedContent: number;
  successRate: number;
  averageGenerationTime: number;
  dateRangeInDays: number;
  coverageRate: number;
}

export interface DailyContentGenerationStats {
  totalAttempts: number;
  generationsByStatus: Array<{
    status: 'generated' | 'failed' | 'fallback';
    count: number;
    percentage: number;
  }>;
  generationTimeDistribution: Array<{
    range: string; // "< 100ms", "100-500ms", etc
    count: number;
    percentage: number;
  }>;
  failureReasons: Array<{
    error: string;
    count: number;
  }>;
}

export interface DailyContentSourceStats {
  totalContent: number;
  contentBySources: Array<{
    sources: string[];
    count: number;
    percentage: number;
  }>;
  averageSourcesPerContent: number;
}

export interface DailyContentTimelineStats {
  contentByPeriod: Array<{
    date: string;
    count: number;
    hasContent: boolean;
  }>;
  missingDates: string[];
  consecutiveDaysWithContent: number;
  longestStreak: number;
}

export interface DailyContentStats {
  summary: DailyContentSummaryStats;
  generation: DailyContentGenerationStats;
  sources: DailyContentSourceStats;
  timeline: DailyContentTimelineStats;
}