import { Controller } from '@nestjs/common';

import { OpenAICoreService } from './openai-core.service';
import { OpenAIWebsiteService } from './openai-website.service';
import { OpenAIUserService } from './openai-user.service';

@Controller('openai')
export class OpenAIController {
  constructor(
    private core: OpenAICoreService,
    private website: OpenAIWebsiteService,
    private user: OpenAIUserService,
  ) {}
}