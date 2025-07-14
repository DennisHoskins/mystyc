import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { OpenAIUsage, OpenAIUsageDocument } from './schemas/openai-usage.schema';
import { OpenAIRequest, OpenAIRequestDocument } from './schemas/openai-request.schema';
import { OpenAICoreService } from './openai-core.service';
import { OpenAIContextDto } from './dto/openai-context.dto';

@Injectable()
export class OpenAIWebsiteService extends OpenAICoreService {
  constructor(
    @InjectModel(OpenAIUsage.name) usageModel: Model<OpenAIUsageDocument>,
    @InjectModel(OpenAIRequest.name) requestModel: Model<OpenAIRequestDocument>,
  ) {
    super(usageModel, requestModel);
  }

  async onModuleInit(): Promise<void> {}

  getPrompt(date: string): string {
    return `
      Generate mystical daily content for ${date}. Include:
      1. A mystical title (max 50 characters)
      2. A mystical message (max 200 characters)
      Format as JSON: { "title": "...", "message": "..." }`;
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
    let lastError;
    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // check budget
        if (!(await this.checkBudgetWithBuffer())) {
          return { title: '', message: '', success: false, retryCount: attempt };
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

        // save request if context
        let openAIRequestId: string;
        if (context) {
          const req = await this.requestModel.create({
            prompt: this.getPrompt(date).slice(0, 500),
            inputTokens: usage.prompt_tokens,
            outputTokens: usage.completion_tokens,
            cost,
            requestType: context.requestType,
            linkedEntityId: context.linkedEntityId,
            model: 'gpt-4o-mini',
            retryCount: attempt,
          });
          openAIRequestId = req._id.toString();

          await this.saveRequestRecord(req);
        }

        await this.incrementUsage(usage.prompt_tokens + usage.completion_tokens, cost);

        return {
          title,
          message,
          success: true,
          openAIRequestId,
          cost,
          tokensUsed: {
            input: usage.prompt_tokens,
            output: usage.completion_tokens,
          },
          retryCount: attempt,
        };
      } catch (err) {
        lastError = err;
        if (attempt === this.MAX_RETRIES || !this.isRetryableError(err)) break;
        await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** attempt, 10000)));
      }
    }
    // after retries
    return { title: '', message: '', success: false, retryCount: this.MAX_RETRIES };
  }
}
