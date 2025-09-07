import { Controller, UseGuards, Get, Param, Query, BadRequestException } from '@nestjs/common';

import { FirebaseUser as FirebaseUserInterface } from 'mystyc-common/schemas';
import { Horoscope } from 'mystyc-common/interfaces/horoscope.interface';
import { createServiceLogger } from '@/common/util/logger';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { FirebaseUser } from '@/common/decorators/user.decorator';
import { HoroscopesService } from './horoscopes.service';

@Controller('horoscopes')
export class HoroscopesController {
  private logger = createServiceLogger('HoroscopeController');

  constructor(
    private readonly horoscopeService: HoroscopesService,
  ) {}

  @Get(':date')
  @UseGuards(FirebaseAuthGuard) // Authentication required for personal horoscopes
  async getPersonalHoroscope(
    @FirebaseUser() firebaseUser: FirebaseUserInterface,
    @Param('date') date: string,
    @Query('time') time?: string,
    @Query('timezone') timezone?: string,
  ): Promise<Horoscope> {
    this.logger.info('Getting personal horoscope', {
      userId: firebaseUser.uid,
      date,
      time,
      timezone
    });

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('Date must be in YYYY-MM-DD format');
    }

    // Validate time format if provided
    if (time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      throw new BadRequestException('Time must be in HH:mm format');
    }

    try {
      const horoscope = await this.horoscopeService.getOrCreatePersonalHoroscope(
        firebaseUser.uid,
        date,
        time,
        timezone
      );

      this.logger.info('Personal horoscope retrieved successfully', {
        userId: firebaseUser.uid,
        date,
        time,
        personalScore: horoscope.personalChart.totalScore
      });

      return horoscope;
    } catch (error) {
      this.logger.error('Failed to get personal horoscope', {
        userId: firebaseUser.uid,
        date,
        time,
        timezone,
        error
      });
      throw error;
    }
  }
}