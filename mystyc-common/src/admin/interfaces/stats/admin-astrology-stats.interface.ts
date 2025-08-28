export interface AstrologySummaryStats {
  totalSigns: number;
  totalPlanets: number;
  totalHouses: number;
  totalElements: number;
  totalModalities: number;
  totalPolarities: number;
  totalDynamics: number;
  totalEnergyTypes: number;
  totalPlanetaryPositions: number;
  totalElementInteractions: number;
  totalModalityInteractions: number;
  totalPlanetInteractions: number;
}

export interface AstrologyStats {
  summary: AstrologySummaryStats;
}