import { RegistrySourceStatus } from '../types/land';

export const INITIAL_REGISTRY_SOURCES: RegistrySourceStatus[] = [
  {
    id: 'gis-torgi',
    name: 'ГИС Торги (Единая информационная система торгов РФ)',
    shortName: 'ГИС Торги (torgi.gov.ru)',
    url: 'https://torgi.gov.ru/new/public/lots/reg',
    status: 'unknown',
    statusLabel: 'Не проверено',
    httpStatus: 0,
    lastPingMs: 0,
    lastSyncTime: 'Синхронизация не выполнялась',
    totalRecordsFound: 0,
    description: 'Официальный реестр извещений об аукционах и предоставлении земельных участков (ст. 39.18 ЗК РФ).',
    protocol: 'REST API v2 / Open Data XML',
    diagnosticDetails:
      'Государственный шлюз torgi.gov.ru фильтрует прямые HTTP-запросы от зарубежных облачных датацентров. Работа с реестром осуществляется через верифицированный импорт официальных выгрузок КПТ и ГИС Торги.',
    isLiveProbe: false,
  },
  {
    id: 'rosreestr-egrn',
    name: 'Федеральная служба государственной регистрации, кадастра и картографии (Росреестр)',
    shortName: 'Росреестр (ПКК / ЕГРН)',
    url: 'https://pkk.rosreestr.ru/',
    status: 'unknown',
    statusLabel: 'Не проверено',
    httpStatus: 0,
    lastPingMs: 0,
    lastSyncTime: 'Синхронизация не выполнялась',
    totalRecordsFound: 0,
    description: 'Кадастровые границы, кадастровая стоимость, категория земель, вид разрешенного использования и форма собственности.',
    protocol: 'OGC WFS / REST API ПКК',
    diagnosticDetails:
      'Прямой публичный доступ к ПКК Росреестра требует российских TLS-сертификатов Национального УЦ (Минцифры). Интеграция выполняется через прямое формирование поисковых запросов в браузере заявителя и импорт кадастровых планов.',
    isLiveProbe: false,
  },
  {
    id: 'nspd',
    name: 'Национальная система пространственных данных РФ (НСПД)',
    shortName: 'НСПД (nspd.gov.ru)',
    url: 'https://nspd.gov.ru/',
    status: 'unknown',
    statusLabel: 'Не проверено',
    httpStatus: 0,
    lastPingMs: 0,
    lastSyncTime: 'Синхронизация не выполнялась',
    totalRecordsFound: 0,
    description: 'Единая цифровая платформа: выявление неразграниченных земельных участков и свободных контуров.',
    protocol: 'Spatial API GeoJSON',
    diagnosticDetails:
      'Портал функционирует в защищенном контуре ЕСИА. Для выявления неразграниченных земель в системе предусмотрен импорт пространственных слоев GeoJSON и Shapefile.',
    isLiveProbe: false,
  },
  {
    id: 'minzem-kbr',
    name: 'Министерство земельных и имущественных отношений Кабардино-Балкарской Республики',
    shortName: 'Минземимущество КБР',
    url: 'https://pravitelstvo.kbr.ru/oiv/mzio/',
    status: 'unknown',
    statusLabel: 'Доступность API не проверена',
    httpStatus: 0,
    lastPingMs: 0,
    lastSyncTime: 'Синхронизация не выполнялась',
    totalRecordsFound: 0,
    description: 'Республиканский реестр государственного имущества КБР, перечни участков для инвестиционных проектов (Закон КБР № 33-РЗ).',
    protocol: 'Реестр МЗИО КБР / Портал КБР',
    diagnosticDetails:
      'Публикации нормативных правовых актов, перечни участков республиканской собственности и решений о предварительном согласовании.',
    isLiveProbe: false,
  },
  {
    id: 'mcx-kbr',
    name: 'Министерство сельского хозяйства Кабардино-Балкарской Республики',
    shortName: 'Минсельхоз КБР',
    url: 'https://mcx.kbr.ru/',
    status: 'unknown',
    statusLabel: 'Доступность API не проверена',
    httpStatus: 0,
    lastPingMs: 0,
    lastSyncTime: 'Синхронизация не выполнялась',
    totalRecordsFound: 0,
    description: 'Реестры субсидируемых проектов (Агростартап, закладка интенсивных садов, капельное орошение, гранты Агротуризм).',
    protocol: 'Ведомственный реестр субсидий',
    diagnosticDetails:
      'Действующие нормативы субсидирования закладки садов (до 280 тыс. руб./га) и грантовой поддержки КФХ (до 5–10 млн руб.).',
    isLiveProbe: false,
  },
  {
    id: 'municipal-kbr',
    name: 'Муниципальные фонды перераспределения земель районов КБР',
    shortName: 'Муниципальные фонды районов КБР',
    url: 'https://nalchik.kbr.ru/',
    status: 'unknown',
    statusLabel: 'Доступность API не проверена',
    httpStatus: 0,
    lastPingMs: 0,
    lastSyncTime: 'Синхронизация не выполнялась',
    totalRecordsFound: 0,
    description: 'Фонды перераспределения земель Чегемского, Черекского, Урванского, Прохладненского и других районов КБР.',
    protocol: 'Муниципальные выгрузки КПТ',
    diagnosticDetails:
      'Сведения о свободных земельных массивах из муниципальных фондов перераспределения земель, подлежащих предоставлению по ст. 39.18 ЗК РФ.',
    isLiveProbe: false,
  },
];

/**
 * Performs honest real network probing from the server side.
 */
export async function checkSourcesConnection(): Promise<RegistrySourceStatus[]> {
  try {
    const res = await fetch('/api/sources-status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return INITIAL_REGISTRY_SOURCES;
  }
}
