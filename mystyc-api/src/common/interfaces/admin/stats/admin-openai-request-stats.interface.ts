export interface OpenAIRequestSummaryStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number; // Percentage
  totalTokens: number;
  totalCost: number; // In dollars
  averageTokensPerRequest: number;
  averageCostPerRequest: number; // In dollars
}

export interface OpenAIRequestStats {
  summary: OpenAIRequestSummaryStats;
}