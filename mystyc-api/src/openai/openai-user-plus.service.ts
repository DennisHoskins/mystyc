import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { OpenAIUsage, OpenAIUsageDocument } from './schemas/openai-usage.schema';
import { Content, ContentDocument } from '../content/schemas/content.schema';
import { UserProfile } from '@/common/interfaces/user-profile.interface';
import { OpenAICoreService } from './openai-core.service';
import { logger } from '@/common/util/logger';

@Injectable()
export class OpenAIUserPlusService extends OpenAICoreService {
  // Enhanced limits for plus users
  protected MAX_TOKENS_PER_REQUEST = 1000; // Double the tokens for plus users
  protected ESTIMATED_REQUEST_COST = 0.40; // Higher cost budget for enhanced prompts

  constructor(
    @InjectModel(OpenAIUsage.name) usageModel: Model<OpenAIUsageDocument>,
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
  ) {
    super(usageModel);
  }

  async onModuleInit(): Promise<void> {}

  getEnhancedPrompt(date: string, userProfile: UserProfile): string {
    const name = userProfile.fullName || "Mystical Seeker";
    const zodiacSign = userProfile.zodiacSign || "Unknown";
    const birthDate = userProfile.dateOfBirth 
      ? userProfile.dateOfBirth.toISOString().split('T')[0] 
      : "Unknown";

    return `
      Generate highly personalized mystical daily content for ${date}.
      
      User Details:
      - Name: ${name}
      - Zodiac Sign: ${zodiacSign}
      - Birth Date: ${birthDate}
      - Subscription: PLUS (premium personalized content)
      
      Create deeply personalized content that incorporates:
      1. Their specific zodiac sign traits and current planetary influences
      2. Personal name integration throughout the reading
      3. Birth date for enhanced astrological calculations
      4. Mystical insights tailored specifically for ${name}
      
      Content Requirements:
      1. A personalized mystical title (max 60 characters) that feels crafted specifically for ${name}
      2. A deeply personal mystical message (max 250 characters) with specific guidance for ${name}
      3. Make it feel like a personal consultation, not generic content
      
      Format as JSON: { "title": "...", "message": "..." }`;
  }

  async generatePlusContent(userProfile: UserProfile, date: string, content: ContentDocument): Promise<ContentDocument> {
    const startTime = Date.now();
    let lastError;

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // Check budget with higher cost threshold for plus users
        if (!(await this.checkBudgetWithBuffer())) {
          logger.warn('OpenAI budget exceeded, generating fallback plus content', { 
            date, 
            contentId: content._id,
            userId: userProfile.firebaseUid 
          }, 'OpenAIUserPlusService');
          return await this.generateFallbackPlusContent(userProfile, date, content, startTime, 'Budget exceeded');
        }

        const prompt = this.getEnhancedPrompt(date, userProfile);

        // Get response with enhanced token limit
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: this.MAX_TOKENS_PER_REQUEST,
          temperature: 0.9, // Slightly higher creativity for plus users
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

        // Enhanced content formatting for plus users
        content.title = `${userProfile.fullName || 'Mystical Seeker'}: ${title}`;
        content.message = message;
        content.imageUrl = this.getEnhancedImageUrl(date, userProfile);
        content.linkUrl = 'https://mystyc.app/plus';
        content.linkText = 'Explore Your Premium Mystical Journey';
        content.data = this.formatPlusContentData(title, message, userProfile);
        content.sources = ['openai-plus'];
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

        logger.info('Plus content generated successfully with OpenAI', { 
          date, 
          contentId: savedContent._id,
          userId: userProfile.firebaseUid,
          duration: Date.now() - startTime,
          cost,
          tokensUsed: usage?.prompt_tokens && usage?.completion_tokens ? usage.prompt_tokens + usage.completion_tokens : 0,
          retryCount: attempt
        }, 'OpenAIUserPlusService');

        return savedContent;
      } catch (err) {
        lastError = err;
        logger.warn(`OpenAI plus content attempt ${attempt + 1} failed`, { 
          date, 
          contentId: content._id,
          userId: userProfile.firebaseUid,
          error: err,
          attempt: attempt + 1,
          maxRetries: this.MAX_RETRIES + 1
        }, 'OpenAIUserPlusService');

        if (attempt === this.MAX_RETRIES || !this.isRetryableError(err)) break;
        await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** attempt, 10000)));
      }
    }

    // All retries failed - generate fallback content
    logger.error('All OpenAI plus content attempts failed, generating fallback content', {
      date,
      contentId: content._id,
      userId: userProfile.firebaseUid,
      error: lastError,
      totalAttempts: this.MAX_RETRIES + 1
    }, 'OpenAIUserPlusService');

    const message = lastError instanceof Error ? lastError?.message : 'OpenAI generation failed';
    return await this.generateFallbackPlusContent(userProfile, date, content, startTime, message);
  }

  private async generateFallbackPlusContent(userProfile: UserProfile, date: string, content: ContentDocument, startTime: number, error?: string): Promise<ContentDocument> {
    logger.info('Generating fallback plus content for user', { 
      date, 
      contentId: content._id,
      userId: userProfile.firebaseUid 
    }, 'OpenAIUserPlusService');

    try {
      // Try to get the most recent generated plus content for this user as fallback
      const recentContent = await this.contentModel
        .findOne({ 
          type: 'plus_content',
          userId: userProfile.firebaseUid,
          status: 'generated',
          date: { $lt: date }
        })
        .sort({ date: -1 })
        .exec();

      if (recentContent) {
        // Update with fallback based on recent plus content
        content.title = recentContent.title;
        content.message = recentContent.message;
        content.imageUrl = this.getEnhancedImageUrl(date, userProfile);
        content.linkUrl = 'https://mystyc.app/plus';
        content.linkText = 'Explore Your Premium Mystical Journey';
        content.data = recentContent.data;
        content.sources = ['fallback-plus'];
        content.status = 'fallback';
        content.error = error || 'OpenAI generation failed, using fallback plus content';
        content.generationDuration = Date.now() - startTime;

        const savedContent = await content.save();

        logger.info('Fallback plus content created from recent content', {
          date,
          contentId: savedContent._id,
          userId: userProfile.firebaseUid,
          fallbackSourceDate: recentContent.date
        }, 'OpenAIUserPlusService');

        return savedContent;
      }

      // No recent plus content available - create personalized generic fallback
      const name = userProfile.fullName || 'Mystical Seeker';
      const zodiacSign = userProfile.zodiacSign || 'the cosmos';

      content.title = `${name}: Your Mystical Destiny Awaits`;
      content.message = `Dear ${name}, the universe has aligned special energies for you today. As a ${zodiacSign}, your intuitive powers are heightened. Trust your inner wisdom.`;
      content.imageUrl = this.getEnhancedImageUrl(date, userProfile);
      content.linkUrl = 'https://mystyc.app/plus';
      content.linkText = 'Explore Your Premium Mystical Journey';
      content.data = [
        { key: 'Personal Insight', value: `The stars shine especially bright for ${name} today.` },
        { key: 'Zodiac Energy', value: `${zodiacSign} energy brings clarity and purpose.` },
        { key: 'Daily Guidance', value: 'Your premium journey continues with cosmic alignment.' }
      ];
      content.sources = ['fallback-plus'];
      content.status = 'fallback';
      content.error = error || 'OpenAI generation failed, using personalized fallback content';
      content.generationDuration = Date.now() - startTime;

      const savedContent = await content.save();
      logger.info('Personalized fallback plus content created', { 
        date, 
        contentId: savedContent._id,
        userId: userProfile.firebaseUid 
      }, 'OpenAIUserPlusService');
      return savedContent;
    } catch (fallbackError) {
      logger.error('Fallback plus content generation failed', {
        date,
        contentId: content._id,
        userId: userProfile.firebaseUid,
        originalError: error,
        fallbackError
      }, 'OpenAIUserPlusService');

      content.status = 'failed';
      content.error = `Both OpenAI and fallback failed: ${fallbackError}`;
      content.generationDuration = Date.now() - startTime;

      const savedContent = await content.save();
      return savedContent;
    }
  }

  private formatPlusContentData(title: string, message: string, userProfile: UserProfile): Array<{key: string, value: string}> {
    const name = userProfile.fullName || 'Mystical Seeker';
    const zodiacSign = userProfile.zodiacSign || 'Unknown';
    
    return [
      { key: 'Personal Insight', value: title },
      { key: 'Mystical Message', value: message },
      { key: 'Zodiac Sign', value: zodiacSign },
      { key: 'Personalized For', value: name },
      { key: 'Content Type', value: 'Premium Plus Experience' },
      { key: 'Generated By', value: 'AI Mystical Oracle Plus' }
    ];
  }

  private getEnhancedImageUrl(date: string, userProfile: UserProfile): string {
    // Enhanced image selection based on zodiac sign
    const zodiacImages: Record<string, string> = {
      'Aries': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
      'Taurus': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      'Gemini': 'https://images.unsplash.com/photo-1516912481808-3406841bd33c',
      'Cancer': 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3',
      'Leo': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      'Virgo': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
      'Libra': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      'Scorpio': 'https://images.unsplash.com/photo-1516912481808-3406841bd33c',
      'Sagittarius': 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3',
      'Capricorn': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      'Aquarius': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
      'Pisces': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
    };

    const zodiacSign = userProfile.zodiacSign;
    if (zodiacSign && zodiacImages[zodiacSign]) {
      return zodiacImages[zodiacSign];
    }

    // Fallback to date-based selection
    const defaultImages = [
      'https://images.unsplash.com/photo-1516912481808-3406841bd33c',
      'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    ];
    
    const dateHash = date.split('-').reduce((acc, part) => acc + parseInt(part), 0);
    return defaultImages[dateHash % defaultImages.length];
  }
}