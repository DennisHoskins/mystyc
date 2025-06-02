import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { FirebaseUser } from '@/common/interfaces/firebaseUser.interface';
import { FirebaseUser as FirebaseUserDecorator } from '@/common/decorators/user.decorator';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { RolesGuard } from '@/common/guards/roles.guard';
import { SendNotificationDto } from './dto/send-notification.dto';
import { logger } from '@/util/logger';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService
  ) {}

  @Post('test')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async sendTestNotification(
    @Body() body: { token: string },
    @FirebaseUserDecorator() user: FirebaseUser
  ) {
    logger.info('Sending test notification', {
      token: body.token.substring(0, 20) + '...'
    });

    try {
      const result = await this.notificationsService.sendNotification(
        body.token,
        'Hello World',
        'This is a test notification from your server!'
      );

      return {
        success: true,
        messageId: result
      };
    } catch (error) {
      logger.error('Test notification failed', { error: error.message });
      throw error;
    }
  }

  @Post('send')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async sendNotification(
    @Body() sendNotificationDto: SendNotificationDto,
    @FirebaseUserDecorator() user: FirebaseUser
  ) {
    logger.info('Admin sending notification', {
      adminUid: user.uid,
      targetType: sendNotificationDto.test ? 'test' : 
                  sendNotificationDto.deviceId ? 'device' : 
                  sendNotificationDto.firebaseUid ? 'user' : 
                  sendNotificationDto.broadcast ? 'broadcast' : 'unknown',
      title: sendNotificationDto.title,
      hasCustomMessage: !!(sendNotificationDto.title || sendNotificationDto.body)
    });

    try {
      const result = await this.notificationsService.sendNotificationToTargets(
        user.uid,
        sendNotificationDto
      );

      logger.info('Notification batch completed successfully', {
        adminUid: user.uid,
        sent: result.sent,
        failed: result.failed
      });

      return result;
    } catch (error) {
      logger.error('Notification batch failed', { 
        adminUid: user.uid,
        error: error.message 
      });
      throw error;
    }
  }
}