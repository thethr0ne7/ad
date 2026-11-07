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
  verificationSource: 'ГИС Торги (официальный лот)' | 'Росреестр (ЕГРН КПТ)' | 'НСПД (свободный контур)' | 'Минземимущество КБР';
  applicableLaws: Array<{
    law: string;
    article: string;
    summary: string;
    linkUrl?: string;
    isVerifiedFact: boolean;
  }>;
  restrictionsAndEncumbrances: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    isBlocking: boolean;
    statutoryBasis: string;
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

export interface ParcelHistoryEntry {
  id: string;
  date: string;
  action: string;
  author: string;
  documentNumber?: string;
  statusChange?: string;
  notes?: string;
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
  verificationStatus: 'verified_official_registry' | 'published_torgi' | 'municipal_fund' | 'unallocated_contour';
  utilities: UtilitySpecs;
  agro: AgroSpecs;
  legal: LegalAnalysisResult;
  economics: EconomicAssessment;
  history: ParcelHistoryEntry[];
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
  status: 'unknown' | 'connected' | 'partially_available' | 'restricted_geo' | 'timeout' | 'offline';
  statusLabel: string;
  httpStatus?: number;
  lastPingMs: number;
  lastSyncTime: string;
  totalRecordsFound: number;
  description: string;
  protocol: string;
  diagnosticDetails: string;
  isLiveProbe: boolean;
}

export interface CadastralVerificationResult {
  isValidCadastralFormat: boolean;
  cadastralNumber: string;
  regionCode: string; // "07"
  regionName: string; // "Кабардино-Балкарская Республика"
  districtCode: string;
  districtName: string;
  quarterCode: string;
  isRegisteredInKbrRegistry: boolean;
  matchedParcel?: LandParcel;
  directLinks: {
    rosreestrPkkUrl: string;
    nspdUrl: string;
    gisTorgiUrl: string;
    egrnPortalUrl: string;
  };
  legalAnalysisSummary: string;
}
