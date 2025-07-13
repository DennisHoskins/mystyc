import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import OpenAI from 'openai';

import { OpenAIUsage, OpenAIUsageDocument } from './schemas/openai-usage.schema';
import { OpenAIRequest, OpenAIRequestDocument } from './schemas/openai-request.schema';
import { OpenAIContextDto } from './dto/openai-context.dto';
import { logger } from '@/common/util/logger';

// Configuration constants
const MAX_RETRIES = 2; // Maximum number of retry attempts
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds timeout
const MONTHLY_BUDGET = 20.00; // $20/month budget
const TOKEN_BUDGET = Math.floor(MONTHLY_BUDGET * 50000);
const MAX_TOKENS_PER_REQUEST = 500; // ~$0.15 max per request
const ESTIMATED_REQUEST_COST = 0.20; // Buffer for budget checking

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(
    @InjectModel(OpenAIUsage.name) private usageModel: Model<OpenAIUsageDocument>,
    @InjectModel(OpenAIRequest.name) private requestModel: Model<OpenAIRequestDocument>,
  ) {

 console.log('');
 console.log('');
 console.log('');
 console.log('OpenAIService instance created');
 console.log('');
 console.log('');
 console.log('');
 
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: REQUEST_TIMEOUT_MS,
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

  getPrompt(date: string): string {
    return `
      Generate mystical daily content for ${date}. Include:
      1. A mystical title (max 50 characters)
      2. A mystical message (max 200 characters)

      Format as JSON:
      {
        "title": "your title here",
        "message": "your message here"
      }`;
  }

  async generateWebsiteContent(
    date: string,
    context?: OpenAIContextDto
  ): Promise<{
    title: string;
    message: string;
    success: boolean;
    openAIRequestId?: string;
    cost?: number;
    tokensUsed?: { input: number; output: number };
    retryCount?: number;
  }> {
    logger.info('Generating website content with retry protection', {
      date,
      maxRetries: MAX_RETRIES,
      hasContext: !!context
    }, 'OpenAIService');

    const prompt = this.getPrompt(date);
    let lastError: any;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await this.doGenerateWebsiteContent(date, prompt, attempt, context);
        if (result.success) {
          if (attempt > 0) {
            logger.info('OpenAI request succeeded after retries', { date, attempt, totalAttempts: attempt + 1 }, 'OpenAIService');
          }
          return { ...result, retryCount: attempt };
        }
        return { ...result, retryCount: attempt };
      } catch (error) {
        lastError = error;
        if (attempt < MAX_RETRIES && this.isRetryableError(error)) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          logger.warn('OpenAI request failed, retrying...', { date, attempt: attempt + 1, totalAttempts: MAX_RETRIES + 1, error: error.message, retryDelay: delay }, 'OpenAIService');
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          logger.error('OpenAI request failed after all retries', { date, totalAttempts: attempt + 1, maxRetries: MAX_RETRIES, error: error.message, isRetryableError: this.isRetryableError(error) }, 'OpenAIService');
          return { title: '', message: '', success: false, retryCount: attempt };
        }
      }
    }

    return { title: '', message: '', success: false, retryCount: MAX_RETRIES };
  }

  private async doGenerateWebsiteContent(
    date: string,
    prompt: string,
    retryCount = 0,
    context?: OpenAIContextDto
  ): Promise<{
    title: string;
    message: string;
    success: boolean;
    openAIRequestId?: string;
    cost?: number;
    tokensUsed?: { input: number; output: number };
  }> {
    logger.info('Executing OpenAI request', { date, prompt, retryCount, hasContext: !!context }, 'OpenAIService');

    try {
      const canAfford = await this.checkBudgetWithBuffer();
      if (!canAfford) {
        logger.warn('Monthly budget exceeded, cannot generate content', { date }, 'OpenAIService');
        return { title: '', message: '', success: false };
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: MAX_TOKENS_PER_REQUEST,
        temperature: 0.8,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from OpenAI');

      let parsedContent;
      try { parsedContent = JSON.parse(response); } catch (parseError) {
        logger.error('Failed to parse OpenAI response as JSON', { date, prompt, response: response.substring(0, 200), error: parseError.message, retryCount }, 'OpenAIService');
        throw new Error('Invalid JSON response from OpenAI');
      }

      const usage = completion.usage;
      const cost = this.calculateCost(usage.prompt_tokens, usage.completion_tokens);

      let openAIRequestId: string | undefined;
      if (context) {
        const requestRecord = await this.saveRequestRecord({
          prompt: prompt.substring(0, 500),
          inputTokens: usage.prompt_tokens,
          outputTokens: usage.completion_tokens,
          cost,
          requestType: context.requestType,
          linkedEntityId: context.linkedEntityId,
          model: 'gpt-4o-mini',
          retryCount
        });
        openAIRequestId = requestRecord._id.toString();
      }

      await this.incrementUsage(usage.prompt_tokens + usage.completion_tokens, cost);

      logger.info('Website content generated successfully', { date, prompt, cost, inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens, retryCount, openAIRequestId }, 'OpenAIService');

      return {
        title: parsedContent.title || 'Mystical Insights Await',
        message: parsedContent.message || 'The universe whispers secrets to those who listen.',
        success: true,
        openAIRequestId,
        cost,
        tokensUsed: { input: usage.prompt_tokens, output: usage.completion_tokens }
      };

    } catch (error) {
      logger.error('OpenAI content generation failed', { date, prompt, retryCount, error: error.message }, 'OpenAIService');
      if (context) {
        try {
          await this.saveRequestRecord({
            prompt: prompt.substring(0, 500),
            inputTokens: 0,
            outputTokens: 0,
            cost: 0,
            requestType: context.requestType,
            linkedEntityId: context.linkedEntityId,
            model: 'gpt-4o-mini',
            retryCount,
            error: error.message
          });
        } catch {
          logger.error('Failed to save failed request record', { error: error.message }, 'OpenAIService');
        }
      }
      throw error;
    }
  }

  private async saveRequestRecord(data: {
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
  private async checkBudgetWithBuffer(): Promise<boolean> {
    const currentMonth = new Date().toISOString().substring(0, 7);

    const monthlySpend = await this.usageModel.aggregate([
      { $match: { month: currentMonth } },
      { $group: { _id: null, totalCost: { $sum: '$costUsed' } } }
    ]);

    const currentSpend = monthlySpend[0]?.totalCost || 0;
    const remainingBudget = MONTHLY_BUDGET - currentSpend;

    logger.debug('Budget check with buffer', { currentMonth, currentSpend, monthlyBudget: MONTHLY_BUDGET, remainingBudget, estimatedRequestCost: ESTIMATED_REQUEST_COST }, 'OpenAIService');

    return remainingBudget >= ESTIMATED_REQUEST_COST;
  }

  private isRetryableError(error: any): boolean {
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
            costBudget: MONTHLY_BUDGET,
            tokenBudget: TOKEN_BUDGET,
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
    tokensUsed: number;
    tokenBudget: number;
    tokenUsagePercent: number;
    costUsed: number;
    costBudget: number;
    costUsagePercent: number;
  }> {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const usage = await this.usageModel.findOne({ month: currentMonth }).exec();
    const tokensUsed = usage?.tokensUsed || 0;
    const costUsed = usage?.costUsed || 0;
    const tokenBudget = usage?.tokenBudget || TOKEN_BUDGET;
    const costBudget = usage?.costBudget || MONTHLY_BUDGET;
    return {
      month: currentMonth,
      tokensUsed,
      tokenBudget,
      tokenUsagePercent: Math.min(100, (tokensUsed / tokenBudget) * 100),
      costUsed,
      costBudget,
      costUsagePercent: Math.min(100, (costUsed / costBudget) * 100),
    };
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * 0.000075;
    const outputCost = (outputTokens / 1000) * 0.0003;
    return Number((inputCost + outputCost).toFixed(6));
  }

  private async incrementUsage(tokens: number, cost: number): Promise<void> {
    const currentMonth = new Date().toISOString().substring(0, 7);
    await this.usageModel.findOneAndUpdate(
      { month: currentMonth },
      { $inc: { tokensUsed: tokens, costUsed: cost }, $setOnInsert: { tokenBudget: TOKEN_BUDGET, costBudget: MONTHLY_BUDGET }, $set: { lastSyncedAt: new Date() } },
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
}
