import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';

import { UserProfilesService } from '@/users/user-profiles.service'; 

import { AstrologyKnowledgeController } from './astrology-knowledge.controller';

import { AstrologyService } from './services/astrology.service';
import { AstrologyDataService } from './services/astrology-data.service';
import { SignsService } from './services/signs.service';
import { PlanetsService } from './services/planets.service';
import { ElementsService } from './services/elements.service';
import { ModalitiesService } from './services/modalities.service';
import { DynamicsService } from './services/dynamics.service';
import { PolarityInteractionSchema } from './schemas/polarity-interaction.schema';
import { EnergyTypesService } from './services/energy-types.service';
import { PolarityInteractionsService } from './services/polarity-interactions.service';
import { PlanetaryPositionsService } from './services/planetary-positions.service';
import { SignInteractionsService } from './services/sign-interactions.service';
import { ElementInteractionsService } from './services/element-interactions.service';
import { ModalityInteractionsService } from './services/modality-interactions.service';
import { PlanetInteractionsService } from './services/planet-interactions.service';
import { PolaritiesService } from './services/polarities.service';
import { HousesService } from './services/houses.service';

import { UserProfileSchema } from '@/users/schemas/user-profile.schema';

import { SignSchema } from './schemas/sign.schema';
import { PlanetSchema } from './schemas/planet.schema';
import { ElementSchema } from './schemas/element.schema';
import { ModalitySchema } from './schemas/modality.schema';
import { DynamicSchema } from './schemas/dynamic.schema';
import { EnergyTypeSchema } from './schemas/energy-type.schema';
import { SignInteractionSchema } from './schemas/sign-interaction.schema';
import { PlanetaryPositionSchema } from './schemas/planetary-position.schema';
import { ElementInteractionSchema } from './schemas/element-interaction.schema';
import { ModalityInteractionSchema } from './schemas/modality-interaction.schema';
import { PlanetInteractionSchema } from './schemas/planet-interaction.schema';
import { AstrologyDocumentSchema } from './schemas/astrology.schema';
import { PolaritySchema } from './schemas/polarity.schema';
import { HouseSchema } from './schemas/house.schema';

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
      { name: 'SignInteraction', schema: SignInteractionSchema },
      { name: 'PolarityInteraction', schema: PolarityInteractionSchema },
      { name: 'PlanetaryPosition', schema: PlanetaryPositionSchema },
      { name: 'ElementInteraction', schema: ElementInteractionSchema },
      { name: 'ModalityInteraction', schema: ModalityInteractionSchema },
      { name: 'PlanetInteraction', schema: PlanetInteractionSchema },
      { name: 'AstrologyDocument', schema: AstrologyDocumentSchema },
      { name: 'Polarity', schema: PolaritySchema },
      { name: 'House', schema: HouseSchema }
    ])
  ],
  controllers: [AstrologyKnowledgeController],
  providers: [
    UserProfilesService,
    AstrologyService,
    AstrologyDataService,
    SignsService,
    PlanetsService,
    ElementsService,
    ModalitiesService,
    DynamicsService,
    EnergyTypesService,    
    SignInteractionsService,
    PolarityInteractionsService,
    PlanetaryPositionsService,
    ElementInteractionsService,
    ModalityInteractionsService,
    PlanetInteractionsService,
    PolaritiesService,
    HousesService
  ],
  exports: [
    AstrologyService,
    AstrologyDataService,
    SignsService,
    PlanetsService,
    ElementsService,
    ModalitiesService,
    DynamicsService,
    EnergyTypesService,
    SignInteractionsService,
    PolarityInteractionsService,
    PlanetaryPositionsService,
    ElementInteractionsService,
    ModalityInteractionsService,
    PlanetInteractionsService,
    PolaritiesService,
    HousesService
  ]
})
export class AstrologyModule {}