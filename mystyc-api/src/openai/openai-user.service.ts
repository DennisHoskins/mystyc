import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { OpenAICoreService } from './openai-core.service';
import { OpenAIUsage, OpenAIUsageDocument } from './schemas/openai-usage.schema';
import { OpenAIRequest, OpenAIRequestDocument } from './schemas/openai-request.schema';
import { OpenAIContextDto } from './dto/openai-context.dto';

@Injectable()
export class OpenAIUserService extends OpenAICoreService {
  constructor(
    @InjectModel(OpenAIUsage.name) usageModel: Model<OpenAIUsageDocument>,
    @InjectModel(OpenAIRequest.name) requestModel: Model<OpenAIRequestDocument>,
  ) {
    super(usageModel, requestModel);
  }

  getPromptForUser(userId: string, date: string): string {
    return `Generate personalized mystical content for user ${userId} on ${date}…`;
  }

  async generateUserContent(
    userId: string,
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

    const prompt = this.getPromptForUser(userId, date);

    // todo: call AI

    const req = await this.requestModel.create({
      prompt: prompt,
      inputTokens: 10,
      outputTokens: 20,
      cost: 25,
      requestType: "user_content",
      linkedEntityId: userId,
      model: 'gpt-4o-mini',
      retryCount: 1,
    });
    const openAIRequestId = req._id.toString();

    await this.saveRequestRecord(req);
    
    return {
      title: "Reply Title",
      message: "Reply Message",
      success: true,
      openAIRequestId,
      cost: 25,
      tokensUsed: {
        input: 10,
        output: 20,
      },
      retryCount: 1,
    };
  }
}
