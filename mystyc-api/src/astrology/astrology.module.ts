import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';

import { UserProfilesService } from '@/users/user-profiles.service'; 

import { AstrologyService } from './astrology.service';
import { AstrologyKnowledgeController } from './astrology-knowledge.controller';

import { SignsService } from './signs.service';
import { PlanetsService } from './planets.service';
import { ElementsService } from './elements.service';
import { ModalitiesService } from './modalities.service';
import { DynamicsService } from './dynamics.service';
import { EnergyTypesService } from './energy-types.service';
import { PlanetaryPositionsService } from './planetary-positions.service';
import { ElementInteractionsService } from './element-interactions.service';
import { ModalityInteractionsService } from './modality-interactions.service';
import { PlanetInteractionsService } from './planet-interactions.service';

import { UserProfileSchema } from '@/users/schemas/user-profile.schema';

import { Sign, SignSchema } from './schemas/sign.schema';
import { Planet, PlanetSchema } from './schemas/planet.schema';
import { Element, ElementSchema } from './schemas/element.schema';
import { Modality, ModalitySchema } from './schemas/modality.schema';
import { Dynamic, DynamicSchema } from './schemas/dynamic.schema';
import { EnergyType, EnergyTypeSchema } from './schemas/energy-type.schema';
import { PlanetaryPosition, PlanetaryPositionSchema } from './schemas/planetary-position.schema';
import { ElementInteraction, ElementInteractionSchema } from './schemas/element-interaction.schema';
import { ModalityInteraction, ModalityInteractionSchema } from './schemas/modality-interaction.schema';
import { PlanetInteraction, PlanetInteractionSchema } from './schemas/planet-interaction.schema';

@Module({
  imports: [
    FirebaseModule,
    MongooseModule.forFeature([
      { name: "UserProfile", schema: UserProfileSchema, collection: 'userProfiles'},
      { name: 'Sign', schema: SignSchema },
      { name: 'Planet', schema: PlanetSchema },
      { name: 'Element', schema: ElementSchema },
      { name: 'Modality', schema: ModalitySchema },
      { name: 'Dynamic', schema: DynamicSchema },
      { name: 'EnergyType', schema: EnergyTypeSchema },      
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
    SignsService,
    PlanetsService,
    ElementsService,
    ModalitiesService,
    DynamicsService,
    EnergyTypesService,    
    PlanetaryPositionsService,
    ElementInteractionsService,
    ModalityInteractionsService,
    PlanetInteractionsService
  ],
  exports: [
    AstrologyService,
    SignsService,
    PlanetsService,
    ElementsService,
    ModalitiesService,
    DynamicsService,
    EnergyTypesService,
    PlanetaryPositionsService,
    ElementInteractionsService,
    ModalityInteractionsService,
    PlanetInteractionsService
  ]
})
export class AstrologyModule {}