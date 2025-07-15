import { Injectable, OnModuleInit } from '@nestjs/common';
import OpenAI from 'openai';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OnEvent } from '@nestjs/event-emitter';

import { OpenAIUsageDocument, OpenAIUsage } from './schemas/openai-usage.schema';
import { OpenAIRequestDocument, OpenAIRequest } from './schemas/openai-request.schema';
import { OpenAIRequest as OpenAIRequestInterface } from '@/common/interfaces/openai-request.interface';
import { logger } from '@/common/util/logger';

@Injectable()
export class OpenAICoreService implements OnModuleInit {
  protected openai: OpenAI;

  protected MAX_RETRIES = 2; // Maximum number of retry attempts
  protected REQUEST_TIMEOUT_MS = 30000; // 30 seconds timeout
  protected MONTHLY_BUDGET = 10.00; // $/month budget
  protected TOKEN_BUDGET = Math.floor(this.MONTHLY_BUDGET * 50000);
  protected MAX_TOKENS_PER_REQUEST = 500; // ~$0.15 max per request
  protected ESTIMATED_REQUEST_COST = 0.20; // Buffer for budget checking

  constructor(
    @InjectModel(OpenAIUsage.name) private usageModel: Model<OpenAIUsageDocument>,
    @InjectModel(OpenAIRequest.name) protected requestModel: Model<OpenAIRequestDocument>,
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
      console.log('Current OpenAI usage stats', { ...stats, remainingTokens, remainingCost }, 'OpenAIService');      
    } catch (err) {
      logger.error('Initial usage sync failed', { error: (err as Error).message }, 'OpenAIService');
    }
  }

  protected async saveRequestRecord(data: {
    prompt: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    requestType: string;
    linkedEntityId: string;
    model: string;
    retryCount: number;
    error?: string;
  }): Promise<OpenAIRequestDocument> {
    const request = new this.requestModel(data);
    return request.save();
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

      // Aggregate token usage via local requestModel
      const startIso = monthStartDate.toISOString();
      const endIso = new Date().toISOString();
      const agg = await this.requestModel.aggregate([
        { $match: { createdAt: { $gte: new Date(startIso), $lt: new Date(endIso) } } },
        { $group: { _id: null, totalInput: { $sum: '$inputTokens' }, totalOutput: { $sum: '$outputTokens' } } }
      ]);
      const tokensUsed = (agg[0]?.totalInput || 0) + (agg[0]?.totalOutput || 0);

      const month = startIso.substring(0, 7);
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
    tokensUsed: number;
    tokenBudget: number;
    tokenUsagePercent: number;
    costUsed: number;
    costBudget: number;
    costUsagePercent: number;
  }> {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const usage = await this.usageModel.findOne({ month: currentMonth }).exec();
    const lastSyncedAt = usage.lastSyncedAt;
    const tokensUsed = usage?.tokensUsed || 0;
    const costUsed = usage?.costUsed || 0;
    const tokenBudget = usage?.tokenBudget || this.TOKEN_BUDGET;
    const costBudget = usage?.costBudget || this.MONTHLY_BUDGET;
    return {
      month: currentMonth,
      lastSyncedAt,
      tokensUsed,
      tokenBudget,
      tokenUsagePercent: Math.min(100, (tokensUsed / tokenBudget) * 100),
      costUsed,
      costBudget,
      costUsagePercent: Math.min(100, (costUsed / costBudget) * 100),
    };
  }

  protected calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * 0.000075;
    const outputCost = (outputTokens / 1000) * 0.0003;
    return Number((inputCost + outputCost).toFixed(6));
  }

  protected async incrementUsage(tokens: number, cost: number): Promise<void> {
    const currentMonth = new Date().toISOString().substring(0, 7);
    await this.usageModel.findOneAndUpdate(
      { month: currentMonth },
      { $inc: { tokensUsed: tokens, costUsed: cost }, $setOnInsert: { tokenBudget: this.TOKEN_BUDGET, costBudget: this.MONTHLY_BUDGET }, $set: { lastSyncedAt: new Date() } },
      { upsert: true },
    );
  }

  async findById(id: string): Promise<any> {
    return this.requestModel.findById(id).exec();
  }

  async getTotal(): Promise<number> {
    return this.requestModel.countDocuments();
  }

  async findAll(query: any): Promise<any[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    return this.requestModel.find().sort(sortObj).skip(offset).limit(limit).exec();
  }

  protected transformToRequest(doc: OpenAIRequestDocument): OpenAIRequestInterface {
    return {
      _id: doc._id.toString(),
      prompt: doc.prompt,
      inputTokens: doc.inputTokens,
      outputTokens: doc.outputTokens,
      cost: doc.cost,
      requestType: doc.requestType,
      linkedEntityId: doc.linkedEntityId,
      model: doc.model,
      retryCount: doc.retryCount,
      error: doc.error,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
