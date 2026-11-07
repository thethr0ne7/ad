import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { LandParcel } from '../types/land';
import { Layers, MapPin, Maximize2, ShieldCheck, Zap } from 'lucide-react';

interface LandMapViewProps {
  parcels: LandParcel[];
  selectedParcel: LandParcel | null;
  onSelectParcel: (parcel: LandParcel) => void;
  apiKey: string;
}

// Sub-component to draw polygon boundaries on the map instance
const ParcelPolygonsLayer: React.FC<{
  parcels: LandParcel[];
  selectedParcel: LandParcel | null;
  onSelectParcel: (parcel: LandParcel) => void;
}> = ({ parcels, selectedParcel, onSelectParcel }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    const polygonInstances: google.maps.Polygon[] = [];

    parcels.forEach((parcel) => {
      const isSelected = selectedParcel?.id === parcel.id;
      const poly = new google.maps.Polygon({
        paths: parcel.boundary,
        strokeColor: isSelected ? '#10b981' : '#0284c7',
        strokeOpacity: 0.9,
        strokeWeight: isSelected ? 3.5 : 2,
        fillColor: isSelected ? '#10b981' : '#0ea5e9',
        fillOpacity: isSelected ? 0.35 : 0.18,
        map,
      });

      poly.addListener('click', () => {
        onSelectParcel(parcel);
      });

      polygonInstances.push(poly);
    });

    return () => {
      polygonInstances.forEach((p) => p.setMap(null));
    };
  }, [map, parcels, selectedParcel, onSelectParcel]);

  // Center on selected parcel if changed
  useEffect(() => {
    if (!map || !selectedParcel) return;
    map.panTo(selectedParcel.coordinates);
    if ((map.getZoom() ?? 0) < 13) {
      map.setZoom(13);
    }
  }, [map, selectedParcel]);

  return null;
};

export const LandMapView: React.FC<LandMapViewProps> = ({
  parcels,
  selectedParcel,
  onSelectParcel,
  apiKey,
}) => {
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [mapTypeId, setMapTypeId] = useState<google.maps.MapTypeId | 'hybrid' | 'roadmap' | 'satellite'>('hybrid');

  // Center of Kabardino-Balkarian Republic (near Nalchik / Chegem)
  const defaultCenter = { lat: 43.53, lng: 43.68 };

  const activeParcel =
    parcels.find((p) => p.id === activeMarkerId) || selectedParcel;

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-900 overflow-hidden rounded-xl border border-slate-700/60 shadow-lg">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={10}
          mapId="DEMO_MAP_ID"
          mapTypeId={mapTypeId as any}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
          style={{ height: '100%', minHeight: '500px' }}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          {/* Custom Polygons on the Google Map */}
          <ParcelPolygonsLayer
            parcels={parcels}
            selectedParcel={selectedParcel}
            onSelectParcel={(p) => {
              onSelectParcel(p);
              setActiveMarkerId(p.id);
            }}
          />

          {/* Advanced Markers for each Land Parcel */}
          {parcels.map((parcel) => {
            const isSelected = selectedParcel?.id === parcel.id;
            return (
              <AdvancedMarker
                key={parcel.id}
                position={parcel.coordinates}
                onClick={() => {
                  onSelectParcel(parcel);
                  setActiveMarkerId(parcel.id);
                }}
              >
                <Pin
                  background={isSelected ? '#059669' : '#0284c7'}
                  borderColor="#ffffff"
                  glyphColor="#ffffff"
                  scale={isSelected ? 1.25 : 1.0}
                />
              </AdvancedMarker>
            );
          })}

          {/* InfoWindow for the selected or hovered parcel */}
          {activeParcel && (
            <InfoWindow
              position={activeParcel.coordinates}
              onCloseClick={() => setActiveMarkerId(null)}
              headerContent={
                <div className="font-semibold text-slate-900 text-xs">
                  {activeParcel.cadastralNumber}
                </div>
              }
            >
              <div className="p-1 max-w-[240px] text-xs text-slate-800 space-y-1.5">
                <div className="font-medium text-emerald-800">
                  {activeParcel.name}
                </div>
                <div className="text-[11px] text-slate-600">
                  {activeParcel.district}, {activeParcel.nearestSettlement}
                </div>
                <div className="flex items-center justify-between font-medium pt-1 border-t border-slate-200">
                  <span>Площадь:</span>
                  <span className="text-emerald-700 font-bold">
                    {activeParcel.areaHa} га
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Аренда в год:</span>
                  <span className="font-semibold text-slate-900">
                    {activeParcel.economics.annualRentRub.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                {activeParcel.legal.isEligibleDirectLeaseWithoutAuction && (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded px-1.5 py-0.5 text-[10px] flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Доступно без торгов (ст. 39.18)</span>
                  </div>
                )}
                <button
                  onClick={() => onSelectParcel(activeParcel)}
                  className="w-full mt-1.5 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium transition"
                >
                  Открыть полное досье
                </button>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Floating Map Layer Switcher (Top Left) */}
      <div className="absolute top-3 left-3 bg-slate-900/95 border border-slate-700 rounded-lg p-1 shadow-lg flex items-center space-x-1 z-10 text-xs">
        <button
          onClick={() => setMapTypeId('hybrid')}
          className={`px-2.5 py-1 rounded font-medium transition ${
            mapTypeId === 'hybrid'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Спутник / Гибрид
        </button>
        <button
          onClick={() => setMapTypeId('roadmap')}
          className={`px-2.5 py-1 rounded font-medium transition ${
            mapTypeId === 'roadmap'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Схема дорог
        </button>
      </div>

      {/* Parcel Count Indicator (Bottom Left) */}
      <div className="absolute bottom-4 left-3 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs text-slate-200 z-10 flex items-center space-x-2 shadow-md">
        <MapPin className="w-4 h-4 text-emerald-400" />
        <span>
          Отображено на карте:{' '}
          <strong className="text-white">{parcels.length}</strong> участков КБР
        </span>
      </div>
    </div>
  );
};
