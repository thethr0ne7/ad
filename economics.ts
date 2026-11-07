import { EconomicAssessment, SearchPurpose, UtilitySpecs } from './land';

export interface EconomicsInput {
  areaHa: number;
  district: string;
  purpose: SearchPurpose;
  utilities: UtilitySpecs;
  cadastralRatePerHa?: number;
}

/**
 * Calculates official cadastral value, rent, infrastructure CAPEX,
 * and state subsidies for Kabardino-Balkar Republic agricultural lands.
 */
export function calculateEconomics(input: EconomicsInput): EconomicAssessment {
  // District baseline cadastral value per ha (RUB) in KBR
  let baseValuePerHa = 95000;
  if (input.district === 'Прохладненский район' || input.district === 'Урванский район') {
    baseValuePerHa = 135000; // Высокобонитетные черноземы степной и предгорной зоны
  } else if (input.district === 'Чегемский район' || input.district === 'Баксанский район') {
    baseValuePerHa = 110000;
  } else if (input.district === 'Черекский район' || input.district === 'Зольский район') {
    baseValuePerHa = 78000; // Предгорные и горные пастбища / сады
  }

  const cadastralValuePerHa = input.cadastralRatePerHa || baseValuePerHa;
  const totalCadastralValue = Math.round(cadastralValuePerHa * input.areaHa);

  // Annual rent rate according to KBR Ministry of Property:
  // For KFH and agricultural production: 0.6% to 1.5% of cadastral value
  let rentRatePercent = 0.008; // 0.8% default
  if (input.purpose === 'orchard' || input.purpose === 'kfh') {
    rentRatePercent = 0.006; // Льготная ставка для КФХ и садоводов КБР (0.6%)
  } else if (input.purpose === 'agrotourism' || input.purpose === 'tourism_facility') {
    rentRatePercent = 0.012; // 1.2%
  } else if (input.purpose === 'izhs') {
    rentRatePercent = 0.015; // 1.5%
  }

  const annualRentRub = Math.round(totalCadastralValue * rentRatePercent);

  // Buyout value under Article 39.3 of Land Code (after 3 years of diligent lease use):
  // in KBR: 15% - 20% of cadastral value for farmers
  const buyoutValueRub = Math.round(totalCadastralValue * 0.15);

  // CAPEX calculations:
  // Approximate perimeter for square area: P = 4 * sqrt(Area in sq.m)
  const perimeterMeters = Math.round(4 * Math.sqrt(input.areaHa * 10000));
  const fencingRub = Math.round(perimeterMeters * 1250); // 1250 rub per meter (3D mesh / posts)

  // Well drilling: 4500 rub/m. Mountain/piedmont wells ~ 65 meters depth
  const wellDepthM = input.utilities.elevationMeters > 700 ? 80 : 50;
  const wellDrillingRub =
    input.utilities.waterSource === 'Река/канал (открытый водозабор)'
      ? 180000 // Заборная насосная станция
      : Math.round(wellDepthM * 4800 + 250000); // Скважина + обсадка + насос

  // Electricity connection:
  const elecDistKm = input.utilities.electricityDistanceM / 1000;
  const electricityConnectionRub = input.utilities.hasElectricity
    ? 95000 // Техприсоединение Россети Северный Кавказ (до 15 кВт льготное)
    : Math.round(elecDistKm * 750000 + 380000); // Строительство ВЛ 10/0.4 кВ + КТП

  // Land prep & plowing / de-stoning
  const landPrepPerHa = input.utilities.reliefType === 'Равнинный' ? 35000 : 55000;
  const landPreparationRub = Math.round(input.areaHa * landPrepPerHa);

  // Irrigation system (drip irrigation for orchards / berries / vegetables)
  let irrigationPerHa = 0;
  if (
    input.purpose === 'orchard' ||
    input.purpose === 'greenhouse' ||
    input.purpose === 'agrotourism'
  ) {
    irrigationPerHa = 160000; // Система капельного орошения со спанбондом и фильтрами
  }
  const irrigationSystemRub = Math.round(input.areaHa * irrigationPerHa);

  const totalCapexRub =
    fencingRub +
    wellDrillingRub +
    electricityConnectionRub +
    landPreparationRub +
    irrigationSystemRub;

  // Regional Subsidies in Kabardino-Balkaria
  const eligibleSubsidies: EconomicAssessment['eligibleSubsidies'] = [
    {
      programName: 'Грант "Агростартап" (Нацпроект МСП)',
      authority: 'Министерство сельского хозяйства КБР',
      maxAmountRub: 5000000,
      conditions:
        'Предоставляется начинающим главам КФХ. До 90% стоимости проекта финансирует государство, 10% — собственные средства.',
      coFinancingPercent: 90,
    },
    {
      programName: 'Субсидия на закладку и уход за многолетними насаждениями',
      authority: 'Минсельхоз КБР / Федеральный бюджет',
      maxAmountRub: Math.round(input.areaHa * 280000), // ~280k rub per ha
      conditions:
        'Компенсация части затрат на приобретение саженцев интенсивных яблонь/черешни на подвое М9, шпалерных систем и капельного полива.',
      coFinancingPercent: 70,
    },
  ];

  if (input.purpose === 'agrotourism' || input.purpose === 'tourism_facility') {
    eligibleSubsidies.push({
      programName: 'Грант "Агротуризм"',
      authority: 'Министерство сельского хозяйства Российской Федерации / КБР',
      maxAmountRub: 10000000,
      conditions:
        'Для с/х товаропроизводителей, реализующих проекты развития сельского туризма (глэмпинги, дегустационные залы, эко-маршруты).',
      coFinancingPercent: 75,
    });
  }

  // Revenue projection:
  let revenuePerHa = 350000;
  if (input.purpose === 'orchard') {
    revenuePerHa = 850000; // Интенсивный яблоневый сад КБР (35-50 т/га по 45-65 руб/кг)
  } else if (input.purpose === 'greenhouse') {
    revenuePerHa = 1900000; // Тепличное овощеводство (томаты, огурцы)
  } else if (input.purpose === 'agrotourism') {
    revenuePerHa = 600000;
  }

  const estimatedAnnualRevenueRub = Math.round(input.areaHa * revenuePerHa);
  const netProfitEst = estimatedAnnualRevenueRub * 0.38; // 38% net margin
  const projectedPaybackYears = Number((totalCapexRub / Math.max(netProfitEst, 100000)).toFixed(1));

  return {
    cadastralValueRub: totalCadastralValue,
    cadastralValuePerHaRub: cadastralValuePerHa,
    annualRentRub,
    rentCalculationBasis: `Ставка ${ (rentRatePercent * 100).toFixed(1) }% от кадастровой стоимости в соответствии с постановлением Правительства КБР`,
    buyoutValueRub,
    estimatedCapex: {
      fencingRub,
      wellDrillingRub,
      electricityConnectionRub,
      landPreparationRub,
      irrigationSystemRub,
      totalCapexRub,
    },
    eligibleSubsidies,
    estimatedAnnualRevenueRub,
    projectedPaybackYears,
  };
}
