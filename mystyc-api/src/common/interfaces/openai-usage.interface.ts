export interface OpenAIUsage {
  month: string;         // "YYYY-MM"
  totalQueries: number;
  tokensUsed: number;
  tokenUsagePercent: number;
  costUsed: number;      // in USD
  tokenBudget: number;
  costBudget: number;    // in USD
  costUsagePercent: number;
  lastSyncedAt?: Date;
}
