import { Module } from '@nestjs/common';
import { AstrologyService } from './astrology.service';

@Module({
  providers: [AstrologyService],
  exports: [AstrologyService]
})
export class AstrologyModule {}