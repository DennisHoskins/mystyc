import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';

import { UserProfilesService } from '@/users/user-profiles.service'; 

import { AstrologyService } from './astrology.service';
import { AstrologyKnowledgeController } from './astrology-knowledge.controller';

import { PlanetaryPositionsService } from './planetary-positions.service';
import { ElementInteractionsService } from './element-interactions.service';
import { ModalityInteractionsService } from './modality-interactions.service';
import { PlanetInteractionsService } from './planet-interactions.service';

import { UserProfileSchema } from '@/users/schemas/user-profile.schema';

import { PlanetaryPosition, PlanetaryPositionSchema } from './schemas/planetary-position.schema';
import { ElementInteraction, ElementInteractionSchema } from './schemas/element-interaction.schema';
import { ModalityInteraction, ModalityInteractionSchema } from './schemas/modality-interaction.schema';
import { PlanetInteraction, PlanetInteractionSchema } from './schemas/planet-interaction.schema';

@Module({
  imports: [
    FirebaseModule,
    MongooseModule.forFeature([
      { name: "UserProfile", schema: UserProfileSchema, collection: 'userProfiles'},
      { name: 'PlanetaryPosition', schema: PlanetaryPositionSchema },
      { name: 'ElementInteraction', schema: ElementInteractionSchema },
      { name: 'ModalityInteraction', schema: ModalityInteractionSchema },
      { name: 'PlanetInteraction', schema: PlanetInteractionSchema }
    ])
  ],
  controllers: [AstrologyKnowledgeController],
  providers: [
    UserProfilesService,
    AstrologyService,
    PlanetaryPositionsService,
    ElementInteractionsService,
    ModalityInteractionsService,
    PlanetInteractionsService
  ],
  exports: [
    AstrologyService,
    PlanetaryPositionsService,
    ElementInteractionsService,
    ModalityInteractionsService,
    PlanetInteractionsService
  ]
})
export class AstrologyModule {}