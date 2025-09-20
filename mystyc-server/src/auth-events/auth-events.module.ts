import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthEventsService } from './auth-events.service';
import { AuthEvent, AuthEventSchema } from './schemas/auth-event.schema';
import { DevicesModule } from '@/devices/devices.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuthEvent.name, schema: AuthEventSchema }
    ]),
    forwardRef(() => DevicesModule)
  ],
  providers: [AuthEventsService],
  exports: [AuthEventsService],
})
export class AuthEventsModule {}