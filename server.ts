import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeLandParcelWithAi } from './geminiService';
import { INITIAL_REGISTRY_SOURCES } from './sourcesService';
import { RegistrySourceStatus } from './land';

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
 * These portals are reference links, not live APIs.
 * Availability and cadastral rights cannot be determined through an HTTP homepage probe.
 * The client uses user-provided boundaries, and all resulting candidates remain unverified.
 */
app.get('/api/sources-status', (_req, res) => {
  res.json(INITIAL_REGISTRY_SOURCES.map(source => ({
    ...source,
    status: 'unknown' as const,
    statusLabel: 'API не подключён. Доступна внешняя справочная ссылка.',
    httpStatus: 0,
    lastPingMs: 0,
    isLiveProbe: false,
    totalRecordsFound: 0,
    lastSyncTime: 'Автоматической синхронизации нет',
  })));
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
