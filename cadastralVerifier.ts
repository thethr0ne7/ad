import { CadastralVerificationResult, LandParcel } from '../types/land';
import { KBR_LAND_PARCELS } from '../data/kbrLandRegistry';

const KBR_DISTRICT_CODES: Record<string, string> = {
  '01': 'Баксанский район',
  '02': 'Зольский район',
  '03': 'Лескенский район',
  '04': 'Прохладненский район',
  '05': 'Майский район',
  '06': 'Черекский район',
  '07': 'Урванский район',
  '08': 'Чегемский район',
  '09': 'г.о. Нальчик',
  '10': 'Эльбрусский район',
};

/**
 * Validates and verifies an official Russian cadastral number (Росреестр format: 07:XX:XXXXXXX:XXXX)
 * and generates direct links to official state registries.
 */
export function verifyCadastralNumber(inputNumber: string): CadastralVerificationResult {
  const cleanNumber = inputNumber.trim().replace(/\s+/g, '');
  // Standard format: AA:BB:CCCCCCC:DDDD or AA:BB:CCCCCCC:DDD
  const cadastralRegex = /^(\d{2}):(\d{2}):(\d{6,7}):(\d{1,6})$/;
  const match = cleanNumber.match(cadastralRegex);

  if (!match) {
    return {
      isValidCadastralFormat: false,
      cadastralNumber: cleanNumber,
      regionCode: '',
      regionName: '',
      districtCode: '',
      districtName: '',
      quarterCode: '',
      isRegisteredInKbrRegistry: false,
      directLinks: {
        rosreestrPkkUrl: 'https://pkk.rosreestr.ru/',
        nspdUrl: 'https://nspd.gov.ru/',
        gisTorgiUrl: 'https://torgi.gov.ru/',
        egrnPortalUrl: 'https://rosreestr.gov.ru/',
      },
      legalAnalysisSummary:
        'Некорректный формат кадастрового номера. Официальный номер Росреестра состоит из 4 блоков: Округ:Район:Квартал:Участок (например, 07:07:1200000:148).',
    };
  }

  const [, regionCode, districtCode, quarterCode] = match;
  const isKbr = regionCode === '07';
  const regionName = isKbr
    ? 'Кабардино-Балкарская Республика'
    : `Субъект РФ (код ${regionCode})`;
  const districtName = isKbr
    ? KBR_DISTRICT_CODES[districtCode] || `Район код ${districtCode} КБР`
    : `Район код ${districtCode}`;

  // Check matching in the local unallocated state/municipal land registry
  const matchedParcel = KBR_LAND_PARCELS.find(
    (p) => p.cadastralNumber === cleanNumber
  );

  const rosreestrPkkUrl = `https://pkk.rosreestr.ru/#/search/${encodeURIComponent(cleanNumber)}`;
  const nspdUrl = `https://nspd.gov.ru/map?query=${encodeURIComponent(cleanNumber)}`;
  const gisTorgiUrl = `https://torgi.gov.ru/new/public/lots/reg?searchString=${encodeURIComponent(cleanNumber)}`;
  const egrnPortalUrl = `https://rosreestr.gov.ru/wps/portal/online_request?cad_num=${encodeURIComponent(cleanNumber)}`;

  let legalAnalysisSummary = '';
  if (matchedParcel) {
    legalAnalysisSummary = matchedParcel.legal.isEligibleDirectLeaseWithoutAuction
      ? `Участок включен в муниципальный фонд перераспределения земель ${matchedParcel.district}. Доступен для предоставления в аренду главе КФХ БЕЗ проведения торгов на основании ст. 39.18 ЗК РФ и 101-ФЗ.`
      : matchedParcel.legal.hasAuctionNoticePublished
      ? `По данному участку опубликовано извещение об аукционе на ГИС Торги (Лот № ${matchedParcel.legal.auctionNoticeNumber}). Предоставление осуществляется по ст. 39.11-39.13 ЗК РФ.`
      : `Участок находится в государственной/муниципальной собственности. Основание: аренда или инвестиционный проект КБР.`;
  } else if (isKbr) {
    legalAnalysisSummary = `Кадастровый номер относится к Кабардино-Балкарии (${districtName}). Участок подлежит правовой проверке через прямое обращение к ЕГРН и муниципальному фонду перераспределения земель.`;
  } else {
    legalAnalysisSummary = `Участок относится к региону ${regionCode}. Настоящая система специализирована на земельных ресурсах Кабардино-Балкарской Республики (код 07).`;
  }

  return {
    isValidCadastralFormat: true,
    cadastralNumber: cleanNumber,
    regionCode,
    regionName,
    districtCode,
    districtName,
    quarterCode,
    isRegisteredInKbrRegistry: Boolean(matchedParcel),
    matchedParcel,
    directLinks: {
      rosreestrPkkUrl,
      nspdUrl,
      gisTorgiUrl,
      egrnPortalUrl,
    },
    legalAnalysisSummary,
  };
}
