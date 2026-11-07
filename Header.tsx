import React from 'react';
import {
  Compass,
  Database,
  Map,
  List,
  Layers,
  Search,
  Upload,
} from 'lucide-react';

interface HeaderProps {
  viewMode: 'split' | 'map' | 'list';
  onChangeViewMode: (mode: 'split' | 'map' | 'list') => void;
  onOpenSourcesModal: () => void;
  onOpenCadastralSearch: () => void;
  onOpenDataImport: () => void;
  sourcesCount: number;
  totalParcelsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onChangeViewMode,
  onOpenSourcesModal,
  onOpenCadastralSearch,
  onOpenDataImport,
  sourcesCount,
  totalParcelsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-sans">
                DIVE LAND INTELLIGENCE
              </h1>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                КБР
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Поиск и правовая оценка государственных и муниципальных земельных ресурсов
            </p>
          </div>
        </div>

        {/* Action Tools & View Mode Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Cadastral Online Search Button */}
          <button
            onClick={onOpenCadastralSearch}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 hover:text-white flex items-center space-x-1.5 transition shadow-sm"
            title="Проверка кадастрового номера Росреестра"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Кадастровый поиск</span>
            <span className="md:hidden">Поиск</span>
          </button>

          {/* Official Data Import Button */}
          <button
            onClick={onOpenDataImport}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 hover:text-white flex items-center space-x-1.5 transition shadow-sm"
            title="Импорт официальных XML / GeoJSON / CSV"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Импорт КПТ</span>
            <span className="md:hidden">Импорт</span>
          </button>

          {/* Sources Status Button */}
          <button
            onClick={onOpenSourcesModal}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:text-white flex items-center space-x-1.5 transition"
            title="Просмотр статуса подключения официальных источников"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden lg:inline">Источники:</span>
            <strong className="text-white">{sourcesCount} реестров</strong>
          </button>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => onChangeViewMode('split')}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center space-x-1 ${
                viewMode === 'split'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Разделенный экран (Карта + Карточки)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Сплит</span>
            </button>

            <button
              onClick={() => onChangeViewMode('map')}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center space-x-1 ${
                viewMode === 'map'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Только интерактивная карта"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Карта</span>
            </button>

            <button
              onClick={() => onChangeViewMode('list')}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center space-x-1 ${
                viewMode === 'list'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Только список досье"
            >
              <List className="w-3.5 h-3.5" />
              <span>Список</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
