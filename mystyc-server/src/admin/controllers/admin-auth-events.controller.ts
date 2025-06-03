import { Controller, Get, Param, NotFoundException, Query } from '@nestjs/common';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { DeviceService } from '@/devices/device.service';
import { AuthEventService } from '@/auth-events/auth-event.service';
import { AuthEventQueryDto } from '../dto/auth-event-query.dto';
import { logger } from '@/util/logger';

@Controller('admin/auth-events')
export class AdminAuthEventsController {

  constructor(
    private readonly deviceService: DeviceService,
    private readonly authEventService: AuthEventService
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllAuthEvents(@Query() query: AuthEventQueryDto) {
    logger.info('Admin fetching auth events', { query }, 'AdminAuthEventsController');
    
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
    
    logger.info('Admin auth events retrieved', { 
      count: events.length,
      filters
    }, 'AdminAuthEventsController');
    
    return events;
  }

  @Get('user/:firebaseUid')
  @Roles(UserRole.ADMIN)
  async getUserAuthEvents(
    @Param('firebaseUid') firebaseUid: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    logger.info('Admin fetching user auth events', { 
      firebaseUid,
      limit,
      offset 
    }, 'AdminAuthEventsController');
    
    const events = await this.authEventService.findByFirebaseUid(
      firebaseUid,
      limit || 50,
      offset || 0
    );
    
    logger.info('User auth events retrieved', { 
      firebaseUid,
      count: events.length 
    }, 'AdminAuthEventsController');
    
    return events;
  }
}