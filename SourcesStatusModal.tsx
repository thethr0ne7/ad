import React from 'react';
import { RegistrySourceStatus } from '../types/land';
import {
  X,
  RefreshCw,
  ExternalLink,
  Activity,
  Database,
  ShieldAlert,
  CheckCircle,
  FileSpreadsheet,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface SourcesStatusModalProps {
  sources: RegistrySourceStatus[];
  onClose: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenImport?: () => void;
}

export const SourcesStatusModal: React.FC<SourcesStatusModalProps> = ({
  sources,
  onClose,
  onRefresh,
  isRefreshing,
  onOpenImport,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base">
                  Официальные источники земельных данных РФ и КБР
                </h3>
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono">
                  Честный аудит доступности
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Прямая сетевая диагностика государственных серверов без имитации ответов
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition flex items-center space-x-1.5 text-xs"
              title="Запустить диагностику подключения"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}
              />
              <span className="hidden sm:inline">Проверить шлюзы</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informational Callout */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-4 py-3 flex items-start space-x-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-medium text-slate-200">
              Особенности сетевого подключения к государственным реестрам (.gov.ru):
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Российские государственные порталы (ГИС Торги, ПКК Росреестра, НСПД) применяют геораспределенную WAF-фильтрацию и блокируют прямые соединения из зарубежных облачных датацентров. Для обеспечения достоверности данных система использует двухуровневую интеграцию: <strong>(1) Прямые проверочные ссылки в браузере пользователя</strong> и <strong>(2) Импорт официальных выгрузок XML/GeoJSON/CSV</strong>.
            </p>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {sources.map((src) => {
            const isConnected = src.status === 'connected';
            const isGeoRestricted = src.status === 'restricted_geo';

            return (
              <div
                key={src.id}
                className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2.5 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isConnected
                          ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                          : isGeoRestricted
                          ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                          : 'bg-rose-400 shadow-sm shadow-rose-400/50'
                      }`}
                    />
                    <span className="font-bold text-white text-sm">
                      {src.shortName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5 text-[11px]">
                    <span className="text-slate-400 flex items-center space-x-1 font-mono">
                      <Activity className="w-3 h-3 text-slate-400" />
                      <span>{src.lastPingMs} мс</span>
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded border ${
                        isConnected
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : isGeoRestricted
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                          : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                      }`}
                    >
                      {src.statusLabel || (isConnected ? 'Подключено' : 'Ограничено')}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  {src.description}
                </p>

                {/* Diagnostic Details */}
                {src.diagnosticDetails && (
                  <div className="p-2.5 bg-slate-900/80 border border-slate-800/90 rounded-lg text-[11px] text-slate-400 space-y-1">
                    <div className="text-slate-300 font-medium flex items-center space-x-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Диагностика сетевого протокола:</span>
                    </div>
                    <p className="leading-relaxed pl-5">
                      {src.diagnosticDetails}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>Протокол: <strong className="text-slate-300">{src.protocol}</strong></span>
                    <span>•</span>
                    <span>Режим: <span className="text-slate-300">{src.lastSyncTime}</span></span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center space-x-1 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded border border-slate-700/80 transition"
                    >
                      <span>Открыть в браузере</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with action */}
        {onOpenImport && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Есть официальная выгрузка КПТ или XML ГИС Торги?
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenImport();
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center space-x-1.5 transition shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Открыть мастер импорта данных</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
