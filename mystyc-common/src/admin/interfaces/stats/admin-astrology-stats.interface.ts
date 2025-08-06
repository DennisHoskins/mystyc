export interface AstrologySummaryStats {
  totalSigns: number;
  totalPlanets: number;
  totalElements: number;
  totalModalities: number;
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