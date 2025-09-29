import { Injectable, OnModuleInit } from '@nestjs/common';
import OpenAI from 'openai';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OnEvent } from '@nestjs/event-emitter';

import { OpenAIUsage as OpenAIUsageInterface, validateOpenAIUsageInputSafe } from 'mystyc-common/schemas';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { OpenAIUsageDocument, OpenAIUsage } from './schemas/openai-usage.schema';
import { OpenAIRequestDocument, OpenAIRequest } from './schemas/openai-request.schema';

@Injectable()
export class OpenAIUsageService implements OnModuleInit {
  protected openai: OpenAI;

  protected REQUEST_TIMEOUT_MS = 30000; // 30 seconds timeout
  protected MONTHLY_BUDGET = 10.00; // $/month budget
  protected TOKEN_BUDGET = Math.floor(this.MONTHLY_BUDGET * 50000);
  protected MAX_TOKENS_PER_REQUEST = 2500; // max per request
  protected ESTIMATED_REQUEST_COST = 0.20; // Buffer for budget checking

  constructor(
    @InjectModel(OpenAIUsage.name) private usageModel: Model<OpenAIUsageDocument>,
    @InjectModel(OpenAIRequest.name) private requestModel: Model<OpenAIRequestDocument>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: this.REQUEST_TIMEOUT_MS,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.syncUsageFromOpenAI();

      const stats = await this.getUsageStats();
      const remainingTokens = stats.tokenBudget - stats.tokensUsed;
      const remainingCost = stats.costBudget - stats.costUsed;
      logger.info('Current OpenAI usage stats', { ...stats, remainingTokens, remainingCost }, 'OpenAIService');      
    } catch (err) {
      logger.error('Initial usage sync failed', { error: (err as Error).message }, 'OpenAIService');
    }
  }

  // Updated budget check: match on 'month' and sum 'costUsed'
  protected async checkBudgetWithBuffer(): Promise<boolean> {
    const currentMonth = new Date().toISOString().substring(0, 7);

    const monthlySpend = await this.usageModel.aggregate([
      { $match: { month: currentMonth } },
      { $group: { _id: null, totalCost: { $sum: '$costUsed' } } }
    ]);

    const currentSpend = monthlySpend[0]?.totalCost || 0;
    const remainingBudget = this.MONTHLY_BUDGET - currentSpend;

    logger.debug('Budget check with buffer', { currentMonth, currentSpend, monthlyBudget: this.MONTHLY_BUDGET, remainingBudget, estimatedRequestCost: this.ESTIMATED_REQUEST_COST }, 'OpenAIService');

    return remainingBudget >= this.ESTIMATED_REQUEST_COST;
  }

  protected isRetryableError(error: any): boolean {
    if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') return true;
    if ([429, 500, 502, 503, 504].includes(error.status)) return true;
    return false;
  }

  @OnEvent('openai.update.usage')
  async syncUsageFromOpenAI(): Promise<void> {
    logger.info('Syncing usage via organization costs endpoint', {}, 'OpenAIService');
    try {
      const now = Math.floor(Date.now() / 1000);
      const monthStartDate = new Date();
      monthStartDate.setUTCDate(1);
      monthStartDate.setUTCHours(0, 0, 0, 0);
      const startTime = Math.floor(monthStartDate.getTime() / 1000);

      let costUsed = 0;
      let pageCursor: string | undefined;

      // Fetch paginated daily buckets
      do {
        const url = new URL('https://api.openai.com/v1/organization/costs');
        url.searchParams.set('start_time', String(startTime));
        url.searchParams.set('end_time',   String(now));
        url.searchParams.set('interval',   '1d');
        if (pageCursor) url.searchParams.set('page', pageCursor);

        const headers: Record<string, string> = {
          Authorization: `Bearer ${process.env.OPENAI_ADMIN_KEY}`
        };
        if (process.env.OPENAI_ORG_ID) {
          headers['OpenAI-Organization'] = process.env.OPENAI_ORG_ID;
        }

        const res = await fetch(url.toString(), { headers });
        if (!res.ok) {
          throw new Error(`Organization costs failed: ${res.status} ${res.statusText}`);
        }
        const body: {
          has_more: boolean;
          next_page?: string;
          data: Array<{ results: Array<{ amount: { value: number } }> }>;
        } = await res.json();

        for (const bucket of body.data) {
          for (const r of bucket.results) {
            costUsed += r.amount.value;
          }
        }
        pageCursor = body.has_more ? body.next_page : undefined;
      } while (pageCursor);

      // Aggregate token usage from local requestModel
      const startIso = monthStartDate.toISOString();
      const endIso = new Date().toISOString();

      const agg = await this.requestModel.aggregate([
        { $match: { createdAt: { $gte: new Date(startIso), $lt: new Date(endIso) } } },
        { $group: { _id: null, totalInput: { $sum: '$inputTokens' }, totalOutput: { $sum: '$outputTokens' } } }
      ]);
      const tokensUsed = (agg[0]?.totalInput || 0) + (agg[0]?.totalOutput || 0);
      const month = startIso.substring(0, 7);

      const usageData = {
        month,
        tokensUsed,
        tokenUsagePercent: Math.min(100, (tokensUsed / this.TOKEN_BUDGET) * 100),
        costUsed,
        tokenBudget: this.TOKEN_BUDGET,
        costBudget: this.MONTHLY_BUDGET,
        costUsagePercent: Math.min(100, (costUsed / this.MONTHLY_BUDGET) * 100),
        lastSyncedAt: new Date()
      };

      const validation = validateOpenAIUsageInputSafe(usageData);
      if (!validation.success) {
        throw validation.error;
      }

      await this.usageModel.findOneAndUpdate(
        { month },
        {
          $set: {
            costUsed,
            tokensUsed,
            costBudget: this.MONTHLY_BUDGET,
            tokenBudget: this.TOKEN_BUDGET,
            lastSyncedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );

      logger.info('Organization usage sync succeeded', { month, costUsed, tokensUsed }, 'OpenAIService');
    } catch (err) {
      logger.error('Organization usage sync failed', { error: (err as Error).message }, 'OpenAIService');
      const month = new Date().toISOString().substring(0, 7);
      await this.usageModel.findOneAndUpdate(
        { month },
        { $set: { lastSyncedAt: new Date() } },
        { upsert: true }
      );
    }
  }

  /**
   * Get current month usage stats
   */
  async getUsageStats(): Promise<{
    month: string;
    lastSyncedAt: Date;
    totalRequests: number;
    tokensUsed: number;
    tokenBudget: number;
    tokensRemaining: number;
    tokenUsagePercent: number;
    costUsed: number;
    costBudget: number;
    costRemaining: number;
    costUsagePercent: number;
  }> {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const usage = await this.usageModel.findOne({ month: currentMonth }).exec();
    const lastSyncedAt = usage?.lastSyncedAt || new Date();
    const totalRequests = usage?.totalRequests || 0;
    const tokensUsed = usage?.tokensUsed || 0;
    const costUsed = usage?.costUsed || 0;
    const tokenBudget = usage?.tokenBudget || this.TOKEN_BUDGET;
    const costBudget = usage?.costBudget || this.MONTHLY_BUDGET;
    return {
      month: currentMonth,
      lastSyncedAt,
      totalRequests,
      tokensUsed,
      tokenBudget,
      tokensRemaining: tokenBudget - tokensUsed,
      tokenUsagePercent: Math.min(100, (tokensUsed / tokenBudget) * 100),
      costUsed,
      costBudget,
      costRemaining: costBudget - costUsed,
      costUsagePercent: Math.min(100, (costUsed / costBudget) * 100),
    };
  }

  protected calculateCost(inputTokens: number = 0, outputTokens: number = 0): number {
    const inputCost = (inputTokens / 1000) * 0.000075;
    const outputCost = (outputTokens / 1000) * 0.0003;
    return Number((inputCost + outputCost).toFixed(6));
  }

  protected async incrementUsage(tokens: number = 0, cost: number = 0): Promise<void> {
    const currentMonth = new Date().toISOString().substring(0, 7);
    await this.usageModel.findOneAndUpdate(
      { month: currentMonth },
      { $inc: { tokensUsed: tokens, costUsed: cost, totalRequests: 1 }, $setOnInsert: { tokenBudget: this.TOKEN_BUDGET, costBudget: this.MONTHLY_BUDGET }, $set: { lastSyncedAt: new Date() } },
      { upsert: true },
    );
  }

  /**
   * Track individual OpenAI request for cost analysis
   * @param userId - Firebase UID of the user
   * @param requestType - Type of request (birth_chart or daily_insights)
   * @param inputTokens - Number of input tokens used
   * @param outputTokens - Number of output tokens used
   * @param cost - Cost in USD
   * @param contentId - Optional content ID (horoscope._id for daily_insights, null for birth_chart)
   * @param model - OpenAI model used
   */
  protected async trackRequest(
    userId: string,
    requestType: 'birth_chart' | 'daily_insights',
    inputTokens: number,
    outputTokens: number,
    cost: number,
    contentId?: string,
    model: string = 'gpt-4o-mini'
  ): Promise<void> {
    try {
      const requestData = {
        userId,
        requestType,
        inputTokens,
        outputTokens,
        cost,
        contentId: contentId || undefined, // Explicitly set to undefined if null/empty
        model
      };

      const newRequest = new this.requestModel(requestData);
      await newRequest.save();

      logger.debug('OpenAI request tracked', {
        userId,
        requestType,
        inputTokens,
        outputTokens,
        cost,
        contentId,
        model
      }, 'OpenAIUsageService');
    } catch (error) {
      logger.error('Failed to track OpenAI request', {
        userId,
        requestType,
        error
      }, 'OpenAIUsageService');
      // Don't throw - tracking failure shouldn't break the main flow
    }
  }

  async getTotal(): Promise<number> {
    return await this.usageModel.countDocuments();
  }  

  async findAll(queryRaw: BaseAdminQuery): Promise<OpenAIUsageInterface[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;

    
    logger.debug('Finding openai usage with query', { 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    }, 'NotificationsService');

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const usages = await this.usageModel
      .find()
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .exec();

    logger.debug('OpenAI Usage found', {
      count: usages.length,
      limit,
      offset,
      sortBy,
      sortOrder
    }, 'OpenAICoreService');

    return usages.map(usage => this.transformToUsage(usage));
  }

  private transformToUsage(doc: OpenAIUsageDocument): OpenAIUsageInterface {
    return {
      month: doc.month,
      totalRequests: doc.totalRequests || 0,
      tokensUsed: doc.tokensUsed,
      tokenUsagePercent: Math.min(100, (doc.tokensUsed / doc.tokenBudget) * 100),
      costUsed: doc.costUsed,
      tokenBudget: doc.tokenBudget,
      costBudget: doc.costBudget,
      costUsagePercent: Math.round((doc.costUsed / doc.costBudget) * 100),
      lastSyncedAt: doc.lastSyncedAt
    };
  }
}