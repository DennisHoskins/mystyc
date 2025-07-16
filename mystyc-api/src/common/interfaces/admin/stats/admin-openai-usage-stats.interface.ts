export interface OpenAICurrentMonthUsage {
  month: string;
  totalRequests: number;
  costUsed: number;
  costBudget: number;
  costRemaining: number;
  costUsagePercent: number;
  tokensUsed: number;
  tokenBudget: number;
  tokensRemaining: number;
  tokenUsagePercent: number;
}

export interface OpenAIUsageSummaryStats {
  currentMonth: OpenAICurrentMonthUsage;
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  averageCostPerRequest: number;
  averageTokensPerRequest: number;
}

export interface OpenAIMonthlyUsageData {
  month: string;
  requests: number;
  cost: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  retries: number;
  averageCostPerRequest: number;
  budgetUsed: number;
  budgetRemaining: number;
}

export interface OpenAIMonthlyUsageStats {
  monthlyUsage: OpenAIMonthlyUsageData[];
}

export interface OpenAIContentTypeUsageData {
  contentType: string;
  requests: number;
  cost: number;
  costPercentage: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  retries: number;
  averageCostPerRequest: number;
  averageGenerationTime: number;
}

export interface OpenAIContentTypeUsageStats {
  totalCost: number;
  usageByContentType: OpenAIContentTypeUsageData[];
} 

export interface OpenAIUsageStats {
  currentMonthlyUsage: OpenAICurrentMonthUsage,
  usageSummary: OpenAIUsageSummaryStats,
  monthlyUsage: OpenAIMonthlyUsageStats, 
  contentTypeUsage: OpenAIContentTypeUsageStats, 
}