import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { 
  AdminUsersController,
  AdminDevicesController,
  AdminAuthEventsController,
  AdminOpenAIController,
  AdminPaymentsController,
  AdminSchedulesController,
  AdminScheduleExecutionsController,
  AdminNotificationsController,

  AdminAstrologyController,
  AdminSignsController,
  AdminPlanetsController,
  AdminHousesController,
  AdminElementsController,
  AdminModalitiesController,
  AdminPolaritiesController,
  AdminDynamicsController,
  AdminEnergyTypesController,  
  AdminSignInteractionsController,
  AdminPlanetaryPositionsController,
  AdminElementInteractionsController,
  AdminModalityInteractionsController,
  AdminPlanetInteractionsController,
  AdminPolarityInteractionsController,

  AdminStatsController,
  AdminUsersStatsController,
  AdminDevicesStatsController,
  AdminAuthEventsStatsController,
  AdminNotificationsStatsController,
  AdminSchedulesStatsController,
  AdminScheduleExecutionsStatsController,
  AdminOpenAIStatsController,
  AdminSubscriptionsStatsController,
  AdminAstrologyStatsController,
} from './controllers';

import { AppServicesModule } from '../app-services.module';
import { AdminUsersStatsService } from './services/admin-users-stats.service';
import { AdminDevicesStatsService } from './services/admin-devices-stats.service';
import { AdminAuthEventsStatsService } from './services/admin-auth-events-stats.service';
import { AdminNotificationsStatsService } from './services/admin-notifications-stats.service';
import { AdminOpenAIStatsService } from './services/admin-openai-stats.service';
import { AdminSchedulesStatsService } from './services/admin-schedules-stats.service';
import { AdminScheduleExecutionsStatsService } from './services/admin-schedule-executions-stats.service';
import { AdminSubscriptionsStatsService } from './services/admin-subscriptions-stats.service';
import { AdminAstrologyStatsService } from './services/admin-astrology-stats.service';

import { UserProfileSchema } from '@/users/schemas/user-profile.schema';
import { DeviceSchema } from '@/devices/schemas/device.schema';
import { AuthEventSchema } from '@/auth-events/schemas/auth-event.schema';
import { NotificationSchema } from '@/notifications/schemas/notification.schema';
import { OpenAIUsageSchema } from '@/openai/schemas/openai-usage.schema';
import { ScheduleSchema } from '@/schedules/schemas/schedule.schema';
import { ScheduleExecutionSchema } from '@/schedules/schemas/schedule-execution.schema';
import { SignSchema } from '@/astrology/schemas/sign.schema';
import { PlanetSchema } from '@/astrology/schemas/planet.schema';
import { HouseSchema } from '@/astrology/schemas/house.schema';
import { ElementSchema } from '@/astrology/schemas/element.schema';
import { ModalitySchema } from '@/astrology/schemas/modality.schema';
import { PolaritySchema } from '@/astrology/schemas/polarity.schema';
import { DynamicSchema } from '@/astrology/schemas/dynamic.schema';
import { EnergyTypeSchema } from '@/astrology/schemas/energy-type.schema';
import { PaymentHistorySchema } from '@/payments/schemas/payment-history.schema';
import { SignInteractionSchema } from '@/astrology/schemas/sign-interaction.schema';
import { ElementInteractionSchema } from '@/astrology/schemas/element-interaction.schema';
import { ModalityInteractionSchema } from '@/astrology/schemas/modality-interaction.schema'; 
import { PlanetInteractionSchema } from '@/astrology/schemas/planet-interaction.schema';
import { PlanetaryPositionSchema } from '@/astrology/schemas/planetary-position.schema';
import { PolarityInteractionSchema } from '@/astrology/schemas/polarity-interaction.schema';

@Module({
  imports: [
    AppServicesModule,
    MongooseModule.forFeature([
      { name: 'UserProfile', schema: UserProfileSchema },
      { name: 'Device', schema: DeviceSchema },
      { name: 'AuthEvent', schema: AuthEventSchema },
      { name: 'Notification', schema: NotificationSchema },
      { name: 'OpenAIUsage', schema: OpenAIUsageSchema },
      { name: 'Schedule', schema: ScheduleSchema },
      { name: 'ScheduleExecution', schema: ScheduleExecutionSchema },
      { name: 'PaymentHistory', schema: PaymentHistorySchema },
      { name: 'Sign', schema: SignSchema },
      { name: 'Planet', schema: PlanetSchema },
      { name: 'House', schema: HouseSchema },
      { name: 'Element', schema: ElementSchema },
      { name: 'Modality', schema: ModalitySchema },
      { name: 'Polarity', schema: PolaritySchema },
      { name: 'Dynamic', schema: DynamicSchema },
      { name: 'EnergyType', schema: EnergyTypeSchema },      
      { name: 'SignInteraction', schema: SignInteractionSchema },
      { name: 'ElementInteraction', schema: ElementInteractionSchema },
      { name: 'ModalityInteraction', schema: ModalityInteractionSchema },
      { name: 'PlanetInteraction', schema: PlanetInteractionSchema },
      { name: 'PlanetaryPosition', schema: PlanetaryPositionSchema },
      { name: 'PolarityInteraction', schema: PolarityInteractionSchema },
    ])
  ],
  controllers: [
    AdminUsersController,
    AdminDevicesController,
    AdminAuthEventsController,
    AdminPaymentsController,
    AdminOpenAIController,
    AdminSchedulesController,
    AdminScheduleExecutionsController,
    AdminNotificationsController,
    
    AdminAstrologyController,
    AdminSignsController,
    AdminPlanetsController,  
    AdminHousesController,  
    AdminElementsController,
    AdminModalitiesController,
    AdminPolaritiesController,
    AdminDynamicsController,
    AdminEnergyTypesController,    
    AdminSignInteractionsController,
    AdminPlanetaryPositionsController,
    AdminElementInteractionsController,
    AdminModalityInteractionsController,
    AdminPlanetInteractionsController,
    AdminPolarityInteractionsController,
    
    AdminStatsController,
    AdminUsersStatsController,
    AdminDevicesStatsController,
    AdminAuthEventsStatsController,
    AdminNotificationsStatsController,
    AdminSchedulesStatsController,
    AdminScheduleExecutionsStatsController,
    AdminOpenAIStatsController,
    AdminSubscriptionsStatsController,
    AdminAstrologyStatsController,
  ],
  providers: [
    AdminUsersStatsService,
    AdminDevicesStatsService,
    AdminAuthEventsStatsService,
    AdminNotificationsStatsService,
    AdminOpenAIStatsService,
    AdminSchedulesStatsService,
    AdminScheduleExecutionsStatsService,
    AdminSubscriptionsStatsService,
    AdminAstrologyStatsService
  ]
})
export class AdminModule {}