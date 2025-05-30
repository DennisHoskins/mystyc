import { Injectable } from '@nestjs/common';

import { firebaseAdmin } from '@/auth/firebase-admin.provider';
import { logger } from '@/util/logger';

@Injectable()
export class NotificationsService {
  async sendNotification(token: string, title: string, body: string) {
    try {
      const message = {
        data: {
          title,
          body,
        },
        token,
      };

      const response = await firebaseAdmin.messaging().send(message);
      logger.info('Notification sent successfully', { 
        messageId: response,
        token: token.substring(0, 20) + '...' 
      });
      
      return response;
    } catch (error) {
      logger.error('Failed to send notification', { 
        error: error.message,
        token: token.substring(0, 20) + '...' 
      });
      throw error;
    }
  }
}