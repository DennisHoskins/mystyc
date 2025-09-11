import { Controller } from '@nestjs/common';

import { OpenAIUsageService } from './openai-usage.service';
import { OpenAIUserService } from './openai-user.service';
import { OpenAIHoroscopeService } from './openai-horoscope.service';

@Controller('openai')
export class OpenAIController {
  constructor(
    private core: OpenAIUsageService,
    private user: OpenAIUserService,
    private horoscope: OpenAIHoroscopeService,
  ) {}
}