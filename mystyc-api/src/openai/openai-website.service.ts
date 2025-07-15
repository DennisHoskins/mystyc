import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { OpenAIUsage, OpenAIUsageDocument } from './schemas/openai-usage.schema';
import { Content, ContentDocument } from '../content/schemas/content.schema';
import { OpenAICoreService } from './openai-core.service';
import { logger } from '@/common/util/logger';

@Injectable()
export class OpenAIWebsiteService extends OpenAICoreService {
  constructor(
    @InjectModel(OpenAIUsage.name) usageModel: Model<OpenAIUsageDocument>,
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>
  ) {
    super(usageModel);
  }

  async onModuleInit(): Promise<void> {}

  getPrompt(date: string): string {
    return `
      Generate mystical daily content for ${date}. Include:
      1. A mystical title (max 50 characters)
      2. A mystical message (max 200 characters)
      Format as JSON: { "title": "...", "message": "..." }`;
  }

  async generateWebsiteContent(date: string, contentId: string): Promise<void> {
    const startTime = Date.now();
    let lastError;

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // check budget
        if (!(await this.checkBudgetWithBuffer())) {
          logger.warn('OpenAI budget exceeded, generating fallback content', { date, contentId }, 'OpenAIWebsiteService');
          return this.generateFallbackContent(date, contentId, startTime, 'Budget exceeded');
        }

        const prompt = this.getPrompt(date);

        // get response
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: this.MAX_TOKENS_PER_REQUEST,
          temperature: 0.8,
          response_format: { type: "json_object" }
        });        

        const response = completion.choices[0]?.message?.content;
        if (!response) throw new Error('No response from OpenAI');        

        // JSON.parse & record to DB
        const { title, message } = JSON.parse(response);

        const usage = completion.usage;
        const cost = this.calculateCost(usage.prompt_tokens, usage.completion_tokens);

        await this.incrementUsage(usage.prompt_tokens + usage.completion_tokens, cost);

        // Update content record with successful AI generation
        await this.contentModel.findByIdAndUpdate(contentId, {
          title,
          message,
          openAIData: {
            prompt: prompt.slice(0, 500), // Truncate prompt for storage
            model: 'gpt-4o-mini',
            inputTokens: usage.prompt_tokens,
            outputTokens: usage.completion_tokens,
            cost,
            retryCount: attempt
          },
          imageUrl: this.getDefaultImageUrl(date),
          linkUrl: 'https://mystyc.app',
          linkText: 'Explore Your Mystical Journey',
          data: this.formatContentData(title, message),
          sources: ['openai'],
          status: 'generated',
          generationDuration: Date.now() - startTime
        });

        logger.info('Website content generated successfully with OpenAI', { 
          date, 
          contentId,
          duration: Date.now() - startTime,
          cost,
          tokensUsed: usage.prompt_tokens + usage.completion_tokens,
          retryCount: attempt
        }, 'OpenAIWebsiteService');

        return;

      } catch (err) {
        lastError = err;
        logger.warn(`OpenAI attempt ${attempt + 1} failed`, { 
          date, 
          contentId, 
          error: err.message,
          attempt: attempt + 1,
          maxRetries: this.MAX_RETRIES + 1
        }, 'OpenAIWebsiteService');

        if (attempt === this.MAX_RETRIES || !this.isRetryableError(err)) break;
        await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** attempt, 10000)));
      }
    }

    // All retries failed - generate fallback content
    logger.error('All OpenAI attempts failed, generating fallback content', {
      date,
      contentId,
      error: lastError?.message,
      totalAttempts: this.MAX_RETRIES + 1
    }, 'OpenAIWebsiteService');

    return this.generateFallbackContent(date, contentId, startTime, lastError?.message);
  }

  private async generateFallbackContent(date: string, contentId: string, startTime: number, error?: string): Promise<void> {
    logger.info('Generating fallback content for website', { date, contentId }, 'OpenAIWebsiteService');

    try {
      // Try to get the most recent generated content as fallback
      const recentContent = await this.contentModel
        .findOne({ 
          type: 'website_content',
          status: 'generated',
          date: { $lt: date }
        })
        .sort({ date: -1 })
        .exec();

      if (recentContent) {
        // Update with fallback based on recent content
        await this.contentModel.findByIdAndUpdate(contentId, {
          title: recentContent.title,
          message: recentContent.message,
          imageUrl: this.getDefaultImageUrl(date),
          linkUrl: 'https://mystyc.app',
          linkText: 'Explore Your Mystical Journey',
          data: recentContent.data,
          sources: ['fallback'],
          status: 'fallback',
          error: error || 'OpenAI generation failed, using fallback content',
          generationDuration: Date.now() - startTime
        });

        logger.info('Fallback content created from recent content', {
          date,
          contentId,
          fallbackSourceDate: recentContent.date
        }, 'OpenAIWebsiteService');

        return;
      }

      // No recent content available - create generic fallback
      await this.contentModel.findByIdAndUpdate(contentId, {
        title: 'Mystical Insights Await',
        message: 'The universe whispers secrets to those who listen. Today brings opportunities for growth and discovery.',
        imageUrl: this.getDefaultImageUrl(date),
        linkUrl: 'https://mystyc.app',
        linkText: 'Explore Your Mystical Journey',
        data: [
          { key: 'Cosmic Message', value: 'The stars align in your favor today.' },
          { key: 'Daily Wisdom', value: 'Trust in the journey, even when the path is unclear.' },
          { key: 'Mystical Insight', value: 'Your intuition is your greatest guide.' }
        ],
        sources: ['fallback'],
        status: 'fallback',
        error: error || 'OpenAI generation failed, using generic fallback content',
        generationDuration: Date.now() - startTime
      });

      logger.info('Generic fallback content created', { date, contentId }, 'OpenAIWebsiteService');

    } catch (fallbackError) {
      logger.error('Fallback content generation failed', {
        date,
        contentId,
        originalError: error,
        fallbackError: fallbackError.message
      }, 'OpenAIWebsiteService');

      // Last resort - mark as failed
      await this.contentModel.findByIdAndUpdate(contentId, {
        status: 'failed',
        error: `Both OpenAI and fallback failed: ${fallbackError.message}`,
        generationDuration: Date.now() - startTime
      });
    }
  }

  private formatContentData(title: string, message: string): Array<{key: string, value: string}> {
    return [
      { key: 'Daily Insight', value: title },
      { key: 'Cosmic Message', value: message },
      { key: 'Generated By', value: 'AI Mystical Oracle' }
    ];
  }

  private getDefaultImageUrl(date: string): string {
    const images = [
      'https://images.unsplash.com/photo-1516912481808-3406841bd33c',
      'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    ];
    const dateHash = date.split('-').reduce((acc, part) => acc + parseInt(part), 0);
    return images[dateHash % images.length];
  }
}