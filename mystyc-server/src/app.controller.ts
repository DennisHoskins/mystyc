import { Controller, Get, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';

@Controller()
export class AppController {
  @Get()
  getApiStatus(): object {
    return { 
      status: 'online',
      version: '1.0.0'
    };
  }

  @Get('protected')
  @UseGuards(FirebaseAuthGuard)
  getProtectedResource(): object {
    return { 
      message: 'This is a protected resource',
      timestamp: new Date().toISOString()
    };
  }
}