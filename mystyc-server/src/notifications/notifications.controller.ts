import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { FirebaseUser } from '@/common/interfaces/firebaseUser.interface';
import { FirebaseUser as FirebaseUserDecorator } from '@/common/decorators/user.decorator';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { RolesGuard } from '@/common/guards/roles.guard';
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
}
