import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import OpenAI from 'openai';

import { OpenAIUsage, OpenAIUsageDocument } from './schemas/openai-usage.schema';
import { logger } from '@/common/util/logger';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;
  private readonly MONTHLY_BUDGET = 20.00; // $20/month - easy to change
  private readonly MAX_TOKENS_PER_REQUEST = 500; // ~$0.15 max per request
  private readonly ESTIMATED_REQUEST_COST = 0.20; // Buffer for budget checking

  constructor(
    @InjectModel(OpenAIUsage.name) private usageModel: Model<OpenAIUsageDocument>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generates mystical website content using OpenAI
   * @param date - Date for content (YYYY-MM-DD format)
   * @returns Promise<{title: string, message: string, success: boolean}>
   */
  async generateWebsiteContent(date: string): Promise<{
    title: string;
    message: string;
    success: boolean;
    cost?: number;
    tokensUsed?: { input: number; output: number };
  }> {
    logger.info('Generating website content with OpenAI', { date }, 'OpenAIService');

    try {
      // Check budget before making request
      const canAfford = await this.checkBudget();
      if (!canAfford) {
        logger.warn('Monthly budget exceeded, cannot generate content', { date }, 'OpenAIService');
        return {
          title: '',
          message: '',
          success: false
        };
      }

      // Simple prompt for V1 - just get the plumbing working
      
      const prompt = `
Generate mystical daily content for ${date}. Include:
1. A mystical title (max 50 characters)
2. A mystical message (max 200 characters)

Format as JSON:
{
  "title": "your title here",
  "message": "your message here"
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.MAX_TOKENS_PER_REQUEST,
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
          response: response.substring(0, 200),
          error: parseError.message
        }, 'OpenAIService');
        throw new Error('Invalid JSON response from OpenAI');
      }

      // Track usage and cost
      const usage = completion.usage;
      const cost = this.calculateCost(usage.prompt_tokens, usage.completion_tokens);
      
      await this.trackUsage({
        date,
        model: 'gpt-4o-mini',
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        cost,
        requestType: 'website_content',
        prompt: prompt.substring(0, 500), // Store first 500 chars for debugging
        response: response.substring(0, 500)
      });

      logger.info('Website content generated successfully', {
        date,
        cost,
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens
      }, 'OpenAIService');

      return {
        title: parsedContent.title || 'Mystical Insights Await',
        message: parsedContent.message || 'The universe whispers secrets to those who listen.',
        success: true,
        cost,
        tokensUsed: {
          input: usage.prompt_tokens,
          output: usage.completion_tokens
        }
      };

    } catch (error) {
      logger.error('OpenAI content generation failed', {
        date,
        error: error.message
      }, 'OpenAIService');

      return {
        title: '',
        message: '',
        success: false
      };
    }
  }

  /**
   * Checks if we're within monthly budget
   */
  private async checkBudget(): Promise<boolean> {
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
    const remainingBudget = this.MONTHLY_BUDGET - currentSpend;

    logger.debug('Budget check', {
      currentMonth,
      currentSpend,
      monthlyBudget: this.MONTHLY_BUDGET,
      remainingBudget,
      estimatedRequestCost: this.ESTIMATED_REQUEST_COST
    }, 'OpenAIService');

    return remainingBudget >= this.ESTIMATED_REQUEST_COST;
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

    const remainingBudget = this.MONTHLY_BUDGET - result.totalCost;
    const budgetUsedPercent = (result.totalCost / this.MONTHLY_BUDGET) * 100;

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
   * Tracks API usage in database
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
}