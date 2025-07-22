import { SetMetadata } from '@nestjs/common';
import { SubscriptionLevel } from 'mystyc-common/constants/subscription-levels.enum';

export const SUBSCRIPTION_LEVELS_KEY = 'subscriptionLevels';
export const RequireSubscriptionLevels = (...levels: SubscriptionLevel[]) => SetMetadata(SUBSCRIPTION_LEVELS_KEY, levels);