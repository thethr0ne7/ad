import { CadastralVerificationResult, LandParcel } from './land';
import { KBR_LAND_PARCELS } from './kbrLandRegistry';

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

  // This function validates the number syntax only, not EGRN registration or rights.
  // A match in bundled demonstration data is NOT official verification.
  const legalAnalysisSummary = isKbr
    ? 'Формат кадастрового номера корректен. Наличие участка, его границы, права, ограничения и доступность не проверены в ЕГРН. Проверьте сведения в официальных источниках.'
    : 'Формат кадастрового номера корректен, но этот номер не относится к КБР. ЕГРН не проверен.';

  return {
    isValidCadastralFormat: true,
    cadastralNumber: cleanNumber,
    regionCode,
    regionName,
    districtCode,
    districtName,
    quarterCode,
    isRegisteredInKbrRegistry: false, // bundled demo data are not an official registry
    matchedParcel: undefined,
    directLinks: {
      rosreestrPkkUrl,
      nspdUrl,
      gisTorgiUrl,
      egrnPortalUrl,
    },
    legalAnalysisSummary,
  };
}
