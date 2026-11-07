import { RegistrySourceStatus } from '../types/land';

export const INITIAL_REGISTRY_SOURCES: RegistrySourceStatus[] = [
  {
    id: 'gis-torgi',
    name: 'ГИС Торги (Официальный сайт РФ для размещения информации о торгах)',
    shortName: 'ГИС Торги (torgi.gov.ru)',
    url: 'https://torgi.gov.ru/new/public/lots/reg',
    status: 'connected',
    lastPingMs: 64,
    lastSyncTime: 'Сегодня, 11:25:40',
    totalRecordsFound: 184,
    description: 'Интеграция с открытыми реестрами извещений об аукционах и предоставлении земельных участков (ст. 39.18 ЗК РФ).',
    protocol: 'REST API v2 / Open Data XML',
  },
  {
    id: 'rosreestr-egrn',
    name: 'Федеральная служба государственной регистрации, кадастра и картографии (Росреестр / ПКК)',
    shortName: 'Росреестр (ЕГРН / ПКК)',
    url: 'https://pkk.rosreestr.ru/',
    status: 'connected',
    lastPingMs: 112,
    lastSyncTime: 'Сегодня, 11:20:15',
    totalRecordsFound: 1420,
    description: 'Кадастровые границы, кадастровая стоимость, категория земель, вид разрешенного использования и форма собственности.',
    protocol: 'OGC WFS / REST API ПКК',
  },
  {
    id: 'nspd',
    name: 'Национальная система пространственных данных (НСПД РФ)',
    shortName: 'НСПД (nspd.gov.ru)',
    url: 'https://nspd.gov.ru/',
    status: 'connected',
    lastPingMs: 88,
    lastSyncTime: 'Сегодня, 11:15:02',
    totalRecordsFound: 395,
    description: 'Единая цифровая платформа пространственных данных: выявление неразграниченных земельных участков и свободных контуров.',
    protocol: 'Spatial API GeoJSON',
  },
  {
    id: 'minzem-kbr',
    name: 'Министерство земельных и имущественных отношений Кабардино-Балкарской Республики',
    shortName: 'Минземимущество КБР',
    url: 'https://pravitelstvo.kbr.ru/oiv/mzio/',
    status: 'connected',
    lastPingMs: 78,
    lastSyncTime: 'Сегодня, 10:45:00',
    totalRecordsFound: 87,
    description: 'Республиканский реестр государственного имущества КБР, перечни участков для инвестиционных проектов (Закон КБР № 33-РЗ).',
    protocol: 'Официальный реестр / Портал КБР',
  },
  {
    id: 'mcx-kbr',
    name: 'Министерство сельского хозяйства Кабардино-Балкарской Республики',
    shortName: 'Минсельхоз КБР',
    url: 'https://mcx.kbr.ru/',
    status: 'connected',
    lastPingMs: 95,
    lastSyncTime: 'Сегодня, 09:30:10',
    totalRecordsFound: 52,
    description: 'Реестры субсидируемых проектов (Агростартап, закладка интенсивных садов, капельное орошение, гранты Агротуризм).',
    protocol: 'Ведомственный реестр субсидий',
  },
  {
    id: 'municipal-kbr',
    name: 'Муниципальные фонды перераспределения земель районов КБР',
    shortName: 'Муниципальные фонды районов КБР',
    url: 'https://nalchik.kbr.ru/',
    status: 'connected',
    lastPingMs: 130,
    lastSyncTime: 'Сегодня, 08:50:22',
    totalRecordsFound: 318,
    description: 'Фонды перераспределения земель Чегемского, Черекского, Урванского, Прохладненского и других районов КБР.',
    protocol: 'Муниципальные выгрузки КПТ',
  },
];

export async function checkSourcesConnection(): Promise<RegistrySourceStatus[]> {
  // In a real environment, ping or check health endpoints
  return INITIAL_REGISTRY_SOURCES.map((source) => ({
    ...source,
    lastPingMs: Math.floor(Math.random() * 50) + 55,
  }));
}
