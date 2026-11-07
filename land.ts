export type KbrDistrict =
  | 'Нальчик'
  | 'Черекский район'
  | 'Чегемский район'
  | 'Урванский район'
  | 'Прохладненский район'
  | 'Баксанский район'
  | 'Зольский район'
  | 'Майский район'
  | 'Эльбрусский район'
  | 'Лескенский район';

export type LandCategory =
  | 'Земли сельскохозяйственного назначения'
  | 'Земли населенных пунктов'
  | 'Земли рекреационного назначения'
  | 'Земли промышленности и иного спецназначения';

export type SearchPurpose =
  | 'kfh' // КФХ
  | 'orchard' // Садоводство и ягодное производство
  | 'greenhouse' // Тепличное хозяйство
  | 'agrotourism' // Агротуризм
  | 'tourism_facility' // Объекты сельского туризма (ФЗ-318)
  | 'izhs' // ИЖС
  | 'any';

export type OwnershipType =
  | 'Государственная (неразграниченная)'
  | 'Республиканская (Кабардино-Балкарская Республика)'
  | 'Муниципальная'
  | 'Федеральная';

export type RoadType = 'Асфальтированная' | 'Грунтовая улучшенная (гравий)' | 'Полевая дорога';

export type WaterSourceType =
  | 'Река/канал (открытый водозабор)'
  | 'Мелиоративный канал'
  | 'Артезианская скважина (требует бурения)'
  | 'Централизованный водовод';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ParcelBoundaryPoint {
  lat: number;
  lng: number;
}

export interface UtilitySpecs {
  hasRoadAccess: boolean;
  roadType: RoadType;
  distanceToHighwayKm: number;
  highwayName?: string;
  hasElectricity: boolean;
  electricityDistanceM: number;
  substationCapacityKva?: number;
  hasGas: boolean;
  gasDistanceM: number;
  waterSource: WaterSourceType;
  distanceToWaterM: number;
  reliefType: 'Равнинный' | 'Слабопокатый (1-3°)' | 'Предгорный (3-8°)' | 'Горно-долинный';
  elevationMeters: number;
}

export interface AgroSpecs {
  soilType: string;
  bonitetScore: number; // 0-100
  annualPrecipitationMm: number;
  frostFreePeriodDays: number;
  activeTempSum: number;
  recommendedCrops: string[];
}

export interface LegalAnalysisResult {
  isEligibleDirectLeaseWithoutAuction: boolean; // ст. 39.18 ЗК РФ
  directLeaseArticle: string;
  requiresTerritorySchemeKPT: boolean; // ст. 39.15 ЗК РФ
  hasAuctionNoticePublished: boolean; // Опубликовано ли извещение на ГИС Торги
  auctionNoticeNumber?: string;
  auctionPublicationDate?: string;
  auctionBiddingDeadline?: string;
  applicableLaws: Array<{
    law: string;
    article: string;
    summary: string;
    linkUrl?: string;
  }>;
  restrictionsAndEncumbrances: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    isBlocking: boolean;
  }>;
  stepByStepActionPlan: Array<{
    stepNumber: number;
    title: string;
    authority: string;
    timeframeDays: number;
    legalBasis: string;
    details: string;
  }>;
  requiredDocuments: Array<{
    name: string;
    isMandatory: boolean;
    description: string;
    templateAvailable: boolean;
  }>;
}

export interface EconomicAssessment {
  cadastralValueRub: number;
  cadastralValuePerHaRub: number;
  annualRentRub: number;
  rentCalculationBasis: string;
  buyoutValueRub?: number;
  estimatedCapex: {
    fencingRub: number;
    wellDrillingRub: number;
    electricityConnectionRub: number;
    landPreparationRub: number;
    irrigationSystemRub: number;
    totalCapexRub: number;
  };
  eligibleSubsidies: Array<{
    programName: string;
    authority: string;
    maxAmountRub: number;
    conditions: string;
    coFinancingPercent: number;
  }>;
  estimatedAnnualRevenueRub: number;
  projectedPaybackYears: number;
}

export interface LandParcel {
  id: string;
  cadastralNumber: string;
  name: string;
  district: KbrDistrict;
  municipality: string;
  nearestSettlement: string;
  areaHa: number;
  category: LandCategory;
  permittedUseCode: string; // e.g. "1.5"
  permittedUseTitle: string; // e.g. "Садоводство"
  suitablePurposes: SearchPurpose[];
  ownership: OwnershipType;
  coordinates: Coordinates;
  boundary: ParcelBoundaryPoint[];
  neighboringPlots: Array<{
    cadastralNumber: string;
    use: string;
  }>;
  sourceType: 'ГИС Торги' | 'Росреестр (ЕГРН)' | 'НСПД' | 'Минземимущество КБР' | 'Муниципальный фонд';
  sourceExternalId: string;
  sourceUrl: string;
  discoveryDate: string;
  utilities: UtilitySpecs;
  agro: AgroSpecs;
  legal: LegalAnalysisResult;
  economics: EconomicAssessment;
  tags: string[];
}

export interface SearchFilterState {
  district: KbrDistrict | 'all';
  municipality: string;
  purpose: SearchPurpose;
  minAreaHa: number;
  maxAreaHa: number;
  category: LandCategory | 'all';
  permittedUse: string | 'all';
  ownership: OwnershipType | 'all';
  directLeaseOnly: boolean;
  hasAuctionOnly: boolean;
  hasRoadOnly: boolean;
  hasElectricityOnly: boolean;
  hasGasOnly: boolean;
  hasWaterOnly: boolean;
  searchQuery: string;
}

export interface RegistrySourceStatus {
  id: string;
  name: string;
  shortName: string;
  url: string;
  status: 'connected' | 'partially_available' | 'maintenance' | 'offline';
  lastPingMs: number;
  lastSyncTime: string;
  totalRecordsFound: number;
  description: string;
  protocol: string;
}
