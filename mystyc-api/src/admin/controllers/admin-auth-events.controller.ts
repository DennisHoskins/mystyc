import { Controller } from '@nestjs/common';

import { AuthEventService } from '@/auth-events/auth-event.service';
import { AuthEvent } from '@/common/interfaces/authEvent.interface';
import { AdminController } from './admin.controller';

@Controller('admin/auth-events')
export class AdminAuthEventsController extends AdminController<AuthEvent> {
  protected serviceName = 'AuthEvents';
  
  constructor(protected service: AuthEventService) {
    super();
  }
}