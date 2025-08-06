export interface AstrologySummaryStats {
  totalPlanetaryPositions: number;
  totalElementInteractions: number;
  totalModalityInteractions: number;
  totalPlanetInteractions: number;
  planetaryPositionsByElement: Array<{
    element: string;
    count: number;
    percentage: number;
  }>;
  planetaryPositionsByModality: Array<{
    modality: string;
    count: number;
    percentage: number;
  }>;
}

export interface AstrologyInteractionStats {
  elementDynamics: Array<{
    dynamic: string;
    count: number;
    percentage: number;
  }>;
  modalityDynamics: Array<{
    dynamic: string;
    count: number;
    percentage: number;
  }>;
  planetDynamics: Array<{
    dynamic: string;
    count: number;
    percentage: number;
  }>;
  mostCommonDynamic: string;
}

export interface AstrologyKnowledgeDistributionStats {
  planetDistribution: Array<{
    planet: string;
    positionsCount: number;
    interactionsCount: number;
    totalReferences: number;
  }>;
  signDistribution: Array<{
    sign: string;
    count: number;
    percentage: number;
  }>;
  averageKeywordsPerEntry: number;
  totalUniqueKeywords: number;
}

export interface AstrologyStats {
  summary: AstrologySummaryStats;
  interactions: AstrologyInteractionStats;
  distribution: AstrologyKnowledgeDistributionStats;
}