import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeLandParcelWithAi } from './src/server/geminiService';
import { INITIAL_REGISTRY_SOURCES } from './src/services/sourcesService';

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

app.get('/api/sources-status', (req, res) => {
  const updated = INITIAL_REGISTRY_SOURCES.map((s) => ({
    ...s,
    lastPingMs: Math.floor(Math.random() * 45) + 50,
  }));
  res.json(updated);
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
