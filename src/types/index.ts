export type AppMode = 'kisan' | 'explorer';
export type Language = 'en' | 'hi';
export type NetworkMode = 'normal' | 'degraded';

export interface LocationInfo {
  name: string;
  nameHi: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  elevation: number; // in meters MSL
}

export interface WeatherCurrent {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  precipitation: number;
  weatherCode: number;
  conditionEn: string;
  conditionHi: string;
  icon: string;
  windSpeed: number;
  windDirection: number;
  windCompass: string;
  surfacePressure: number;
  uvIndex: number;
  uvLabel: string;
  soilMoisture: number; // percentage
  solarIrradiance: number; // W/m²
  evapotranspiration: number; // mm/day
  vaporPressureDeficit: number; // kPa
  updatedAt: string;
}

export interface WeatherHourly {
  time: string;
  hour: string;
  temperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  condition: string;
  icon: string;
  uvIndex: number;
  windSpeed: number;
}

export interface WeatherDaily {
  date: string;
  dayNameEn: string;
  dayNameHi: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  weatherCode: number;
  conditionEn: string;
  conditionHi: string;
  icon: string;
}

export interface ConsensusInfo {
  confidenceScore: number; // e.g. 98.4
  confidenceLevel: 'High' | 'Moderate' | 'Low';
  primarySource: string;
  secondarySource: string;
  temperatureDelta: number; // e.g. ±0.2°C
  precipitationConsensus: boolean;
  statusTextEn: string;
  statusTextHi: string;
}

export interface SoilConfig {
  soilType: string;
  soilNameEn: string;
  soilNameHi: string;
  soilClass: string;
  moistureCapacity: string;
  moisturePercentage: number;
  organicContent: string;
  phValue: number;
  drainageRate: string;
  waterSource: 'tubewell' | 'canal' | 'rainfed';
  landArea: number;
  landUnit: 'acres' | 'bigha';
  photoUrl?: string;
  aiDiagnosis?: {
    identifiedType: string;
    textureDescription: string;
    moistureEstimate: string;
    isApproximate: true;
  };
}

export interface CropRecommendation {
  id: string;
  nameEn: string;
  nameHi: string;
  variety: string;
  category: 'primary' | 'safe' | 'alternative';
  sowingWindowEn: string;
  sowingWindowHi: string;
  waterDemandLevel: number; // 1 to 5
  waterDemandLabelEn: string;
  waterDemandLabelHi: string;
  estimatedYieldEn: string;
  estimatedYieldHi: string;
  riskBadgeEn: string;
  riskBadgeHi: string;
  riskLevel: 'low' | 'medium' | 'high';
  soilMatchScore: number; // e.g. 96%
  rationaleEn: string;
  rationaleHi: string;
  audioSpeechText: string;
  keyRisksEn: string;
  keyRisksHi: string;
  marketTrendEn: string;
  marketTrendHi: string;
  imageUrl: string;
}

export interface GovernmentAlert {
  id: string;
  severity: 'red' | 'orange' | 'yellow' | 'green';
  severityLabelEn: string;
  severityLabelHi: string;
  source: string;
  titleEn: string;
  titleHi: string;
  englishSummary: string;
  hindiSummary: string;
  affectedTehsils: string[];
  validFrom: string;
  validTo: string;
  expiresInText: string;
  radarTracked: boolean;
  audioScriptHi: string;
  audioScriptEn: string;
  farmerDirectives: Array<{
    step: number;
    titleEn: string;
    titleHi: string;
    descriptionEn: string;
    descriptionHi: string;
    icon: string;
    urgency: 'immediate' | 'high' | 'precautionary';
    audioSnippetHi: string;
  }>;
}

export interface WorkSafetyHour {
  hour: string;
  safetyStatus: 'safe' | 'caution' | 'hazardous';
  safetyLabelEn: string;
  safetyLabelHi: string;
  temperature: number;
  wbgt: number; // Wet-Bulb Globe Temp
  heatIndex: number;
  uvIndex: number;
  rainChance: number;
  advisoryNoteEn: string;
  advisoryNoteHi: string;
}

export interface RouteWaypoint {
  name: string;
  distanceKm: number;
  eta: string;
  temperature: number;
  condition: string;
  icon: string;
  windGustKm: number;
  visibilityKm: number;
  surfaceStatus: 'Dry' | 'Damp' | 'Waterlogged';
  riskLevel: 'low' | 'moderate' | 'severe';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  textHi?: string;
  reply?: string;
  detectedLanguage?: 'hi' | 'en';
  spokenResponse?: string;
  consensusScore?: number;
  modelBadge?: string;
  sources?: string[];
  tableData?: Array<Record<string, string>>;
  verdictCallout?: {
    type: 'warning' | 'info' | 'success';
    title: string;
    titleEn?: string;
    titleHi?: string;
    description: string;
    descriptionEn?: string;
    descriptionHi?: string;
  };
}
