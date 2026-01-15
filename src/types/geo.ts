// Types from AI Geographic Analysis Assistant (more complete backend)

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface LocationInfo {
  address: string;
  coordinates: Coordinates;
  city?: string;
  country?: string;
}

export interface InfrastructureData {
  hospitals: number;
  schools: number;
  parks: number;
  commerce: number;
  transport: number;
}

export interface RiskData {
  floodRisk: 'bajo' | 'medio' | 'alto';
  seismicRisk: 'bajo' | 'medio' | 'alto';
  fireRisk: 'bajo' | 'medio' | 'alto';
  details: string;
  // Additional fields for compatibility
  level?: 'BAJO' | 'MEDIO' | 'ALTO';
  waterBodiesCount?: number;
}

export interface UrbanismData {
  landUse: string[];
  zoning: string;
  population: string;
  density: string;
}

export interface AnalysisReport {
  location: LocationInfo;
  infrastructure: InfrastructureData;
  risks: RiskData;
  urbanism: UrbanismData;
  aiReport: string;
  timestamp: string;
}

export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

// Map layer configuration
export interface MapLayer {
  id: string;
  name: string;
  description: string;
  type: 'tile' | 'overlay' | 'data';
  url?: string;
  opacity?: number;
  category: 'base' | 'weather' | 'terrain' | 'data' | 'risk';
  icon: string;
  attribution?: string;
}

// For compatibility with UI components
export interface GeoLocation {
  lat: number;
  lon: number;
  displayName?: string;
}

export interface SavedLocation {
  id: string;
  name: string;
  coords: { lat: number; lon: number };
  date: string;
  report: string;
  address?: string;
  note?: string;
}
