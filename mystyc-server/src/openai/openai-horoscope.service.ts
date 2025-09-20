import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { logger } from '@/common/util/logger';
import { OpenAIUsage, OpenAIUsageDocument } from '@/openai/schemas/openai-usage.schema';
import { OpenAIRequest, OpenAIRequestDocument } from '@/openai/schemas/openai-request.schema';
import { OpenAIUsageService } from '@/openai/openai-usage.service';
import { AstrologyCalculated, DailyInfluence } from 'mystyc-common/interfaces';
import { PlanetType } from 'mystyc-common/schemas';

@Injectable()
export class OpenAIHoroscopeService extends OpenAIUsageService {
  constructor(
    @InjectModel(OpenAIUsage.name) usageModel: Model<OpenAIUsageDocument>,
    @InjectModel(OpenAIRequest.name) requestModel: Model<OpenAIRequestDocument>,
  ) {
    super(usageModel, requestModel);
  }

  async onModuleInit(): Promise<void> {}

  async generatePersonalDailySummary(
    userId: string,
    personalChart: AstrologyCalculated,
    influences: DailyInfluence[],
    date: Date
  ): Promise<AstrologyCalculated> {
    try {
      if (!(await this.checkBudgetWithBuffer())) {
        logger.warn('OpenAI budget exceeded, unable to generate personal horoscope', {}, 'OpenAIHoroscopeService');
        return personalChart;
      }

      const prompt = this.buildPersonalHoroscopePrompt(personalChart, influences, date);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.MAX_TOKENS_PER_REQUEST,
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const usage = completion.usage;
      const cost = this.calculateCost(usage?.prompt_tokens, usage?.completion_tokens);
      if (usage?.prompt_tokens && usage?.completion_tokens !== undefined) {
        await this.incrementUsage(usage.prompt_tokens + usage.completion_tokens, cost);
        
        // Track individual request for cost analysis
        const dateStr = date.toISOString().split('T')[0]; // "2025-01-13"
        await this.trackRequest(
          userId,
          'daily_insights',
          usage.prompt_tokens,
          usage.completion_tokens,
          cost,
          dateStr,
          'gpt-4o-mini'
        );
      }

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from OpenAI');

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        logger.error('Failed to parse OpenAI JSON response', {
          response,
          parseError
        }, 'OpenAIHoroscopeService');
        throw new Error('Invalid JSON response from OpenAI');
      }

      if (!parsedResponse.summary) {
        throw new Error('Missing summary in OpenAI response');
      }

      // Add personal daily summary and detailed planetary insights
      personalChart.summary = parsedResponse.summary;

      // Add planet-specific insights if provided
      if (parsedResponse.planetInsights) {
        const planets: PlanetType[] = ['Sun', 'Moon', 'Rising', 'Venus', 'Mars'];
        for (const planet of planets) {
          const planetKey = planet.toLowerCase() as keyof AstrologyCalculated;
          const planetData = personalChart[planetKey];
          const planetInsight = parsedResponse.planetInsights[planet.toLowerCase()];
          
          if (planetData && typeof planetData === 'object' && planetInsight) {
            (planetData as any).summary = planetInsight;
          }
        }
      }

      return personalChart;
    } catch (err) {
      logger.error('OpenAI personal horoscope generation failed', {
        error: err,
        userId,
        date: date.toISOString()
      }, 'OpenAIHoroscopeService');
      return personalChart;
    }
  }

  private buildPersonalHoroscopePrompt(
    personalChart: AstrologyCalculated,
    influences: DailyInfluence[],
    date: Date
  ): string {
    const dateStr = date.toISOString().split('T')[0];
    
    const influenceDescriptions = influences
      .map(inf => `- ${inf.planet}: ${inf.influence} (Energy: ${inf.dailyScore.toFixed(2)})`)
      .join('\n');

    return `You are an expert astrologer creating a personalized daily horoscope. This is NOT generic cosmic energy - this is how TODAY specifically affects this individual based on their unique birth chart.

DATE: ${dateStr}
PERSONAL ENERGY SCORE: ${personalChart.totalScore.toFixed(2)} (scale: -1 to 1)

PLANETARY INFLUENCES FOR THIS PERSON TODAY:
${influenceDescriptions}

INDIVIDUAL PLANET SCORES (use these for reference but do not include in response):
- Sun: ${personalChart.sun.totalScore.toFixed(2)}
- Moon: ${personalChart.moon.totalScore.toFixed(2)}
- Rising: ${personalChart.rising.totalScore.toFixed(2)}
- Venus: ${personalChart.venus.totalScore.toFixed(2)}
- Mars: ${personalChart.mars.totalScore.toFixed(2)}

Create a PERSONAL daily reading that explains how today's cosmic energy specifically interacts with this person's birth chart.

WRITING STYLE:
- Use "you" and "your" throughout - this is personal
- Focus on how TODAY is different for this person specifically
- Mention specific planetary influences when relevant
- Include both opportunities and challenges
- Provide actionable advice based on the energy
- Be encouraging but realistic
- Use the individual planet scores to explain energy dynamics but DO NOT include the scores or references to the scores in your response


Return ONLY valid JSON in this exact format:
{
  "summary": {
    "description": "4-5 sentences about how today's energy specifically affects YOUR unique astrological makeup. This is a summary of the complete horoscope energy for the day",
    "strengths": "YOUR biggest opportunities and favorable energies today",
    "challenges": "Areas where YOU might face tension or need extra care",
    "action": "Specific advice for YOU to make the most of today's energy"
  },
  "planetInsights": {
    "sun": {
      "description": "How today's cosmic energy specifically affects YOUR core identity and vitality",
    },
    "moon": {
      "description": "How today's energy influences YOUR emotional landscape and intuition"
    },
    "rising": {
      "description": "How cosmic influences affect YOUR outward expression and first impressions today"
    },
    "venus": {
      "description": "How today's energy impacts YOUR relationships, values, and pleasure today"
    },
    "mars": {
      "description": "How cosmic energy affects YOUR drive, ambition, and physical energy today"
    }
  }
}`;
  }
}