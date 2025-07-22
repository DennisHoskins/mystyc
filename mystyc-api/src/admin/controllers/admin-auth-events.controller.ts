import { Controller } from '@nestjs/common';

import { AuthEventsService } from '@/auth-events/auth-events.service';
import { AuthEvent } from 'mystyc-common/schemas/auth-event.schema';
import { AdminController } from './admin.controller';

@Controller('admin/auth-events')
export class AdminAuthEventsController extends AdminController<AuthEvent> {
  protected serviceName = 'AuthEvents';
  
  constructor(protected service: AuthEventsService) {
    super();
  }
}