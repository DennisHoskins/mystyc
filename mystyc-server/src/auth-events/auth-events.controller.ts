import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { AuthEventService } from './auth-event.service';
import { AuthEventQueryDto } from '@/admin/dto/auth-event-query.dto';
import { logger } from '@/util/logger';

@Controller('auth-events')
export class AuthEventsController {

  constructor(
    private readonly authEventService: AuthEventService
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllAuthEvents(@Query() query: AuthEventQueryDto) {
    logger.info('Admin fetching auth events', { query }, 'AuthEventsController');
    
    const filters: any = {};
    
    if (query.firebaseUid) filters.firebaseUid = query.firebaseUid;
    if (query.deviceId) filters.deviceId = query.deviceId;
    if (query.type) filters.type = query.type;
    if (query.startDate) filters.startDate = new Date(query.startDate);
    if (query.endDate) filters.endDate = new Date(query.endDate);
    
    const events = await this.authEventService.findWithFilters(
      filters,
      query.limit || 50,
      query.offset || 0
    );
    
    logger.info('Auth events retrieved', { 
      count: events.length,
      filters
    }, 'AuthEventsController');
    
    return events;
  }

  @Get(':eventId')
  @Roles(UserRole.ADMIN)
  async getAuthEvent(@Param('eventId') eventId: string) {
    logger.info('Admin fetching auth event by ID', { eventId }, 'AuthEventsController');
    
    const event = await this.authEventService.findById(eventId);
    
    if (!event) {
      logger.warn('Auth event not found', { eventId }, 'AuthEventsController');
      throw new NotFoundException('Auth event not found');
    }

    logger.info('Auth event retrieved', { eventId }, 'AuthEventsController');
    return event;
  }
}