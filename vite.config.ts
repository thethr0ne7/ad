import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { analyzeLandParcelWithAi } from './geminiService';
import { INITIAL_REGISTRY_SOURCES } from './sourcesService';

function apiServerPlugin(): Plugin {
  return {
    name: 'dive-land-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // 1. /api/config
        if (req.url === '/api/config' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              googleMapsApiKey:
                process.env.GOOGLE_MAPS_API_KEY ||
                process.env.VITE_GOOGLE_MAPS_API_KEY ||
                '',
              hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
            })
          );
          return;
        }

        // 2. /api/sources-status
        if (req.url === '/api/sources-status' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          const updated = INITIAL_REGISTRY_SOURCES.map((s) => ({ ...s, status: 'unknown', statusLabel: 'Не проверено: dev-сервер не подключён к реестру', httpStatus: 0, lastPingMs: 0, isLiveProbe: false }));
          res.end(JSON.stringify(updated));
          return;
        }

        // 3. /api/analyze-land
        if (req.url === '/api/analyze-land' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const result = await analyzeLandParcelWithAi(data);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Server error' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(
        process.env.GOOGLE_MAPS_API_KEY ||
          process.env.VITE_GOOGLE_MAPS_API_KEY ||
          ''
      ),
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
