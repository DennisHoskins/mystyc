import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { ThrottlerExceptionFilter } from '@/common/filters/throttler-exception.filter';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';

import { FirebaseModule } from '@/auth/firebase.module';
import { UsersModule } from '@/users/users.module';
import { AdminModule } from '@/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 1000,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 100,
      }
    ]),
    FirebaseModule,
    UsersModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }
  ],
})
export class AppModule {}
