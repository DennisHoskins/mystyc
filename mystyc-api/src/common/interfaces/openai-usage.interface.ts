export interface OpenAIUsage {
  month: string;         // "YYYY-MM"
  tokensUsed: number;
  costUsed: number;      // in USD
  tokenBudget: number;
  costBudget: number;    // in USD
  lastSyncedAt?: Date;
}
