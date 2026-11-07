import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Point = { lat: number; lng: number };
type Feature = {
  type: 'Feature';
  properties: { status: 'candidate_unverified'; source: 'user_drawn_on_osm'; areaHaEstimate: number; createdAt: string; note: string };
  geometry: { type: 'Polygon'; coordinates: number[][][] };
};

const R = 6378137;

/** Approximate geodesic polygon area on a sphere; for preliminary planning only. */
export function estimateAreaHa(points: Point[]): number {
  if (points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    const dLon = ((b.lng - a.lng) * Math.PI) / 180;
    sum += dLon * (2 + Math.sin((a.lat * Math.PI) / 180) + Math.sin((b.lat * Math.PI) / 180));
  }
  return Math.abs(sum * R * R / 2) / 10000;
}

export function toCandidateGeoJSON(points: Point[]): Feature {
  if (points.length < 3 || points.some(p => !Number.isFinite(p.lat) || !Number.isFinite(p.lng))) {
    throw new Error('Нужны минимум три корректные вершины контура');
  }
  const ring = [...points.map(p => [p.lng, p.lat]), [points[0].lng, points[0].lat]];
  return {
    type: 'Feature',
    properties: {
      status: 'candidate_unverified',
      source: 'user_drawn_on_osm',
      areaHaEstimate: Number(estimateAreaHa(points).toFixed(4)),
      createdAt: new Date().toISOString(),
      note: 'Контур создан пользователем. Правовой статус, границы ЕГРН и доступность земли не проверены.',
    },
    geometry: { type: 'Polygon', coordinates: [ring] },
  };
}

const download = (name: string, content: string, mime: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export const CandidateMapModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.Polygon | L.Polyline | null>(null);
  const vertexMarkers = useRef<L.CircleMarker[]>([]);
  const pointsRef = useRef<Point[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [location, setLocation] = useState('43.485, 43.61');
  const [note, setNote] = useState('Визуально неиспользуемая территория; требуется проверка прав и ограничений.');
  const [message, setMessage] = useState('');

  const redraw = (next: Point[]) => {
    const map = mapRef.current;
    if (!map) return;
    if (overlayRef.current) { overlayRef.current.remove(); overlayRef.current = null; }
    vertexMarkers.current.forEach(m => m.remove());
    vertexMarkers.current = [];
    if (next.length >= 3) {
      overlayRef.current = L.polygon(next.map(p => [p.lat, p.lng]), {
        color: '#16a34a', weight: 3, fillOpacity: 0.16,
      }).addTo(map);
    } else if (next.length > 1) {
      overlayRef.current = L.polyline(next.map(p => [p.lat, p.lng]), { color: '#16a34a', weight: 3 }).addTo(map);
    }
    vertexMarkers.current = next.map(p => L.circleMarker([p.lat, p.lng], {
      radius: 5, color: '#fff', weight: 2, fillColor: '#16a34a', fillOpacity: 1,
    }).addTo(map));
  };
  const update = (next: Point[]) => {
    pointsRef.current = next;
    setPoints(next);
    redraw(next);
    setMessage('');
  };

  useEffect(() => {
    if (!host.current || mapRef.current) return;
    const map = L.map(host.current, { zoomControl: true }).setView([43.485, 43.61], 12);
    mapRef.current = map;
    // OSM standard tiles are for limited interactive usage, not bulk analysis or tile scraping.
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
    }).addTo(map);
    map.on('click', e => {
      const p = { lat: Number(e.latlng.lat.toFixed(7)), lng: Number(e.latlng.lng.toFixed(7)) };
      const next = [...pointsRef.current, p];
      pointsRef.current = next;
      setPoints(next);
      if (overlayRef.current) { overlayRef.current.remove(); overlayRef.current = null; }
      vertexMarkers.current.forEach(m => m.remove());
      vertexMarkers.current = [];
      if (next.length >= 3) overlayRef.current = L.polygon(next.map(v => [v.lat, v.lng]), { color: '#16a34a', weight: 3, fillOpacity: 0.16 }).addTo(map);
      else if (next.length === 2) overlayRef.current = L.polyline(next.map(v => [v.lat, v.lng]), { color: '#16a34a', weight: 3 }).addTo(map);
      vertexMarkers.current = next.map(v => L.circleMarker([v.lat, v.lng], { radius: 5, color: '#fff', weight: 2, fillColor: '#16a34a', fillOpacity: 1 }).addTo(map));
      setMessage('');
    });
    requestAnimationFrame(() => map.invalidateSize());
    return () => { map.remove(); mapRef.current = null; overlayRef.current = null; vertexMarkers.current = []; };
  }, []);

  const move = () => {
    const parts = location.trim().split(/[;,\s]+/).map(Number);
    if (parts.length !== 2 || !parts.every(Number.isFinite) || Math.abs(parts[0]) > 90 || Math.abs(parts[1]) > 180) {
      setMessage('Введите координаты в формате: 43.485, 43.61');
      return;
    }
    mapRef.current?.setView([parts[0], parts[1]], 16);
    setMessage('');
  };

  const save = (format: 'geojson' | 'csv') => {
    if (points.length < 3) { setMessage('Сначала отметьте на карте минимум три вершины.'); return; }
    if (format === 'geojson') {
      const feature = toCandidateGeoJSON(points);
      feature.properties.note = note.trim() || feature.properties.note;
      download('candidate-unverified.geojson', JSON.stringify(feature, null, 2), 'application/geo+json;charset=utf-8');
    } else {
      const rows = ['vertex,latitude,longitude', ...points.map((p, i) => `${i + 1},${p.lat},${p.lng}`)];
      download('candidate-coordinates.csv', rows.join('\n') + '\n', 'text/csv;charset=utf-8');
    }
    setMessage('Координаты сохранены. Статус участка остаётся неподтверждённым.');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 p-3 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Поиск кандидатного участка на карте">
      <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-4 flex flex-wrap gap-3 justify-between items-center border-b border-slate-700">
          <div><h2 className="font-bold text-lg text-white">Поиск кандидатной территории</h2>
          <p className="text-xs text-amber-300">Визуально свободное место ≠ юридически свободный земельный участок.</p></div>
          <button onClick={onClose} className="px-3 py-2 rounded bg-slate-700 text-white">Закрыть</button>
        </div>
        <div className="p-4 grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-4">
          <div>
            <div className="w-full h-[60vh] min-h-[420px] rounded-xl overflow-hidden" ref={host} aria-label="Карта OpenStreetMap для выделения контура" />
            <p className="text-xs text-slate-400 mt-2">Нажимайте на карте по углам предполагаемой территории. Картографическая основа: OpenStreetMap, а не кадастровый реестр.</p>
          </div>
          <div className="space-y-3 text-sm">
            <label className="block text-slate-200">Центр карты (широта, долгота)
              <input className="w-full mt-1 p-2 bg-slate-800 border border-slate-600 rounded" value={location} onChange={e=>setLocation(e.target.value)} />
            </label>
            <button className="px-3 py-2 bg-slate-700 rounded w-full text-white" onClick={move}>Перейти к координатам</button>
            <div className="bg-slate-800 p-3 rounded space-y-1 text-slate-200">
              <p>Вершин: <strong>{points.length}</strong></p>
              <p>Расчётная площадь: <strong>{estimateAreaHa(points).toFixed(4)} га</strong></p>
              <p className="text-amber-300">Правовой статус: не установлен</p>
              <p className="text-xs text-slate-400">Площадь предварительная, не кадастровая.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>update(pointsRef.current.slice(0, -1))} disabled={!points.length} className="flex-1 p-2 bg-slate-700 disabled:opacity-40 rounded text-white">Отменить точку</button>
              <button onClick={()=>update([])} disabled={!points.length} className="flex-1 p-2 bg-slate-700 disabled:opacity-40 rounded text-white">Очистить</button>
            </div>
            <label className="block text-slate-200">Наблюдение (не доказательство свободного статуса)
              <textarea className="w-full mt-1 p-2 rounded bg-slate-800 border border-slate-600 min-h-20" value={note} onChange={e=>setNote(e.target.value)} />
            </label>
            <button onClick={()=>save('geojson')} disabled={points.length<3} className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 rounded p-3 font-semibold text-white">Скачать контур GeoJSON</button>
            <button onClick={()=>save('csv')} disabled={points.length<3} className="w-full bg-slate-700 disabled:opacity-40 rounded p-2 text-white">Скачать координаты CSV</button>
            <p className="text-xs text-slate-400">Чтобы определить наличие прав, ограничений и возможность предоставления участка, потребуются официальные документы или ответ уполномоченного органа. Автоматической юридической проверки здесь нет.</p>
            {message && <p role="status" className="text-xs text-cyan-300">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
