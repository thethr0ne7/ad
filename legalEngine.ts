import { LandCategory, OwnershipType, LegalAnalysisResult } from '../types/land';

export interface LegalInput {
  category: LandCategory;
  permittedUseCode: string;
  areaHa: number;
  ownership: OwnershipType;
  district: string;
  hasAuctionNotice: boolean;
  nearWaterBody: boolean;
  nearPowerLineOrGas: boolean;
  targetPurpose: string;
  sourceType?: string;
}

/**
 * Deterministic legal assessment engine evaluating Russian Land Code (ЗК РФ),
 * Federal Law 101-FZ, Federal Law 318-FZ, and KBR Republic Law 33-RZ.
 */
export function evaluateLegalStatus(input: LegalInput): LegalAnalysisResult {
  const isAgro = input.category === 'Земли сельскохозяйственного назначения';
  const isStateOrMunicipal =
    input.ownership === 'Государственная (неразграниченная)' ||
    input.ownership === 'Республиканская (Кабардино-Балкарская Республика)' ||
    input.ownership === 'Муниципальная';

  // Check direct lease eligibility under Article 39.18 of Russian Land Code (ЗК РФ)
  const isEligibleDirectLease =
    isStateOrMunicipal &&
    isAgro &&
    !input.hasAuctionNotice &&
    input.areaHa <= 100 &&
    (input.targetPurpose === 'kfh' ||
      input.targetPurpose === 'orchard' ||
      input.targetPurpose === 'greenhouse' ||
      input.targetPurpose === 'agrotourism');

  const applicableLaws = [
    {
      law: 'Земельный кодекс Российской Федерации (ЗК РФ)',
      article: 'Статья 39.18',
      summary:
        'Особенности предоставления земельных участков, находящихся в государственной или муниципальной собственности, гражданам для индивидуального жилищного строительства, ведения личного подсобного хозяйства, гражданам и крестьянским (фермерским) хозяйствам для осуществления крестьянским (фермерским) хозяйством его деятельности.',
      linkUrl: 'https://www.consultant.ru/document/cons_doc_LAW_33773/5fd52f829f0c2a86c67ef64f33100ca412e6bf54/',
      isVerifiedFact: true,
    },
    {
      law: 'Земельный кодекс Российской Федерации (ЗК РФ)',
      article: 'Статья 39.6, п. 2, пп. 12',
      summary:
        'Договор аренды земельного участка, находящегося в государственной или муниципальной собственности, заключается без проведения торгов в случае предоставления земельного участка крестьянскому (фермерскому) хозяйству или сельскохозяйственной организации в случаях, установленных Федеральным законом "Об обороте земель сельскохозяйственного назначения".',
      linkUrl: 'https://www.consultant.ru/document/cons_doc_LAW_33773/25ee65eebff30dd821be0d53c3e80c44c59fe51f/',
      isVerifiedFact: true,
    },
    {
      law: 'Федеральный закон № 101-ФЗ',
      article: 'Статья 10, п. 5.1',
      summary:
        'Земельные участки из земель сельскохозяйственного назначения, находящиеся в государственной или муниципальной собственности, могут передаваться гражданам и крестьянским (фермерским) хозяйствам в аренду на срок до пяти лет без проведения торгов.',
      linkUrl: 'https://www.consultant.ru/document/cons_doc_LAW_37816/',
      isVerifiedFact: true,
    },
    {
      law: 'Закон Кабардино-Балкарской Республики № 33-РЗ',
      article: 'Статьи 4, 8, 11',
      summary:
        'Об обороте земель сельскохозяйственного назначения в КБР. Устанавливает предельные минимальные и максимальные размеры участков сельхозназначения, особенности предоставления в аренду и сохранение ценных угодий.',
      linkUrl: 'https://pravitelstvo.kbr.ru/',
      isVerifiedFact: true,
    },
  ];

  if (input.targetPurpose === 'agrotourism' || input.targetPurpose === 'tourism_facility') {
    applicableLaws.push({
      law: 'Федеральный закон № 318-ФЗ',
      article: 'Статья 2',
      summary:
        'О внесении изменений в Федеральный закон "Об основах туристской деятельности в РФ" и статью 77 Земельного кодекса РФ: разрешено размещение некапитальных средств размещения и объектов сельского туризма на землях с/х назначения.',
      linkUrl: 'https://www.consultant.ru/document/cons_doc_LAW_389278/',
      isVerifiedFact: true,
    });
  }

  // Restrictions and encumbrances analysis
  const restrictions: LegalAnalysisResult['restrictionsAndEncumbrances'] = [];

  if (input.nearWaterBody) {
    restrictions.push({
      type: 'Водоохранная зона (ст. 65 Водного кодекса РФ)',
      description:
        'Ширина водоохранной зоны реки/канала составляет от 50 до 200 метров. Запрещено размещение складов ГСМ, применение ядохимикатов авиаметодом, сброс сточных вод.',
      severity: 'medium',
      isBlocking: false,
      statutoryBasis: 'Водный кодекс РФ, статья 65',
    });
  }

  if (input.nearPowerLineOrGas) {
    restrictions.push({
      type: 'Охранная зона линейных объектов (ЛЭП / Газопровод)',
      description:
        'Ограничения на капитальное строительство в полосе 10–25 м от оси ЛЭП или магистрального газопровода. Сельскохозяйственная обработка почвы и выпас скота разрешены.',
      severity: 'low',
      isBlocking: false,
      statutoryBasis: 'Постановление Правительства РФ № 160 (ЛЭП) и № 878 (газораспределительные сети)',
    });
  }

  // Check general KBR limitations (33-RZ: prohibition of alienation of particularly valuable agricultural lands)
  restrictions.push({
    type: 'Особо ценные продуктивные сельхозугодья (Закон КБР № 33-РЗ)',
    description:
      'Сельхозугодия подлежат особой охране. Изменение ВРИ на несельскохозяйственный запрещено. Разрешено целевое ведение фермерского хозяйства, садоводства и овощеводства.',
    severity: 'low',
    isBlocking: false,
    statutoryBasis: 'Закон КБР № 33-РЗ «Об обороте земель с/х назначения в КБР»',
  });

  // Action plan
  const stepByStepActionPlan = [
    {
      stepNumber: 1,
      title: 'Подготовка схемы расположения ЗУ на кадастровом плане территории (КПТ)',
      authority: 'Кадастровый инженер (аттестованный специалист)',
      timeframeDays: 14,
      legalBasis: 'Статья 11.10 ЗК РФ, приказ Росреестра № П/0148',
      details:
        'Формирование электронного документа в формате XML и схемы в масштабе 1:5000 с привязкой к государственной геодезической сети.',
    },
    {
      stepNumber: 2,
      title: 'Подача заявления о предварительном согласовании предоставления ЗУ',
      authority: `Администрация ${input.district} / Министерство земельных и имущественных отношений КБР`,
      timeframeDays: 20,
      legalBasis: 'Статья 39.15 ЗК РФ',
      details:
        'Подача через Госуслуги или МФЦ КБР с приложением проекта развития КФХ и схемы расположения ЗУ.',
    },
    {
      stepNumber: 3,
      title: 'Публикация извещения о предоставлении земельного участка для КФХ',
      authority: 'Орган местного самоуправления / ГИС Торги (torgi.gov.ru)',
      timeframeDays: 30,
      legalBasis: 'Статья 39.18 ЗК РФ, пункт 2',
      details:
        'Официальная публикация на официальном сайте и на портале ГИС Торги на срок 30 календарных дней для выявления иных претендентов.',
    },
    {
      stepNumber: 4,
      title: 'Принятие решения о предоставлении (без торгов или аукцион)',
      authority: `Администрация ${input.district}`,
      timeframeDays: 10,
      legalBasis: isEligibleDirectLease ? 'Статья 39.18 ЗК РФ, п. 5' : 'Статьи 39.11 - 39.13 ЗК РФ',
      details: isEligibleDirectLease
        ? 'Если в течение 30 дней заявлений от других КФХ не поступило — уполномоченный орган издает распоряжение о предоставлении ЗУ в аренду без проведения торгов.'
        : 'При поступлении конкурирующих заявок организуется открытый аукцион в электронной форме на ГИС Торги.',
    },
    {
      stepNumber: 5,
      title: 'Кадастровый учет и заключение договора аренды',
      authority: 'Управление Росреестра по КБР / Администрация района',
      timeframeDays: 12,
      legalBasis: 'ФЗ № 218-ФЗ "О государственной регистрации недвижимости"',
      details:
        'Присвоение кадастрового номера, подписание договора аренды на срок от 3 до 49 лет и государственная регистрация обременения в ЕГРН.',
    },
  ];

  const requiredDocuments = [
    {
      name: 'Заявление о предварительном согласовании предоставления земельного участка',
      isMandatory: true,
      description: 'Установленная форма по ст. 39.15 ЗК РФ с указанием основания: ст. 39.18 ЗК РФ (для КФХ).',
      templateAvailable: true,
    },
    {
      name: 'Схема расположения земельного участка на КПТ',
      isMandatory: true,
      description: 'В электронном виде с ЭЦП кадастрового инженера и в графическом виде.',
      templateAvailable: true,
    },
    {
      name: 'Выписка из ЕГРИП о регистрации в качестве главы КФХ или индивидуального предпринимателя',
      isMandatory: true,
      description: 'Коды ОКВЭД 01.11, 01.13, 01.24 (садоводство) или 01.25 (ягодоводство).',
      templateAvailable: true,
    },
    {
      name: 'Обоснование потребности в испрашиваемой площади земельного участка',
      isMandatory: true,
      description:
        'Краткое технико-экономическое обоснование (бизнес-план) посадки сада, теплиц или КФХ с расчетом потребности в гектарах.',
      templateAvailable: true,
    },
    {
      name: 'Копия документа, удостоверяющего личность заявителя (паспорт гражданина РФ)',
      isMandatory: true,
      description: 'С отметкой о постоянной регистрации.',
      templateAvailable: false,
    },
  ];

  const verificationSource = input.hasAuctionNotice
    ? ('ГИС Торги (официальный лот)' as const)
    : input.sourceType === 'НСПД'
    ? ('НСПД (свободный контур)' as const)
    : input.sourceType === 'Минземимущество КБР'
    ? ('Минземимущество КБР' as const)
    : ('Росреестр (ЕГРН КПТ)' as const);

  return {
    isEligibleDirectLeaseWithoutAuction: isEligibleDirectLease,
    directLeaseArticle: 'ст. 39.18 ЗК РФ + пп. 12 п. 2 ст. 39.6 ЗК РФ',
    requiresTerritorySchemeKPT: true,
    hasAuctionNoticePublished: input.hasAuctionNotice,
    verificationSource,
    applicableLaws,
    restrictionsAndEncumbrances: restrictions,
    stepByStepActionPlan,
    requiredDocuments,
  };
}
