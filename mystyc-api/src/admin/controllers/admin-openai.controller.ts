import { Controller } from '@nestjs/common';

import { OpenAIService } from '@/openai/openai.service';
import { OpenAIRequest } from '@/common/interfaces/openai-request.interface';
import { AdminController } from './admin.controller';

@Controller('admin/openai')
export class AdminOpenAIController extends AdminController<OpenAIRequest> {
  protected serviceName = 'OpenAI';
  
  constructor(protected service: OpenAIService) {
    super();
  }
}