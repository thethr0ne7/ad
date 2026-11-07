import React from 'react';
import { SearchFilterState, KbrDistrict, SearchPurpose, LandCategory, OwnershipType } from '../types/land';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  ShieldCheck,
  Gavel,
  Zap,
  Droplets,
  Route,
  Flame,
} from 'lucide-react';

interface FilterBarProps {
  filters: SearchFilterState;
  onChangeFilters: (filters: SearchFilterState) => void;
  onReset: () => void;
  totalFound: number;
}

const DISTRICTS: Array<KbrDistrict | 'all'> = [
  'all',
  'Нальчик',
  'Черекский район',
  'Чегемский район',
  'Урванский район',
  'Прохладненский район',
  'Баксанский район',
  'Зольский район',
  'Майский район',
  'Эльбрусский район',
  'Лескенский район',
];

const PURPOSES: Array<{ value: SearchPurpose; label: string }> = [
  { value: 'any', label: 'Любая цель' },
  { value: 'orchard', label: 'Садоводство & Ягодники (интенсивные сады)' },
  { value: 'kfh', label: 'КФХ (Крестьянское хозяйство)' },
  { value: 'greenhouse', label: 'Тепличное хозяйство (ЗГТ)' },
  { value: 'agrotourism', label: 'Агротуризм & Эко-фермы' },
  { value: 'tourism_facility', label: 'Объекты сельского туризма (ФЗ-318)' },
  { value: 'izhs', label: 'ИЖС & Приусадебные участки' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  onReset,
  totalFound,
}) => {
  const update = (partial: Partial<SearchFilterState>) => {
    onChangeFilters({ ...filters, ...partial });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4 text-xs">
      {/* Search Input & District & Purpose Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Keyword Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => update({ searchQuery: e.target.value })}
            placeholder="Кадастровый номер или населенный пункт..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* District Selector */}
        <div>
          <select
            value={filters.district}
            onChange={(e) => update({ district: e.target.value as any })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Все районы и округа КБР</option>
            {DISTRICTS.filter((d) => d !== 'all').map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Target Purpose */}
        <div>
          <select
            value={filters.purpose}
            onChange={(e) => update({ purpose: e.target.value as any })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
          >
            {PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Area Range (5 to 100 Ha) */}
        <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg">
          <span className="text-slate-400 shrink-0">Площадь (га):</span>
          <input
            type="number"
            min={5}
            max={filters.maxAreaHa}
            value={filters.minAreaHa}
            onChange={(e) =>
              update({ minAreaHa: Math.max(5, Number(e.target.value)) })
            }
            className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white font-semibold"
          />
          <span className="text-slate-500">—</span>
          <input
            type="number"
            min={filters.minAreaHa}
            max={100}
            value={filters.maxAreaHa}
            onChange={(e) =>
              update({ maxAreaHa: Math.min(100, Number(e.target.value)) })
            }
            className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white font-semibold"
          />
          <span className="text-slate-400">га</span>
        </div>
      </div>

      {/* Advanced Quick Filters: Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Lease without Auction */}
          <button
            onClick={() => update({ directLeaseOnly: !filters.directLeaseOnly })}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center space-x-1.5 transition ${
              filters.directLeaseOnly
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Без торгов (ст. 39.18 ЗК РФ)</span>
          </button>

          {/* Active Auctions on GIS Torgi */}
          <button
            onClick={() => update({ hasAuctionOnly: !filters.hasAuctionOnly })}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center space-x-1.5 transition ${
              filters.hasAuctionOnly
                ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>На торгах (ГИС Торги)</span>
          </button>

          {/* Utilities Toggles */}
          <button
            onClick={() => update({ hasRoadOnly: !filters.hasRoadOnly })}
            className={`px-2.5 py-1.5 rounded-lg border transition flex items-center space-x-1 ${
              filters.hasRoadOnly
                ? 'bg-slate-700 text-emerald-400 border-emerald-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Подъездные дороги"
          >
            <Route className="w-3.5 h-3.5" />
            <span>Подъезд</span>
          </button>

          <button
            onClick={() =>
              update({ hasElectricityOnly: !filters.hasElectricityOnly })
            }
            className={`px-2.5 py-1.5 rounded-lg border transition flex items-center space-x-1 ${
              filters.hasElectricityOnly
                ? 'bg-slate-700 text-amber-400 border-amber-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Электрификация"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Электричество</span>
          </button>

          <button
            onClick={() => update({ hasWaterOnly: !filters.hasWaterOnly })}
            className={`px-2.5 py-1.5 rounded-lg border transition flex items-center space-x-1 ${
              filters.hasWaterOnly
                ? 'bg-slate-700 text-cyan-400 border-cyan-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Водоисточник (река/канал/скважина)"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Вода</span>
          </button>

          <button
            onClick={() => update({ hasGasOnly: !filters.hasGasOnly })}
            className={`px-2.5 py-1.5 rounded-lg border transition flex items-center space-x-1 ${
              filters.hasGasOnly
                ? 'bg-slate-700 text-orange-400 border-orange-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Газоснабжение"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Газ</span>
          </button>
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center space-x-3">
          <span className="text-slate-400 text-xs">
            Найдено: <strong className="text-white">{totalFound}</strong> участков
          </span>

          <button
            onClick={onReset}
            className="px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition flex items-center space-x-1 border border-transparent hover:border-slate-700"
            title="Сбросить все фильтры"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сброс</span>
          </button>
        </div>
      </div>
    </div>
  );
};
