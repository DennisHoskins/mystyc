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
const MAX_TOKENS_PER_REQUEST = 500; // ~$0.15 max per request
const ESTIMATED_REQUEST_COST = 0.20; // Buffer for budget checking

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(
    @InjectModel(OpenAIUsage.name) private usageModel: Model<OpenAIUsageDocument>,
    @InjectModel(OpenAIRequest.name) private requestModel: Model<OpenAIRequestDocument>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: REQUEST_TIMEOUT_MS,
    });
  }

  /**
   * Returns a prompt to generates mystical website content using OpenAI
   * @param date - Date for content (YYYY-MM-DD format)
   * @returns Prompt string
   */
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

  /**
   * Generates mystical website content using OpenAI with retry logic and request tracking
   * @param date - Date for content (YYYY-MM-DD format)
   * @param context - Optional OpenAI context for linking (for backward compatibility)
   * @returns Promise with content, success status, cost, tokens, and openAIRequestId
   */
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
            logger.info('OpenAI request succeeded after retries', {
              date,
              attempt,
              totalAttempts: attempt + 1
            }, 'OpenAIService');
          }
          return { ...result, retryCount: attempt };
        }
        
        // If not successful but no exception, don't retry
        return { ...result, retryCount: attempt };
        
      } catch (error) {
        lastError = error;
        
        if (attempt < MAX_RETRIES && this.isRetryableError(error)) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
          
          logger.warn('OpenAI request failed, retrying...', {
            date,
            attempt: attempt + 1,
            totalAttempts: MAX_RETRIES + 1,
            error: error.message,
            retryDelay: delay
          }, 'OpenAIService');
          
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          logger.error('OpenAI request failed after all retries', {
            date,
            totalAttempts: attempt + 1,
            maxRetries: MAX_RETRIES,
            error: error.message,
            isRetryableError: this.isRetryableError(error)
          }, 'OpenAIService');
          
          return {
            title: '',
            message: '',
            success: false,
            retryCount: attempt
          };
        }
      }
    }
    
    // Should never reach here, but just in case
    return {
      title: '',
      message: '',
      success: false,
      retryCount: MAX_RETRIES
    };
  }

  /**
   * Internal method that performs single OpenAI request with request tracking
   * @param date - Date for content (YYYY-MM-DD format)
   * @param prompt - The prompt to send to OpenAI
   * @param retryCount - Current retry attempt number
   * @param context - Optional context for request linking
   * @returns Promise with content and metadata
   */
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
      // Check budget before making request
      const canAfford = await this.checkBudgetWithBuffer();
      if (!canAfford) {
        logger.warn('Monthly budget exceeded, cannot generate content', { date }, 'OpenAIService');
        return {
          title: '',
          message: '',
          success: false
        };
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: MAX_TOKENS_PER_REQUEST,
        temperature: 0.8,
        response_format: { type: "json_object" }
      });      

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      let parsedContent;
      try {
        parsedContent = JSON.parse(response);
      } catch (parseError) {
        logger.error('Failed to parse OpenAI response as JSON', {
          date,
          prompt,
          response: response.substring(0, 200),
          error: parseError.message,
          retryCount
        }, 'OpenAIService');
        throw new Error('Invalid JSON response from OpenAI');
      }

      // Track usage and cost
      const usage = completion.usage;
      const cost = this.calculateCost(usage.prompt_tokens, usage.completion_tokens);
      
      // Create OpenAI request record if context provided
      let openAIRequestId: string | undefined;
      if (context) {
        const requestRecord = await this.saveRequestRecord({
          prompt: prompt.substring(0, 500), // Store first 500 chars
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

      // Update local usage tracking
      await this.updateLocalUsage(cost, usage.prompt_tokens + usage.completion_tokens);

      // Keep legacy usage tracking for now (can be removed later)
      await this.trackUsage({
        date,
        model: 'gpt-4o-mini',
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        cost,
        requestType: context?.requestType || 'website_content',
        prompt: prompt.substring(0, 500),
        response: response.substring(0, 500),
        retryCount
      });

      logger.info('Website content generated successfully', {
        date,
        prompt,
        cost,
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        retryCount,
        openAIRequestId
      }, 'OpenAIService');

      return {
        title: parsedContent.title || 'Mystical Insights Await',
        message: parsedContent.message || 'The universe whispers secrets to those who listen.',
        success: true,
        openAIRequestId,
        cost,
        tokensUsed: {
          input: usage.prompt_tokens,
          output: usage.completion_tokens
        }
      };

    } catch (error) {
      logger.error('OpenAI content generation failed', {
        date,
        prompt,
        retryCount,
        error: error.message
      }, 'OpenAIService');

      // Save failed request record if context provided
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
        } catch (saveError) {
          logger.error('Failed to save failed request record', {
            error: saveError.message
          }, 'OpenAIService');
        }
      }

      // Re-throw to let retry logic handle it
      throw error;
    }
  }

  /**
   * Saves OpenAI request record for audit trail and cost tracking
   * @param data - Request data to save
   * @returns Promise<OpenAIRequestDocument> - Saved request record
   */
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
    try {
      const request = new this.requestModel(data);
      return await request.save();
    } catch (error) {
      logger.error('Failed to save OpenAI request record', {
        error: error.message,
        data: { ...data, prompt: data.prompt.substring(0, 100) } // Truncate prompt in logs
      }, 'OpenAIService');
      throw error;
    }
  }

  /**
   * Updates local usage tracking for budget management
   * @param cost - Cost of the request
   * @param totalTokens - Total tokens used
   */
  private async updateLocalUsage(cost: number, totalTokens: number): Promise<void> {
    // For now, this can be a simple implementation
    // Later this could update a monthly aggregation table
    logger.debug('Updating local usage tracking', { cost, totalTokens }, 'OpenAIService');
    // Implementation can be added when we implement the sync functionality
  }

  /**
   * Checks if we're within monthly budget with safety buffer
   */
  private async checkBudgetWithBuffer(): Promise<boolean> {
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    const monthlySpend = await this.usageModel.aggregate([
      {
        $match: {
          date: { $regex: `^${currentMonth}` }
        }
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' }
        }
      }
    ]);

    const currentSpend = monthlySpend[0]?.totalCost || 0;
    const remainingBudget = MONTHLY_BUDGET - currentSpend;

    logger.debug('Budget check with buffer', {
      currentMonth,
      currentSpend,
      monthlyBudget: MONTHLY_BUDGET,
      remainingBudget,
      estimatedRequestCost: ESTIMATED_REQUEST_COST
    }, 'OpenAIService');

    return remainingBudget >= ESTIMATED_REQUEST_COST;
  }

  /**
   * Determines if an OpenAI error is retryable
   * @param error - The error object to classify
   * @returns boolean - True if error should be retried
   */
  private isRetryableError(error: any): boolean {
    // Network errors, timeouts, rate limits are retryable
    if (error.code === 'ECONNRESET' || 
        error.code === 'ENOTFOUND' || 
        error.code === 'ETIMEDOUT') {
      return true;
    }
    
    // OpenAI specific retryable errors
    if (error.status === 429 || // Rate limit
        error.status === 500 || // Internal server error
        error.status === 502 || // Bad gateway
        error.status === 503 || // Service unavailable  
        error.status === 504) { // Gateway timeout
      return true;
    }
    
    // 400, 401, 403 are not retryable (bad request, auth issues)
    return false;
  }

  /**
   * Syncs usage data from OpenAI API to update local tracking
   * Called periodically to ensure budget accuracy
   */
  @OnEvent('openai.update.usage')
  async syncUsageFromOpenAI(): Promise<void> {
    logger.info('Syncing usage from OpenAI API', {}, 'OpenAIService');
    
    try {
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const startDate = `${currentMonth}-01`;
      const endDate = new Date();
      
      // Call OpenAI API to get usage for current month
      // Note: This requires the organization ID and API key with billing access
      const response = await this.openai.usage.retrieve({
        date: startDate
      });
      
      // Update local usage tracking record
      await this.usageModel.findOneAndUpdate(
        { date: startDate }, // Find current month record
        {
          lastSyncedAt: new Date(),
          syncStatus: 'success',
          // Update other fields as needed from API response
        },
        { 
          upsert: true,
          new: true 
        }
      );
      
      logger.info('OpenAI usage sync completed successfully', {
        month: currentMonth,
        syncedAt: new Date().toISOString()
      }, 'OpenAIService');
      
    } catch (error) {
      logger.error('OpenAI usage sync failed', {
        error: error.message,
        errorCode: error.code
      }, 'OpenAIService');
      
      // Mark sync as failed
      const currentMonth = new Date().toISOString().substring(0, 7);
      await this.usageModel.findOneAndUpdate(
        { date: `${currentMonth}-01` },
        {
          lastSyncedAt: new Date(),
          syncStatus: 'failed'
        },
        { upsert: true }
      );
      
      throw error;
    }
  }

  /**
   * Gets current month's usage stats
   */
  async getMonthlyUsage(): Promise<{
    month: string;
    totalCost: number;
    totalRequests: number;
    totalTokens: number;
    remainingBudget: number;
    budgetUsedPercent: number;
  }> {
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    const stats = await this.usageModel.aggregate([
      {
        $match: {
          date: { $regex: `^${currentMonth}` }
        }
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' },
          totalRequests: { $sum: 1 },
          totalInputTokens: { $sum: '$inputTokens' },
          totalOutputTokens: { $sum: '$outputTokens' }
        }
      }
    ]);

    const result = stats[0] || {
      totalCost: 0,
      totalRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0
    };

    const remainingBudget = MONTHLY_BUDGET - result.totalCost;
    const budgetUsedPercent = (result.totalCost / MONTHLY_BUDGET) * 100;

    return {
      month: currentMonth,
      totalCost: result.totalCost,
      totalRequests: result.totalRequests,
      totalTokens: result.totalInputTokens + result.totalOutputTokens,
      remainingBudget: Math.max(0, remainingBudget),
      budgetUsedPercent: Math.min(100, budgetUsedPercent)
    };
  }

  /**
   * Calculates cost based on token usage
   * gpt-4o-mini pricing: $0.000075/1K input tokens, $0.0003/1K output tokens
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * 0.000075;
    const outputCost = (outputTokens / 1000) * 0.0003;
    return Number((inputCost + outputCost).toFixed(6));
  }

  /**
   * Tracks API usage in database (legacy method - kept for backward compatibility)
   */
  private async trackUsage(data: {
    date: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    requestType: string;
    prompt: string;
    response: string;
    retryCount?: number;
  }): Promise<void> {
    try {
      const usage = new this.usageModel({
        ...data,
        timestamp: new Date()
      });
      await usage.save();
    } catch (error) {
      logger.error('Failed to track OpenAI usage', {
        error: error.message,
        data
      }, 'OpenAIService');
      // Don't throw - we don't want to fail content generation because of tracking issues
    }
  }

  // Admin interface methods (for admin controllers)
  async findById(id: string): Promise<any> {
    return await this.requestModel.findById(id).exec();
  }

  async getTotal(): Promise<number> {
    return await this.requestModel.countDocuments();
  }

  async findAll(query: any): Promise<any[]> {
    const { limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    return await this.requestModel
      .find()
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .exec();
  }
}