import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './Header';
import { FilterBar } from './FilterBar';
import { ParcelCard } from './ParcelCard';
import { LandMapView } from './LandMapView';
import { ParcelDossierModal } from './ParcelDossierModal';
import { SourcesStatusModal } from './SourcesStatusModal';
import { CadastralSearchModal } from './CadastralSearchModal';
import { DataImportModal } from './DataImportModal';
import { CandidateMapModal } from './CandidateMapModal';
import { QuotaExceededBanner } from './QuotaExceededBanner';
import { KBR_LAND_PARCELS } from './kbrLandRegistry';
import { INITIAL_REGISTRY_SOURCES } from './sourcesService';
import { LandParcel, SearchFilterState, RegistrySourceStatus } from './land';
import {
  ShieldCheck,
  TrendingUp,
  MapPin,
  Sparkles,
  Award,
  Layers,
  Database,
  Info,
  CheckCircle,
  FileCheck,
  X,
} from 'lucide-react';

export default function App() {
  const [apiKey, setApiKey] = useState<string>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [sources, setSources] = useState<RegistrySourceStatus[]>(
    INITIAL_REGISTRY_SOURCES
  );
  const [isRefreshingSources, setIsRefreshingSources] = useState(false);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [isCadastralSearchOpen, setIsCadastralSearchOpen] = useState(false);
  const [isDataImportOpen, setIsDataImportOpen] = useState(false);
  const [isCandidateMapOpen, setIsCandidateMapOpen] = useState(false);

  // Dynamic state for land parcels (preloaded with verified KBR parcels + supports user imports)
  const [parcels, setParcels] = useState<LandParcel[]>([]); // no invented official inventory
  const [importNotification, setImportNotification] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(null);
  const [dossierInitialTab, setDossierInitialTab] = useState<
    'overview' | '3d' | 'legal' | 'economics' | 'documents' | 'history' | 'ai'
  >('overview');

  // Search Filter State
  const [filters, setFilters] = useState<SearchFilterState>({
    district: 'all',
    municipality: '',
    purpose: 'any',
    minAreaHa: 0.1,
    maxAreaHa: 100,
    category: 'all',
    permittedUse: 'all',
    ownership: 'all',
    directLeaseOnly: false,
    hasAuctionOnly: false,
    hasRoadOnly: false,
    hasElectricityOnly: false,
    hasGasOnly: false,
    hasWaterOnly: false,
    searchQuery: '',
  });

  // Fetch Google Maps API key from backend if not already provided
  useEffect(() => {
    if (!apiKey) {
      fetch('/api/config')
        .then((res) => res.json())
        .then((data) => {
          if (data.googleMapsApiKey) {
            setApiKey(data.googleMapsApiKey);
          }
        })
        .catch((e) => console.log('Config fetch notice:', e));
    }
  }, [apiKey]);

  // Refresh sources status with honest live probes
  const handleRefreshSources = async () => {
    setIsRefreshingSources(true);
    try {
      const res = await fetch('/api/sources-status');
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch {
      // Keep existing status if server route unreachable
    } finally {
      setIsRefreshingSources(false);
    }
  };

  // Import handler for XML / GeoJSON / CSV
  const handleImportSuccess = (imported: LandParcel[]) => {
    if (!imported.length) return;

    setParcels((prev) => {
      const existingCadastrals = new Set(prev.map((p) => p.cadastralNumber));
      const newItems = imported.filter((p) => !existingCadastrals.has(p.cadastralNumber));
      return [...newItems, ...prev];
    });

    setImportNotification(`Импортировано ${imported.length} объектов. Подлинность и актуальность источника не проверены.`);
    setSelectedParcel(imported[0]);
    setDossierInitialTab('overview');

    setTimeout(() => {
      setImportNotification(null);
    }, 6000);
  };

  const handleAddParcel = (newParcel: LandParcel) => {
    setParcels((prev) => {
      if (prev.some((p) => p.cadastralNumber === newParcel.cadastralNumber)) {
        return prev;
      }
      return [newParcel, ...prev];
    });
  };

  const handleUpdateParcel = (updated: LandParcel) => {
    setParcels((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setSelectedParcel(updated);
  };

  // Filter parcels
  const filteredParcels = useMemo(() => {
    return parcels.filter((parcel) => {
      // 1. District
      if (filters.district !== 'all' && parcel.district !== filters.district) {
        return false;
      }

      // 2. Purpose
      if (
        filters.purpose !== 'any' &&
        !parcel.suitablePurposes.includes(filters.purpose)
      ) {
        return false;
      }

      // 3. Area Range (5 to 100 ha)
      if (
        parcel.areaHa < filters.minAreaHa ||
        parcel.areaHa > filters.maxAreaHa
      ) {
        return false;
      }

      // 4. Category
      if (filters.category !== 'all' && parcel.category !== filters.category) {
        return false;
      }

      // 5. Ownership
      if (
        filters.ownership !== 'all' &&
        parcel.ownership !== filters.ownership
      ) {
        return false;
      }

      // 6. Direct lease without auction (ст. 39.18 ЗК РФ)
      if (
        filters.directLeaseOnly &&
        !parcel.legal.isEligibleDirectLeaseWithoutAuction
      ) {
        return false;
      }

      // 7. Active auctions (ГИС Торги)
      if (
        filters.hasAuctionOnly &&
        !parcel.legal.hasAuctionNoticePublished
      ) {
        return false;
      }

      // 8. Road
      if (filters.hasRoadOnly && !parcel.utilities.hasRoadAccess) {
        return false;
      }

      // 9. Electricity
      if (filters.hasElectricityOnly && !parcel.utilities.hasElectricity) {
        return false;
      }

      // 10. Gas
      if (filters.hasGasOnly && !parcel.utilities.hasGas) {
        return false;
      }

      // 11. Water
      if (
        filters.hasWaterOnly &&
        parcel.utilities.waterSource ===
          'Артезианская скважина (требует бурения)'
      ) {
        return false;
      }

      // 12. Search Query (cadastral, name, settlement)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesCadastral = parcel.cadastralNumber
          .toLowerCase()
          .includes(q);
        const matchesName = parcel.name.toLowerCase().includes(q);
        const matchesSettlement = parcel.nearestSettlement
          .toLowerCase()
          .includes(q);
        const matchesDistrict = parcel.district.toLowerCase().includes(q);
        if (
          !matchesCadastral &&
          !matchesName &&
          !matchesSettlement &&
          !matchesDistrict
        ) {
          return false;
        }
      }

      return true;
    });
  }, [parcels, filters]);

  const handleResetFilters = () => {
    setFilters({
      district: 'all',
      municipality: '',
      purpose: 'any',
      minAreaHa: 0.1,
      maxAreaHa: 100,
      category: 'all',
      permittedUse: 'all',
      ownership: 'all',
      directLeaseOnly: false,
      hasAuctionOnly: false,
      hasRoadOnly: false,
      hasElectricityOnly: false,
      hasGasOnly: false,
      hasWaterOnly: false,
      searchQuery: '',
    });
  };

  // Aggregated Stats
  const totalAreaHa = filteredParcels.reduce((sum, p) => sum + p.areaHa, 0);
  const directLeaseCount = filteredParcels.filter(
    (p) => p.legal.isEligibleDirectLeaseWithoutAuction
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Google Maps Quota Defense Banner */}
      <QuotaExceededBanner />

      {/* Main App Header */}
      <Header
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenSourcesModal={() => setIsSourcesModalOpen(true)}
        onOpenCadastralSearch={() => setIsCadastralSearchOpen(true)}
        onOpenDataImport={() => setIsDataImportOpen(true)}
        onOpenCandidateMap={() => setIsCandidateMapOpen(true)}
        sourcesCount={sources.length}
        totalParcelsCount={parcels.length}
      />

      {/* Notification Toast for Import */}
      {importNotification && (
        <div className="bg-emerald-950/90 border-b border-emerald-800 text-emerald-200 px-4 py-2.5 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{importNotification}</span>
          </div>
          <button
            onClick={() => setImportNotification(null)}
            className="p-1 text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col space-y-4">
        {/* Filters */}
        <FilterBar
          filters={filters}
          onChangeFilters={setFilters}
          onReset={handleResetFilters}
          totalFound={filteredParcels.length}
        />

        {/* Statistical Summary Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <span className="flex items-center space-x-1.5">
              <span className="text-slate-400">Общая площадь выборки:</span>
              <strong className="text-emerald-400 font-bold">
                {totalAreaHa.toFixed(1)} га
              </strong>
            </span>

            <span className="text-slate-700">•</span>

            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Доступно без торгов (ст. 39.18):</span>
              <strong className="text-white font-bold">
                {directLeaseCount} участков
              </strong>
            </span>

            <span className="text-slate-700">•</span>

            <span className="flex items-center space-x-1.5 text-slate-400">
              <span>Специализация:</span>
              <span className="text-slate-200">
                Кабардино-Балкарская Республика
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Кадастровый округ: 07 (КБР) • Участков в базе: {parcels.length}</span>
          </div>
        </div>

        {/* View Mode: Split / Map / List */}
        <div className="flex-1 flex flex-col min-h-[550px]">
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
              {/* Left Column: Scrollable Cards (5 cols) */}
              <div className="lg:col-span-5 flex flex-col space-y-3 max-h-[780px] overflow-y-auto pr-1">
                {filteredParcels.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-2">
                    <MapPin className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="font-semibold text-white">
                      Участки по заданным критериям не найдены
                    </div>
                    <p className="text-xs text-slate-400">
                      Попробуйте расширить диапазон площади, сбросить фильтры или импортировать кадастровые данные
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <button
                        onClick={handleResetFilters}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
                      >
                        Сбросить фильтры
                      </button>
                      <button
                        onClick={() => setIsDataImportOpen(true)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-xs font-medium"
                      >
                        Импорт выгрузки
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredParcels.map((parcel) => (
                    <ParcelCard
                      key={parcel.id}
                      parcel={parcel}
                      isSelected={selectedParcel?.id === parcel.id}
                      onSelect={(p) => {
                        setSelectedParcel(p);
                        setDossierInitialTab('overview');
                      }}
                      onOpen3D={(p) => {
                        setSelectedParcel(p);
                        setDossierInitialTab('3d');
                      }}
                    />
                  ))
                )}
              </div>

              {/* Right Column: Google Maps (7 cols) */}
              <div className="lg:col-span-7 h-[500px] lg:h-auto min-h-[500px]">
                <LandMapView
                  parcels={filteredParcels}
                  selectedParcel={selectedParcel}
                  onSelectParcel={(p) => {
                    setSelectedParcel(p);
                    setDossierInitialTab('overview');
                  }}
                  apiKey={apiKey}
                />
              </div>
            </div>
          )}

          {viewMode === 'map' && (
            <div className="w-full h-[700px]">
              <LandMapView
                parcels={filteredParcels}
                selectedParcel={selectedParcel}
                onSelectParcel={(p) => {
                  setSelectedParcel(p);
                  setDossierInitialTab('overview');
                }}
                apiKey={apiKey}
              />
            </div>
          )}

          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParcels.map((parcel) => (
                <ParcelCard
                  key={parcel.id}
                  parcel={parcel}
                  isSelected={selectedParcel?.id === parcel.id}
                  onSelect={(p) => {
                    setSelectedParcel(p);
                    setDossierInitialTab('overview');
                  }}
                  onOpen3D={(p) => {
                    setSelectedParcel(p);
                    setDossierInitialTab('3d');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Parcel Dossier Modal (Complete 7-tab Dossier & 3D Topography) */}
      {selectedParcel && (
        <ParcelDossierModal
          parcel={selectedParcel}
          initialTab={dossierInitialTab}
          onClose={() => setSelectedParcel(null)}
          onUpdateParcel={handleUpdateParcel}
        />
      )}

      {/* Official Sources Status Modal */}
      {isSourcesModalOpen && (
        <SourcesStatusModal
          sources={sources}
          isRefreshing={isRefreshingSources}
          onRefresh={handleRefreshSources}
          onClose={() => setIsSourcesModalOpen(false)}
          onOpenImport={() => setIsDataImportOpen(true)}
        />
      )}

      {/* Cadastral Online Search Modal */}
      {isCadastralSearchOpen && (
        <CadastralSearchModal
          onClose={() => setIsCadastralSearchOpen(false)}
          onSelectParcel={(p) => {
            setSelectedParcel(p);
            setDossierInitialTab('overview');
          }}
          onAddParcel={handleAddParcel}
          existingParcels={parcels}
        />
      )}

      {/* Official Data Import Modal (XML, GeoJSON, CSV) */}
      {isDataImportOpen && (
        <DataImportModal
          onClose={() => setIsDataImportOpen(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}

      {isCandidateMapOpen && <CandidateMapModal onClose={() => setIsCandidateMapOpen(false)} />}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-4 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 DIVE LAND INTELLIGENCE • Кабардино-Балкарская Республика
          </span>
          <span className="text-[11px] text-slate-400">
            Поиск кандидатных контуров: OpenStreetMap. Правовой статус устанавливается только по подтверждённым сведениям.
          </span>
        </div>
      </footer>
    </div>
  );
}
