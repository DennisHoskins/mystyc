import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { logger } from '@/common/util/logger';
import { OpenAIUsage, OpenAIUsageDocument } from './schemas/openai-usage.schema';
import { OpenAIRequest, OpenAIRequestDocument } from './schemas/openai-request.schema';
import { OpenAIUsageService } from './openai-usage.service';
import { AstrologyCalculated, AstrologyComplete } from 'mystyc-common/interfaces';
import { PlanetType, ZodiacSignType } from 'mystyc-common/schemas';

@Injectable()
export class OpenAIUserService extends OpenAIUsageService {
  constructor(
    @InjectModel(OpenAIUsage.name) usageModel: Model<OpenAIUsageDocument>,
    @InjectModel(OpenAIRequest.name) requestModel: Model<OpenAIRequestDocument>,
  ) {
    super(usageModel, requestModel);
  }

  async onModuleInit(): Promise<void> {}

  async getUserAstrologicalProfileSummary(
    userId: string,
    signs: Record<PlanetType, ZodiacSignType>,
    calculations: AstrologyCalculated, 
    astrology: AstrologyComplete
  ): Promise<AstrologyCalculated> {
    try {
      if (!(await this.checkBudgetWithBuffer())) {
        logger.warn('OpenAI budget exceeded, unable to generate content', {}, 'OpenAIUserService');
        return calculations;
      }

      const prompt = this.buildPrompt(signs, calculations, astrology);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.MAX_TOKENS_PER_REQUEST,
        temperature: 0,
        response_format: { type: "json_object" }
      });        

      const usage = completion.usage;
      const cost = this.calculateCost(usage?.prompt_tokens, usage?.completion_tokens);
      if (usage?.prompt_tokens && usage?.completion_tokens !== undefined) {
        await this.incrementUsage(usage.prompt_tokens + usage.completion_tokens, cost);
        
        // Track individual request for cost analysis
        await this.trackRequest(
          userId,
          'birth_chart',
          usage.prompt_tokens,
          usage.completion_tokens,
          cost,
          undefined, // No contentId for birth charts
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
        }, 'OpenAIUserService');
        throw new Error('Invalid JSON response from OpenAI');
      }

      if (!parsedResponse.aiSummaries) {
        throw new Error('Missing aiSummaries in OpenAI response');
      }

      const { aiSummaries } = parsedResponse;

      calculations.summary = aiSummaries.profileSummary;

      calculations.sun.summary = aiSummaries.planetSummaries.sun;
      calculations.sun.interactions!.moon.description = aiSummaries.interactionSummaries["sun-moon"].description;
      calculations.sun.interactions!.rising.description = aiSummaries.interactionSummaries["sun-rising"].description;
      calculations.sun.interactions!.venus.description = aiSummaries.interactionSummaries["sun-venus"].description;
      calculations.sun.interactions!.mars.description = aiSummaries.interactionSummaries["sun-mars"].description;

      calculations.moon.summary = aiSummaries.planetSummaries.moon;
      calculations.moon.interactions!.rising.description = aiSummaries.interactionSummaries["moon-rising"].description;
      calculations.moon.interactions!.venus.description = aiSummaries.interactionSummaries["moon-venus"].description;
      calculations.moon.interactions!.mars.description = aiSummaries.interactionSummaries["moon-mars"].description;

      calculations.rising.summary = aiSummaries.planetSummaries.rising;
      calculations.rising.interactions!.venus.description = aiSummaries.interactionSummaries["rising-venus"].description;
      calculations.rising.interactions!.mars.description = aiSummaries.interactionSummaries["rising-mars"].description;
      calculations.venus.interactions!.mars.description = aiSummaries.interactionSummaries["venus-mars"].description;

      calculations.venus.summary = aiSummaries.planetSummaries.venus;

      calculations.mars.summary = aiSummaries.planetSummaries.mars;

      return calculations;
    } catch(err) {
      logger.error('All OpenAI generation attempt failed', {
        error: err,
      }, 'OpenAIUserService');
      return calculations;    
    }
  }

  private buildPrompt(
    signs: Record<PlanetType, ZodiacSignType>, 
    calculations: AstrologyCalculated, 
    astrology: AstrologyComplete
  ): string {
    
    const coreData = {
      positions: {
        sun: signs.Sun,
        moon: signs.Moon, 
        rising: signs.Rising,
        venus: signs.Venus,
        mars: signs.Mars
      },
      scores: {
        totalScore: calculations.totalScore,
        planetScores: {
          sun: calculations.sun.totalScore,
          moon: calculations.moon.totalScore,
          rising: calculations.rising.totalScore,
          venus: calculations.venus.totalScore,
          mars: calculations.mars.totalScore
        },
        interactions: {
          "sun-moon": calculations.sun.interactions?.moon?.score,
          "sun-rising": calculations.sun.interactions?.rising?.score,
          "sun-venus": calculations.sun.interactions?.venus?.score,
          "sun-mars": calculations.sun.interactions?.mars?.score,
          "moon-rising": calculations.moon.interactions?.rising?.score,
          "moon-venus": calculations.moon.interactions?.venus?.score,
          "moon-mars": calculations.moon.interactions?.mars?.score,
          "rising-venus": calculations.rising.interactions?.venus?.score,
          "rising-mars": calculations.rising.interactions?.mars?.score,
          "venus-mars": calculations.venus.interactions?.mars?.score
        }
      },
      signKeywords: {
        [signs.Sun]: astrology.sun.signData.keywords,
        [signs.Moon]: astrology.moon.signData.keywords,
        [signs.Rising]: astrology.rising.signData.keywords,
        [signs.Venus]: astrology.venus.signData.keywords,
        [signs.Mars]: astrology.mars.signData.keywords
      }
    };

    return `You are an expert astrologer creating personalized insights. Generate meaningful, actionable content based on this astrological data:

PLANETARY POSITIONS:
- Sun: ${coreData.positions.sun}
- Moon: ${coreData.positions.moon}  
- Rising: ${coreData.positions.rising}
- Venus: ${coreData.positions.venus}
- Mars: ${coreData.positions.mars}

COMPATIBILITY SCORES (-1 to 1 scale, higher = more harmonious):
${Object.entries(coreData.scores.interactions)
  .map(([pair, score]) => `- ${pair}: ${score?.toFixed(2) || 'N/A'}`)
  .join('\n')}

SIGN CHARACTERISTICS:
${Object.entries(coreData.signKeywords)
  .map(([sign, keywords]) => `- ${sign}: ${keywords.join(', ')}`)
  .join('\n')}

CRITICAL WRITING STYLE REQUIREMENTS:
- ALWAYS use "you" and "your" - NEVER use "this person", "this individual", "they", or "them"
- Write as if speaking directly to the person about their chart
- Avoid woo, jargon, or mystical language - use clear, practical terms
- Acknowledge both strengths AND challenges (avoid toxic positivity)
- Provide specific, actionable advice, especially for low scores
- Use the interaction scores to explain personality dynamics but DO NOT include the scores or references to the scores in your response

CRITICAL: Return ONLY valid JSON in this exact format:
{
  "aiSummaries": {
    "profileSummary": {
      "description": "4-5 sentences about YOUR core astrological profile using YOU/YOUR",
      "strengths": "YOUR key positive traits and natural abilities",
      "challenges": "Areas for YOUR growth and potential difficulties", 
      "action": "Specific advice for YOUR personal development"
    },
    "planetSummaries": {
      "sun": {
        "description": "How YOUR ${coreData.positions.sun} Sun shapes YOUR core identity",
        "strengths": "Positive expressions of YOUR placement",
        "challenges": "Shadow aspects YOU should be aware of",
        "action": "How YOU can best express this energy"
      },
      "moon": {
        "description": "How YOUR ${coreData.positions.moon} Moon affects YOUR emotional nature",
        "strengths": "YOUR emotional gifts and intuitive abilities", 
        "challenges": "Emotional patterns that may cause YOU difficulty",
        "action": "How YOU can nurture YOUR emotional wellbeing"
      },
      "rising": {
        "description": "How YOUR ${coreData.positions.rising} Rising shapes YOUR first impressions",
        "strengths": "YOUR natural social and presentation abilities",
        "challenges": "Ways this mask might limit YOUR authentic expression",
        "action": "How YOU can align YOUR outer presentation with YOUR inner truth"
      },
      "venus": {
        "description": "How YOUR ${coreData.positions.venus} Venus influences YOUR relationships and values",
      },
      "mars": {
        "description": "How YOUR ${coreData.positions.mars} Mars drives YOUR actions and ambitions",
      }
    },
    "interactionSummaries": {
      "sun-moon": {
        "description": "How YOUR ${coreData.positions.sun} Sun and ${coreData.positions.moon} Moon work together in YOUR personality (score - do not include in response: ${coreData.scores.interactions['sun-moon']?.toFixed(2)})"
      },
      "sun-rising": {
        "description": "How YOUR ${coreData.positions.sun} Sun and ${coreData.positions.rising} Rising align in YOUR self-expression (score - do not include in response: ${coreData.scores.interactions['sun-rising']?.toFixed(2)})"
      },
      "sun-venus": {
        "description": "How YOUR ${coreData.positions.sun} Sun and ${coreData.positions.venus} Venus interact in YOUR relationships (score - do not include in response: ${coreData.scores.interactions['sun-venus']?.toFixed(2)})"
      },
      "sun-mars": {
        "description": "How YOUR ${coreData.positions.sun} Sun and ${coreData.positions.mars} Mars drive YOUR actions (score - do not include in response: ${coreData.scores.interactions['sun-mars']?.toFixed(2)})"
      },
      "moon-rising": {
        "description": "How YOUR ${coreData.positions.moon} Moon and ${coreData.positions.rising} Rising balance YOUR inner/outer worlds (score - do not include in response: ${coreData.scores.interactions['moon-rising']?.toFixed(2)})"
      },
      "moon-venus": {
        "description": "How YOUR ${coreData.positions.moon} Moon and ${coreData.positions.venus} Venus create YOUR emotional connections (score - do not include in response: ${coreData.scores.interactions['moon-venus']?.toFixed(2)})"
      },
      "moon-mars": {
        "description": "How YOUR ${coreData.positions.moon} Moon and ${coreData.positions.mars} Mars handle YOUR emotional reactions (score - do not include in response: ${coreData.scores.interactions['moon-mars']?.toFixed(2)})"
      },
      "rising-venus": {
        "description": "How YOUR ${coreData.positions.rising} Rising and ${coreData.positions.venus} Venus affect YOUR social charm (score - do not include in response: ${coreData.scores.interactions['rising-venus']?.toFixed(2)})"
      },
      "rising-mars": {
        "description": "How YOUR ${coreData.positions.rising} Rising and ${coreData.positions.mars} Mars project YOUR energy (score - do not include in response: ${coreData.scores.interactions['rising-mars']?.toFixed(2)})"
      },
      "venus-mars": {
        "description": "How YOUR ${coreData.positions.venus} Venus and ${coreData.positions.mars} Mars balance YOUR attraction and action (score - do not include in response: ${coreData.scores.interactions['venus-mars']?.toFixed(2)})"
      }
    }
  }
}`;

  }
}