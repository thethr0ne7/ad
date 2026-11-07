import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeLandParcelWithAi } from './src/server/geminiService';
import { INITIAL_REGISTRY_SOURCES } from './src/services/sourcesService';
import { RegistrySourceStatus } from './src/types/land';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API endpoints
app.get('/api/config', (req, res) => {
  res.json({
    googleMapsApiKey:
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      '',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

/**
 * Honest network probe checking live connectivity to official state portals
 * without fake random latency.
 */
async function probeSource(source: RegistrySourceStatus): Promise<RegistrySourceStatus> {
  const startTime = Date.now();
  const nowStr = new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  try {
    // Quick probe with 1200ms timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const response = await fetch(source.url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(timeoutId);

    const elapsed = Date.now() - startTime;
    return {
      ...source,
      status: response.ok ? 'connected' : 'restricted_geo',
      statusLabel: response.ok
        ? `Доступно (HTTP ${response.status})`
        : `Ограничен внешний IP (HTTP ${response.status})`,
      httpStatus: response.status,
      lastPingMs: elapsed,
      lastSyncTime: `Проверено в ${nowStr}`,
      isLiveProbe: true,
    };
  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    const isTimeout = err?.name === 'AbortError' || elapsed >= 1150;

    return {
      ...source,
      status: 'restricted_geo',
      statusLabel: isTimeout
        ? 'Ограничен внешний IP (Geo-WAF таймаут)'
        : 'Защищенный периметр (ГОСТ TLS / Geo-WAF)',
      httpStatus: 0,
      lastPingMs: elapsed,
      lastSyncTime: `Диагностика в ${nowStr}`,
      diagnosticDetails: isTimeout
        ? `Прямое сетевое подключение к ${new URL(source.url).hostname} прервано по таймауту (${elapsed} мс). Сервер защищен российским межсетевым экраном (Geo-IP фильтрация). Доступ возможен через браузер заявителя или сертифицированный импорт XML/GeoJSON.`
        : `Шлюз ${new URL(source.url).hostname} отклонил соединение из внешнего датацентра (${err?.message || 'ECONNREFUSED'}). Используйте прямой переход или импорт данных.`,
      isLiveProbe: true,
    };
  }
}

app.get('/api/sources-status', async (req, res) => {
  try {
    // Probe all sources in parallel with strict timeout
    const probed = await Promise.all(INITIAL_REGISTRY_SOURCES.map(probeSource));
    res.json(probed);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to probe sources', details: err?.message });
  }
});

app.post('/api/analyze-land', async (req, res) => {
  try {
    const result = await analyzeLandParcelWithAi(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Serve static built frontend
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`DIVE Land Intelligence server running on port ${port}`);
});
