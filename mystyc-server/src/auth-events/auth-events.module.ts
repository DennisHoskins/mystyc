import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthEventService } from './auth-event.service';
import { AuthEvent, AuthEventSchema } from './schemas/auth-event.schema';
import { DevicesModule } from '@/devices/devices.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuthEvent.name, schema: AuthEventSchema }
    ]),
    forwardRef(() => DevicesModule)
  ],
  providers: [AuthEventService],
  exports: [AuthEventService],
})
export class AuthEventsModule {}