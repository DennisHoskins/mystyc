import { Controller } from '@nestjs/common';

import { OpenAIUsageService } from './openai-usage.service';
import { OpenAIUserService } from './openai-user.service';

@Controller('openai')
export class OpenAIController {
  constructor(
    private core: OpenAIUsageService,
    private user: OpenAIUserService,
  ) {}
}