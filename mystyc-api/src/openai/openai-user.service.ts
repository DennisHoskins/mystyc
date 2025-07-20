import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { OpenAIUsage, OpenAIUsageDocument } from './schemas/openai-usage.schema';
import { Content, ContentDocument } from '../content/schemas/content.schema';
import { UserProfile } from '@/common/interfaces/user-profile.interface';
import { OpenAICoreService } from './openai-core.service';
import { logger } from '@/common/util/logger';

@Injectable()
export class OpenAIUserService extends OpenAICoreService {
  constructor(
    @InjectModel(OpenAIUsage.name) usageModel: Model<OpenAIUsageDocument>,
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
  ) {
    super(usageModel);
  }

  async onModuleInit(): Promise<void> {}

  getPrompt(date: string): string {
    return `
      Generate mystical daily content for ${date}. Include:
      1. A mystical title (max 50 characters) that uses {USER_NAME} as a placeholder for the user's name
      2. A mystical message (max 200 characters) that uses {USER_NAME} as a placeholder for personalized content
      
      Use {USER_NAME} wherever you would normally put the person's name.
      Make the content feel personal and directed at {USER_NAME} specifically.
      
      Format as JSON: { "title": "...", "message": "..." }`;
  }

  async generateUserContent(userProfile: UserProfile, date: string, content: ContentDocument): Promise<ContentDocument> {
    const startTime = Date.now();
    let lastError;

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // check budget
        if (!(await this.checkBudgetWithBuffer())) {
          logger.warn('OpenAI budget exceeded, generating fallback content', { date, contentId: content._id }, 'OpenAIUserService');
          return await this.generateFallbackContent(userProfile, date, content, startTime, 'Budget exceeded');
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
        const cost = this.calculateCost(usage?.prompt_tokens, usage?.completion_tokens);

        if (usage?.prompt_tokens && usage?.completion_tokens === undefined) {
          await this.incrementUsage(usage.prompt_tokens + usage.completion_tokens, cost);
        } 

        content.title = title;
        content.message = message;
        content.imageUrl = this.getDefaultImageUrl(date);
        content.linkUrl = 'https://mystyc.app';
        content.linkText = 'Explore Your Mystical Journey';
        content.data = this.formatContentData(title, message);
        content.sources = ['openai-user'];
        content.status = 'generated';
        content.generationDuration = Date.now() - startTime;
        content.openAIData = {
          prompt: prompt.slice(0, 500), // Truncate prompt for storage
          model: 'gpt-4o-mini',
          inputTokens: usage?.prompt_tokens || 0,
          outputTokens: usage?.completion_tokens || 0,
          cost,
          retryCount: attempt
        }

        // Update content record with successful AI generation
        const savedContent = await content.save();

        logger.info('User content generated successfully with OpenAI', { 
          date, 
          contentId: savedContent._id,
          duration: Date.now() - startTime,
          cost,
          tokensUsed: usage?.prompt_tokens && usage?.completion_tokens ? usage.prompt_tokens + usage.completion_tokens : 0,
          retryCount: attempt
        }, 'OpenAIUserService');

        return savedContent;
      } catch (err) {
        lastError = err;
        logger.warn(`OpenAI attempt ${attempt + 1} failed`, { 
          date, 
          contentId: content._id,
          error: err,
          attempt: attempt + 1,
          maxRetries: this.MAX_RETRIES + 1
        }, 'OpenAIUserService');

        if (attempt === this.MAX_RETRIES || !this.isRetryableError(err)) break;
        await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** attempt, 10000)));
      }
    }

    // All retries failed - generate fallback content
    logger.error('All OpenAI attempts failed, generating fallback content', {
      date,
      contentId: content._id,
      error: lastError,
      totalAttempts: this.MAX_RETRIES + 1
    }, 'OpenAIUserService');

    const message = lastError instanceof Error ? lastError?.message : 'OpenAI generation failed';
    return await this.generateFallbackContent(userProfile, date, content, startTime, message);
  }

  private async generateFallbackContent(userPorfile: UserProfile, date: string, content: ContentDocument, startTime: number, error?: string): Promise<ContentDocument> {
    logger.info('Generating fallback content for user', { date, contentId: content._id }, 'OpenAIUserService');

    try {
      // Try to get the most recent generated content as fallback
      const recentContent = await this.contentModel
        .findOne({ 
          type: 'user_content',
          status: 'generated',
          date: { $lt: date }
        })
        .sort({ date: -1 })
        .exec();

      if (recentContent) {
        // Update with fallback based on recent content
        content.title = recentContent.title;
        content.message = recentContent.message;
        content.imageUrl = this.getDefaultImageUrl(date);
        content.linkUrl = 'https://mystyc.app';
        content.linkText = 'Explore Your Mystical Journey';
        content.data = recentContent.data;
        content.sources = ['fallback-user'];
        content.status = 'fallback';
        content.error = error || 'OpenAI generation failed, using fallback content';
        content.generationDuration = Date.now() - startTime;

        const savedContent = await content.save();

        logger.info('Fallback content created from recent content', {
          date,
          contentId: savedContent._id,
          fallbackSourceDate: recentContent.date
        }, 'OpenAIWebsiteService');

        return savedContent;
      }

      // No recent content available - create generic fallback
      content.title = 'Mystical Insights Await';
      content.message = 'The universe whispers secrets to those who listen. Today brings opportunities for growth and discovery.';
      content.imageUrl = this.getDefaultImageUrl(date);
      content.linkUrl = 'https://mystyc.app';
      content.linkText = 'Explore Your Mystical Journey';
      content.data = [
          { key: 'Cosmic Message', value: 'The stars align in your favor today.' },
          { key: 'Daily Wisdom', value: 'Trust in the journey, even when the path is unclear.' },
          { key: 'Mystical Insight', value: 'Your intuition is your greatest guide.' }
        ];
      content.sources = ['fallback-user'];
      content.status = 'fallback';
      content.error = error || 'OpenAI generation failed, using generic fallback content';
      content.generationDuration = Date.now() - startTime;

      const savedContent = await content.save();
      logger.info('Generic fallback content created', { date, contentId: savedContent._id }, 'OpenAIWebsiteService');
      return savedContent;
    } catch (fallbackError) {
      logger.error('Fallback content generation failed', {
        date,
        contentId: content._id,
        originalError: error,
        fallbackError
      }, 'OpenAIWebsiteService');

      content.status = 'failed';
      content.error = `Both OpenAI and fallback failed: ${fallbackError}`;
      content.generationDuration = Date.now() - startTime;

      const savedContent = await content.save();
      return savedContent;
    }
  }

  private formatContentData(title: string, message: string): Array<{key: string, value: string}> {
    return [
      { key: 'Daily Insight', value: title },
      { key: 'Cosmic Message', value: message },
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