import { Controller, Query, Get, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { DevicesService } from '@/devices/devices.service';
import { AdminDevicesStatsService } from '@/admin/services/admin-devices-stats.service';
import { Device } from '@/common/interfaces/device.interface';
import { 
  PlatformStatsResponse,
  FcmTokenStats,
  DeviceActivityStats,
  DeviceUserAgentStats  
} from '@/common/interfaces/admin/adminDeviceStats.interface';
import { AdminController } from '../admin.controller';
import { AdminDeviceStatsQueryDto } from '../../dto/stats/admin-device-stats-query.dto';

@Controller('admin/devices')
export class AdminDevicesStatsController extends AdminController<Device> {
  protected serviceName = 'Devices';

  constructor(
    protected service: DevicesService,
    private readonly adminDevicesStatsService: AdminDevicesStatsService,
  ) {
    super();
  }

  @Get('stats/platform')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPlatformStats(@Query() query: AdminDeviceStatsQueryDto): Promise<PlatformStatsResponse> {
    return this.adminDevicesStatsService.getPlatformStats(query);
  }

  @Get('stats/fcmToken')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getFcmTokenStats(@Query() query: AdminDeviceStatsQueryDto): Promise<FcmTokenStats> {
    return this.adminDevicesStatsService.getFcmTokenStats(query);
  }

  @Get('stats/activity')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getActivityStats(@Query() query: AdminDeviceStatsQueryDto): Promise<DeviceActivityStats> {
    return this.adminDevicesStatsService.getDeviceActivityStats(query);
  }

  @Get('stats/userAgent')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUserAgentStats(@Query() query: AdminDeviceStatsQueryDto): Promise<DeviceUserAgentStats> {
    return this.adminDevicesStatsService.getUserAgentStats(query);
  }
}