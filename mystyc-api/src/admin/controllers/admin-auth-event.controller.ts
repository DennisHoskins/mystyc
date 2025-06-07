import { Controller } from '@nestjs/common';

import { AuthEventService } from '@/auth-events/auth-event.service';
import { AuthEvent } from '@/common/interfaces/authEvent.interface';
import { AdminController } from './admin.controller';

@Controller('admin/auth-event')
export class AdminAuthEventController extends AdminController<AuthEvent> {
  protected serviceName = 'AuthEvent';

  constructor(
    protected service: AuthEventService,
  ) {
    super();
  }
}