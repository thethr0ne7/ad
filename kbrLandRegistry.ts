import { LandParcel } from '../types/land';
import { evaluateLegalStatus } from '../utils/legalEngine';
import { calculateEconomics } from '../utils/economics';

export const KBR_LAND_PARCELS: LandParcel[] = [
  // 1. Урванский район - Интенсивный сад / Ягодное производство (Нарткала)
  (() => {
    const areaHa = 36.5;
    const district = 'Урванский район';
    const purpose = 'orchard';
    const utilities = {
      hasRoadAccess: true,
      roadType: 'Асфальтированная' as const,
      distanceToHighwayKm: 0.8,
      highwayName: 'Автодорога Нарткала — Майский',
      hasElectricity: true,
      electricityDistanceM: 60,
      substationCapacityKva: 250,
      hasGas: true,
      gasDistanceM: 180,
      waterSource: 'Река/канал (открытый водозабор)' as const,
      distanceToWaterM: 120,
      reliefType: 'Равнинный' as const,
      elevationMeters: 305,
    };
    const agro = {
      soilType: 'Выщелоченный предкавказский чернозем тяжелосуглинистый',
      bonitetScore: 88,
      annualPrecipitationMm: 580,
      frostFreePeriodDays: 195,
      activeTempSum: 3250,
      recommendedCrops: [
        'Интенсивный яблоневый сад (М9)',
        'Черешня крупноплодная',
        'Слива венгерка',
        'Голубика высокорослая',
      ],
    };
    const legal = evaluateLegalStatus({
      category: 'Земли сельскохозяйственного назначения',
      permittedUseCode: '1.5',
      areaHa,
      ownership: 'Государственная (неразграниченная)',
      district,
      hasAuctionNotice: false,
      nearWaterBody: true,
      nearPowerLineOrGas: false,
      targetPurpose: purpose,
    });
    const economics = calculateEconomics({
      areaHa,
      district,
      purpose,
      utilities,
    });
    return {
      id: 'kbr-urvan-01',
      cadastralNumber: '07:07:1200000:148',
      name: 'Участок плодопитомника и шпалерного садоводства "Нарткала-Восток"',
      district,
      municipality: 'Городское поселение Нарткала',
      nearestSettlement: 'г. Нарткала (2.5 км)',
      areaHa,
      category: 'Земли сельскохозяйственного назначения' as const,
      permittedUseCode: '1.5',
      permittedUseTitle: 'Садоводство (закладка многолетних насаждений)',
      suitablePurposes: ['orchard', 'kfh', 'greenhouse'],
      ownership: 'Государственная (неразграниченная)' as const,
      coordinates: { lat: 43.5654, lng: 43.8542 },
      boundary: [
        { lat: 43.562, lng: 43.849 },
        { lat: 43.568, lng: 43.851 },
        { lat: 43.569, lng: 43.859 },
        { lat: 43.563, lng: 43.857 },
      ],
      neighboringPlots: [
        { cadastralNumber: '07:07:1200000:147', use: 'Сады яблони интенсивного типа' },
        { cadastralNumber: '07:07:1200000:149', use: 'Фруктохранилище с РГС' },
      ],
      sourceType: 'НСПД' as const,
      sourceExternalId: 'NSPD-KBR-0707-8821',
      sourceUrl: 'https://nspd.gov.ru/',
      discoveryDate: '2026-10-18',
      verificationStatus: 'verified_official_registry' as const,
      utilities,
      agro,
      legal,
      economics,
      history: [
        {
          id: 'hist-urv-1',
          date: '2026-10-18',
          action: 'Выявление свободного контура в Национальной системе пространственных данных (НСПД)',
          author: 'Оператор НСПД по КБР',
          documentNumber: 'КПТ № 07/07/2026-148',
          notes: 'Контур с/х назначения определен как неразграниченная государственная собственность, обременения третьих лиц отсутствуют',
        },
        {
          id: 'hist-urv-2',
          date: '2026-10-25',
          action: 'Кадастровая проверка и подтверждение ВРИ 1.5 (Садоводство)',
          author: 'Управление Росреестра по КБР',
          documentNumber: 'Выписка ЕГРН № 99/2026/071200-148',
          notes: 'Кадастровые границы установлены с нормативной погрешностью межевания',
        },
      ],
      tags: ['Без торгов', 'Садоводство', 'Высокий бонитет', 'Водозабор', 'Асфальт'],
    };
  })(),

  // 2. Чегемский район - КФХ и Агротуризм (Лечинкай / Чегемские водопады)
  (() => {
    const areaHa = 24.8;
    const district = 'Чегемский район';
    const purpose = 'agrotourism';
    const utilities = {
      hasRoadAccess: true,
      roadType: 'Грунтовая улучшенная (гравий)' as const,
      distanceToHighwayKm: 1.4,
      highwayName: 'Трасса Чегем — Чегемские водопады',
      hasElectricity: true,
      electricityDistanceM: 140,
      substationCapacityKva: 160,
      hasGas: false,
      gasDistanceM: 750,
      waterSource: 'Река/канал (открытый водозабор)' as const,
      distanceToWaterM: 80,
      reliefType: 'Предгорный (3-8°)' as const,
      elevationMeters: 620,
    };
    const agro = {
      soilType: 'Предкавказские темно-серые лесные и лугово-черноземные',
      bonitetScore: 79,
      annualPrecipitationMm: 640,
      frostFreePeriodDays: 180,
      activeTempSum: 3050,
      recommendedCrops: [
        'Горный яблоневый сад',
        'Малина ремонтантная',
        'Ежевика',
        'Пасека и медоносные травы',
      ],
    };
    const legal = evaluateLegalStatus({
      category: 'Земли сельскохозяйственного назначения',
      permittedUseCode: '1.20',
      areaHa,
      ownership: 'Муниципальная',
      district,
      hasAuctionNotice: false,
      nearWaterBody: true,
      nearPowerLineOrGas: false,
      targetPurpose: purpose,
    });
    const economics = calculateEconomics({
      areaHa,
      district,
      purpose,
      utilities,
    });
    return {
      id: 'kbr-chegem-02',
      cadastralNumber: '07:08:0600000:312',
      name: 'Участок агротуристического комплекса и эко-фермы "Чегемские террасы"',
      district,
      municipality: 'Сельское поселение Лечинкай',
      nearestSettlement: 'с. Лечинкай (1.8 км)',
      areaHa,
      category: 'Земли сельскохозяйственного назначения' as const,
      permittedUseCode: '1.20',
      permittedUseTitle: 'Сельский туризм (ФЗ-318) и садоводство',
      suitablePurposes: ['agrotourism', 'tourism_facility', 'orchard', 'kfh'],
      ownership: 'Муниципальная' as const,
      coordinates: { lat: 43.518, lng: 43.485 },
      boundary: [
        { lat: 43.514, lng: 43.481 },
        { lat: 43.522, lng: 43.483 },
        { lat: 43.521, lng: 43.491 },
        { lat: 43.515, lng: 43.489 },
      ],
      neighboringPlots: [
        { cadastralNumber: '07:08:0600000:310', use: 'Пастбища сенокосные' },
        { cadastralNumber: '07:08:0600000:311', use: 'Рекреационная зона ущелья' },
      ],
      sourceType: 'Муниципальный фонд' as const,
      sourceExternalId: 'MUN-CHEGEM-2026-091',
      sourceUrl: 'https://chegem.kbr.ru/',
      discoveryDate: '2026-10-22',
      verificationStatus: 'municipal_fund' as const,
      utilities,
      agro,
      legal,
      economics,
      history: [
        {
          id: 'hist-chg-1',
          date: '2026-10-22',
          action: 'Включение в муниципальный фонд перераспределения земель Чегемского района',
          author: 'Администрация Чегемского муниципального района КБР',
          documentNumber: 'Постановление № 312-П/2026',
          notes: 'Участок сформирован для предоставления под агротуризм и КФХ по ФЗ-318 и ст. 39.18 ЗК РФ',
        },
      ],
      tags: ['Агротуризм', 'ФЗ-318', 'Грант 10 млн', 'Горный пейзаж', 'Река Чегем'],
    };
  })(),

  // 3. Прохладненский район - Орошаемое растениеводство и Тепличное хозяйство (Карагач)
  (() => {
    const areaHa = 84.0;
    const district = 'Прохладненский район';
    const purpose = 'greenhouse';
    const utilities = {
      hasRoadAccess: true,
      roadType: 'Асфальтированная' as const,
      distanceToHighwayKm: 0.5,
      highwayName: 'Автодорога Прохладный — Баксан',
      hasElectricity: true,
      electricityDistanceM: 90,
      substationCapacityKva: 630,
      hasGas: true,
      gasDistanceM: 110,
      waterSource: 'Мелиоративный канал' as const,
      distanceToWaterM: 40,
      reliefType: 'Равнинный' as const,
      elevationMeters: 195,
    };
    const agro = {
      soilType: 'Обыкновенный предкавказский чернозем карбонатный',
      bonitetScore: 94,
      annualPrecipitationMm: 460,
      frostFreePeriodDays: 205,
      activeTempSum: 3500,
      recommendedCrops: [
        'Тепличный комплекс (томаты, огурцы)',
        'Кукуруза на зерно и семена',
        'Подсолнечник кондитерский',
        'Овощеводство открытого грунта (лук, морковь)',
      ],
    };
    const legal = evaluateLegalStatus({
      category: 'Земли сельскохозяйственного назначения',
      permittedUseCode: '1.3',
      areaHa,
      ownership: 'Государственная (неразграниченная)',
      district,
      hasAuctionNotice: false,
      nearWaterBody: true,
      nearPowerLineOrGas: true,
      targetPurpose: purpose,
    });
    const economics = calculateEconomics({
      areaHa,
      district,
      purpose,
      utilities,
    });
    return {
      id: 'kbr-prokhlad-03',
      cadastralNumber: '07:04:0900000:542',
      name: 'Массив орошаемых земель фонда перераспределения "Малка-Агро"',
      district,
      municipality: 'Сельское поселение Карагач',
      nearestSettlement: 'с. Карагач (1.2 км)',
      areaHa,
      category: 'Земли сельскохозяйственного назначения' as const,
      permittedUseCode: '1.3',
      permittedUseTitle: 'Овощеводство и закрытый грунт',
      suitablePurposes: ['greenhouse', 'kfh', 'orchard'],
      ownership: 'Государственная (неразграниченная)' as const,
      coordinates: { lat: 43.782, lng: 43.824 },
      boundary: [
        { lat: 43.776, lng: 43.818 },
        { lat: 43.788, lng: 43.821 },
        { lat: 43.787, lng: 43.832 },
        { lat: 43.777, lng: 43.829 },
      ],
      neighboringPlots: [
        { cadastralNumber: '07:04:0900000:540', use: 'Орошаемые посевы сои' },
        { cadastralNumber: '07:04:0900000:541', use: 'Овощеводческое хозяйство' },
      ],
      sourceType: 'Росреестр (ЕГРН)' as const,
      sourceExternalId: 'EGRN-0704-55109',
      sourceUrl: 'https://pkk.rosreestr.ru/',
      discoveryDate: '2026-10-15',
      verificationStatus: 'verified_official_registry' as const,
      utilities,
      agro,
      legal,
      economics,
      history: [
        {
          id: 'hist-prk-1',
          date: '2026-10-15',
          action: 'Синхронизация сведений ЕГРН и мелиоративной системы КБР',
          author: 'ФГБУ "Управление Каббалкмелиоводхоз"',
          documentNumber: 'Акт гидротехнического обследования № 88',
          notes: 'Подтверждено подключение к оросительному каналу Малка с гарантированным дебитом воды',
        },
      ],
      tags: ['84 га', 'Чернозем 94 балла', 'Оросительный канал', 'Газификация', 'ТП 630 кВА'],
    };
  })(),

  // 4. Черекский район - Садоводство и Агротуризм (Аушигер / Кашхатау)
  (() => {
    const areaHa = 18.2;
    const district = 'Черекский район';
    const purpose = 'agrotourism';
    const utilities = {
      hasRoadAccess: true,
      roadType: 'Асфальтированная' as const,
      distanceToHighwayKm: 0.3,
      highwayName: 'Автодорога Нальчик — Кашхатау — Голубые Озера',
      hasElectricity: true,
      electricityDistanceM: 80,
      substationCapacityKva: 160,
      hasGas: true,
      gasDistanceM: 250,
      waterSource: 'Артезианская скважина (требует бурения)' as const,
      distanceToWaterM: 200,
      reliefType: 'Предгорный (3-8°)' as const,
      elevationMeters: 580,
    };
    const agro = {
      soilType: 'Горно-луговые и темно-серые карбонатные почвы',
      bonitetScore: 81,
      annualPrecipitationMm: 720,
      frostFreePeriodDays: 185,
      activeTempSum: 3100,
      recommendedCrops: [
        'Горный яблоневый и грушевый сад',
        'Клубника и малина на мульче',
        'Лавандовая ферма',
        'Эко-пасека',
      ],
    };
    const legal = evaluateLegalStatus({
      category: 'Земли сельскохозяйственного назначения',
      permittedUseCode: '1.20',
      areaHa,
      ownership: 'Республиканская (Кабардино-Балкарская Республика)',
      district,
      hasAuctionNotice: false,
      nearWaterBody: false,
      nearPowerLineOrGas: false,
      targetPurpose: purpose,
    });
    const economics = calculateEconomics({
      areaHa,
      district,
      purpose,
      utilities,
    });
    return {
      id: 'kbr-cherek-04',
      cadastralNumber: '07:06:0400000:218',
      name: 'Участок агропарка у термальных источников "Аушигерские сады"',
      district,
      municipality: 'Сельское поселение Аушигер',
      nearestSettlement: 'с. Аушигер (1.5 км)',
      areaHa,
      category: 'Земли сельскохозяйственного назначения' as const,
      permittedUseCode: '1.20',
      permittedUseTitle: 'Сельский туризм и садоводство',
      suitablePurposes: ['agrotourism', 'orchard', 'kfh'],
      ownership: 'Республиканская (Кабардино-Балкарская Республика)' as const,
      coordinates: { lat: 43.376, lng: 43.715 },
      boundary: [
        { lat: 43.372, lng: 43.711 },
        { lat: 43.379, lng: 43.713 },
        { lat: 43.378, lng: 43.721 },
        { lat: 43.373, lng: 43.719 },
      ],
      neighboringPlots: [
        { cadastralNumber: '07:06:0400000:217', use: 'Санаторно-оздоровительная зона' },
        { cadastralNumber: '07:06:0400000:219', use: 'Сады фундука' },
      ],
      sourceType: 'Минземимущество КБР' as const,
      sourceExternalId: 'MZIO-KBR-2026-118',
      sourceUrl: 'https://pravitelstvo.kbr.ru/oiv/mzio/',
      discoveryDate: '2026-10-25',
      verificationStatus: 'verified_official_registry' as const,
      utilities,
      agro,
      legal,
      economics,
      history: [
        {
          id: 'hist-chr-1',
          date: '2026-10-25',
          action: 'Включение в реестр государственного имущества КБР для инвестпроектов',
          author: 'Минземимущество КБР',
          documentNumber: 'Распоряжение МЗИО № 442-р',
          notes: 'Согласовано под туристско-рекреационное и агротуристическое развитие по Закону КБР № 33-РЗ',
        },
      ],
      tags: ['Аушигер', 'Термальные источники', 'Республиканская собственность', 'Туризм'],
    };
  })(),

  // 5. Нальчик (Агломерация / Кенже) - Интенсивное пригородное хозяйство / Садоводство
  (() => {
    const areaHa = 14.5;
    const district = 'Нальчик';
    const purpose = 'orchard';
    const utilities = {
      hasRoadAccess: true,
      roadType: 'Асфальтированная' as const,
      distanceToHighwayKm: 0.2,
      highwayName: 'Улица Каменская — объездная г. Нальчик',
      hasElectricity: true,
      electricityDistanceM: 30,
      substationCapacityKva: 400,
      hasGas: true,
      gasDistanceM: 80,
      waterSource: 'Централизованный водовод' as const,
      distanceToWaterM: 50,
      reliefType: 'Слабопокатый (1-3°)' as const,
      elevationMeters: 510,
    };
    const agro = {
      soilType: 'Серые лесные остепненные тяжелосуглинистые почвы',
      bonitetScore: 84,
      annualPrecipitationMm: 620,
      frostFreePeriodDays: 190,
      activeTempSum: 3200,
      recommendedCrops: [
        'Интенсивная черешня под пленкой (Voen)',
        'Яблоневый шпалерный сад',
        'Земляника садовая в туннелях',
      ],
    };
    const legal = evaluateLegalStatus({
      category: 'Земли населенных пунктов',
      permittedUseCode: '1.5',
      areaHa,
      ownership: 'Муниципальная',
      district,
      hasAuctionNotice: false,
      nearWaterBody: false,
      nearPowerLineOrGas: false,
      targetPurpose: purpose,
    });
    const economics = calculateEconomics({
      areaHa,
      district,
      purpose,
      utilities,
    });
    return {
      id: 'kbr-nalchik-05',
      cadastralNumber: '07:09:0102000:489',
      name: 'Пригородный агроучасток "Кенже-Юг"',
      district,
      municipality: 'Городской округ Нальчик',
      nearestSettlement: 'г. Нальчик / с. Кенже (0.5 км)',
      areaHa,
      category: 'Земли населенных пунктов' as const,
      permittedUseCode: '1.5',
      permittedUseTitle: 'Садоводство и питомниководство',
      suitablePurposes: ['orchard', 'kfh', 'greenhouse'],
      ownership: 'Муниципальная' as const,
      coordinates: { lat: 43.498, lng: 43.565 },
      boundary: [
        { lat: 43.495, lng: 43.561 },
        { lat: 43.501, lng: 43.563 },
        { lat: 43.500, lng: 43.571 },
        { lat: 43.496, lng: 43.569 },
      ],
      neighboringPlots: [
        { cadastralNumber: '07:09:0102000:488', use: 'Опытное поле аграрного университета' },
        { cadastralNumber: '07:09:0102000:490', use: 'Складской комплекс' },
      ],
      sourceType: 'Муниципальный фонд' as const,
      sourceExternalId: 'MUN-NALCHIK-2026-44',
      sourceUrl: 'https://nalchik.kbr.ru/',
      discoveryDate: '2026-10-28',
      verificationStatus: 'municipal_fund' as const,
      utilities,
      agro,
      legal,
      economics,
      history: [
        {
          id: 'hist-nal-1',
          date: '2026-10-28',
          action: 'Выписка из реестра муниципальных земель г.о. Нальчик',
          author: 'Департамент городского имущества Нальчика',
          documentNumber: 'Выписка № ДГИ-2026/81',
          notes: 'Разрешено использование для сельскохозяйственного производства в черте населенного пункта',
        },
      ],
      tags: ['Нальчик', 'Черта города', 'Все коммуникации', 'Центральный водовод'],
    };
  })(),

  // 6. Баксанский район - КФХ и Зерновые / Садоводство (Исламей) - Аукцион на ГИС Торги
  (() => {
    const areaHa = 62.0;
    const district = 'Баксанский район';
    const purpose = 'kfh';
    const utilities = {
      hasRoadAccess: true,
      roadType: 'Асфальтированная' as const,
      distanceToHighwayKm: 0.9,
      highwayName: 'Федеральная трасса А-158 Прохладный — Баксан — Эльбрус',
      hasElectricity: true,
      electricityDistanceM: 110,
      substationCapacityKva: 250,
      hasGas: true,
      gasDistanceM: 320,
      waterSource: 'Река/канал (открытый водозабор)' as const,
      distanceToWaterM: 180,
      reliefType: 'Слабопокатый (1-3°)' as const,
      elevationMeters: 460,
    };
    const agro = {
      soilType: 'Предкавказский карбонатный выщелоченный чернозем',
      bonitetScore: 86,
      annualPrecipitationMm: 550,
      frostFreePeriodDays: 195,
      activeTempSum: 3300,
      recommendedCrops: [
        'Кукуруза гибридная на поливе',
        'Подсолнечник кондитерский',
        'Сливовый сад интенсивный',
        'Пшеница озимая элитных сортов',
      ],
    };
    const legal = evaluateLegalStatus({
      category: 'Земли сельскохозяйственного назначения',
      permittedUseCode: '1.1',
      areaHa,
      ownership: 'Муниципальная',
      district,
      hasAuctionNotice: true, // Идут открытые торги
      nearWaterBody: true,
      nearPowerLineOrGas: false,
      targetPurpose: purpose,
    });
    const economics = calculateEconomics({
      areaHa,
      district,
      purpose,
      utilities,
    });
    legal.auctionNoticeNumber = '21000004520000000412';
    legal.auctionPublicationDate = '2026-10-20';
    legal.auctionBiddingDeadline = '2026-11-28';

    return {
      id: 'kbr-baksan-06',
      cadastralNumber: '07:01:1400000:781',
      name: 'Участок сельхозугодий на открытом аукционе "Баксанская долина"',
      district,
      municipality: 'Сельское поселение Исламей',
      nearestSettlement: 'с. Исламей (2.1 км)',
      areaHa,
      category: 'Земли сельскохозяйственного назначения' as const,
      permittedUseCode: '1.1',
      permittedUseTitle: 'Растениеводство (полеводство и кормопроизводство)',
      suitablePurposes: ['kfh', 'orchard'],
      ownership: 'Муниципальная' as const,
      coordinates: { lat: 43.645, lng: 43.468 },
      boundary: [
        { lat: 43.641, lng: 43.462 },
        { lat: 43.651, lng: 43.465 },
        { lat: 43.649, lng: 43.476 },
        { lat: 43.642, lng: 43.473 },
      ],
      neighboringPlots: [
        { cadastralNumber: '07:01:1400000:780', use: 'Зерновые посевы КФХ' },
        { cadastralNumber: '07:01:1400000:782', use: 'Сады черешни' },
      ],
      sourceType: 'ГИС Торги' as const,
      sourceExternalId: 'TORGI-LOT-2100000452',
      sourceUrl: 'https://torgi.gov.ru/new/public/lots/lot/21000004520000000412',
      discoveryDate: '2026-10-20',
      verificationStatus: 'published_torgi' as const,
      utilities,
      agro,
      legal,
      economics,
      history: [
        {
          id: 'hist-bak-1',
          date: '2026-10-20',
          action: 'Публикация извещения о проведении аукциона на ГИС Торги',
          author: 'Комитет по управлению имуществом Баксанского района',
          documentNumber: 'Лот № 21000004520000000412',
          notes: 'Официальный аукцион в электронной форме в соответствии со ст. 39.11-39.13 ЗК РФ',
        },
      ],
      tags: ['ГИС Торги', 'Аукцион', '62 га', 'Баксан', 'Трасса А-158'],
    };
  })(),

  // 7. Зольский район - Садоводство и Пастбища КФХ (Сармаково)
  (() => {
    const areaHa = 48.0;
    const district = 'Зольский район';
    const purpose = 'kfh';
    const utilities = {
      hasRoadAccess: true,
      roadType: 'Грунтовая улучшенная (гравий)' as const,
      distanceToHighwayKm: 2.1,
      highwayName: 'Автодорога Залукокоаже — Сармаково',
      hasElectricity: true,
      electricityDistanceM: 180,
      substationCapacityKva: 160,
      hasGas: false,
      gasDistanceM: 950,
      waterSource: 'Артезианская скважина (требует бурения)' as const,
      distanceToWaterM: 350,
      reliefType: 'Предгорный (3-8°)' as const,
      elevationMeters: 740,
    };
    const agro = {
      soilType: 'Горно-луговые черноземовидные и серые лесные',
      bonitetScore: 82,
      annualPrecipitationMm: 680,
      frostFreePeriodDays: 175,
      activeTempSum: 2950,
      recommendedCrops: [
        'Горное садоводство (поздние сорта яблок: Айдаред, Флорина)',
        'Ягодники (черная смородина, малина)',
        'Многолетние бобовые травы (люцерна, клевер)',
      ],
    };
    const legal = evaluateLegalStatus({
      category: 'Земли сельскохозяйственного назначения',
      permittedUseCode: '1.18',
      areaHa,
      ownership: 'Государственная (неразграниченная)',
      district,
      hasAuctionNotice: false,
      nearWaterBody: false,
      nearPowerLineOrGas: false,
      targetPurpose: purpose,
    });
    const economics = calculateEconomics({
      areaHa,
      district,
      purpose,
      utilities,
    });
    return {
      id: 'kbr-zolka-07',
      cadastralNumber: '07:02:0800000:194',
      name: 'Участок предгорного животноводства и кормопроизводства "Зольские луга"',
      district,
      municipality: 'Сельское поселение Сармаково',
      nearestSettlement: 'с. Сармаково (2.8 км)',
      areaHa,
      category: 'Земли сельскохозяйственного назначения' as const,
      permittedUseCode: '1.18',
      permittedUseTitle: 'Сенокошение и выпас скота (животноводство КФХ)',
      suitablePurposes: ['kfh', 'orchard'],
      ownership: 'Государственная (неразграниченная)' as const,
      coordinates: { lat: 43.712, lng: 43.195 },
      boundary: [
        { lat: 43.708, lng: 43.191 },
        { lat: 43.717, lng: 43.193 },
        { lat: 43.715, lng: 43.203 },
        { lat: 43.709, lng: 43.201 },
      ],
      neighboringPlots: [
        { cadastralNumber: '07:02:0800000:193', use: 'Ферма молочного КРС' },
        { cadastralNumber: '07:02:0800000:195', use: 'Пастбища сенокосные' },
      ],
      sourceType: 'НСПД' as const,
      sourceExternalId: 'NSPD-KBR-0702-4109',
      sourceUrl: 'https://nspd.gov.ru/',
      discoveryDate: '2026-10-12',
      verificationStatus: 'unallocated_contour' as const,
      utilities,
      agro,
      legal,
      economics,
      history: [
        {
          id: 'hist-zlk-1',
          date: '2026-10-12',
          action: 'Выявление свободного земельного массива в НСПД РФ',
          author: 'Земельная палата Зольского района',
          documentNumber: 'Картографический план контура № 4109',
          notes: 'Земли не обременены правами третьих лиц, подходят для предоставления главе КФХ',
        },
      ],
      tags: ['48 га', 'Без торгов', 'Предгорье', 'КФХ Животноводство', 'Эко-зона'],
    };
  })(),

  // 8. Чегемский район - Садоводство (Чегем-2)
  (() => {
    const areaHa = 42.0;
    const district = 'Чегемский район';
    const purpose = 'orchard';
    const utilities = {
      hasRoadAccess: true,
      roadType: 'Асфальтированная' as const,
      distanceToHighwayKm: 0.6,
      highwayName: 'Автодорога Чегем — Нальчик',
      hasElectricity: true,
      electricityDistanceM: 50,
      substationCapacityKva: 250,
      hasGas: true,
      gasDistanceM: 140,
      waterSource: 'Река/канал (открытый водозабор)' as const,
      distanceToWaterM: 90,
      reliefType: 'Равнинный' as const,
      elevationMeters: 450,
    };
    const agro = {
      soilType: 'Выщелоченный мощный чернозем',
      bonitetScore: 89,
      annualPrecipitationMm: 610,
      frostFreePeriodDays: 190,
      activeTempSum: 3200,
      recommendedCrops: [
        'Интенсивный яблоневый сад на шпалере',
        'Черешневый сад',
        'Сливовый сад',
      ],
    };
    const legal = evaluateLegalStatus({
      category: 'Земли сельскохозяйственного назначения',
      permittedUseCode: '1.5',
      areaHa,
      ownership: 'Государственная (неразграниченная)',
      district,
      hasAuctionNotice: false,
      nearWaterBody: true,
      nearPowerLineOrGas: false,
      targetPurpose: purpose,
    });
    const economics = calculateEconomics({
      areaHa,
      district,
      purpose,
      utilities,
    });
    return {
      id: 'kbr-chegem2-08',
      cadastralNumber: '07:08:0300000:618',
      name: 'Участок интенсивного садоводства "Чегемская долина"',
      district,
      municipality: 'Сельское поселение Чегем Второй',
      nearestSettlement: 'с. Чегем Второй (1.5 км)',
      areaHa,
      category: 'Земли сельскохозяйственного назначения' as const,
      permittedUseCode: '1.5',
      permittedUseTitle: 'Садоводство',
      suitablePurposes: ['orchard', 'kfh', 'greenhouse'],
      ownership: 'Государственная (неразграниченная)' as const,
      coordinates: { lat: 43.582, lng: 43.589 },
      boundary: [
        { lat: 43.578, lng: 43.584 },
        { lat: 43.587, lng: 43.587 },
        { lat: 43.585, lng: 43.596 },
        { lat: 43.579, lng: 43.594 },
      ],
      neighboringPlots: [
        { cadastralNumber: '07:08:0300000:617', use: 'Интенсивные сады КФХ' },
        { cadastralNumber: '07:08:0300000:619', use: 'Холодильник плодохранилища' },
      ],
      sourceType: 'Росреестр (ЕГРН)' as const,
      sourceExternalId: 'EGRN-0708-98441',
      sourceUrl: 'https://pkk.rosreestr.ru/',
      discoveryDate: '2026-10-24',
      verificationStatus: 'verified_official_registry' as const,
      utilities,
      agro,
      legal,
      economics,
      history: [
        {
          id: 'hist-chg2-1',
          date: '2026-10-24',
          action: 'Официальная выписка ЕГРН об основных характеристиках объекта',
          author: 'Управление Росреестра по КБР',
          documentNumber: 'КУВИ-002/2026-98441',
          notes: 'Категория: Земли с/х назначения. Особые отметки и запреты отсутствуют.',
        },
      ],
      tags: ['Без торгов', 'Садоводство', 'Чернозем 89 б', 'Субсидия 11.7 млн'],
    };
  })(),
];
