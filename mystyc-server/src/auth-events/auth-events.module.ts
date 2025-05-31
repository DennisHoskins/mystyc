import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthEventService } from './auth-event.service';
import { AuthEvent, AuthEventSchema } from './schemas/auth-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuthEvent.name, schema: AuthEventSchema }
    ])
  ],
  providers: [AuthEventService],
  exports: [AuthEventService],
})
export class AuthEventsModule {}