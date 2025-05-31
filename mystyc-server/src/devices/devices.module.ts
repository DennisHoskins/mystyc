import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';

import { DeviceService } from './device.service';
import { DevicesController } from './devices.controller';
import { Device, DeviceSchema } from './schemas/device.schema';

@Module({
  imports: [
    FirebaseModule,
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema }
    ])
  ],
  controllers: [DevicesController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DevicesModule {}