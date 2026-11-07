import React from 'react';
import { RegistrySourceStatus } from '../types/land';
import { X, CheckCircle, RefreshCw, ExternalLink, Activity, Database } from 'lucide-react';

interface SourcesStatusModalProps {
  sources: RegistrySourceStatus[];
  onClose: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const SourcesStatusModal: React.FC<SourcesStatusModalProps> = ({
  sources,
  onClose,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Официальные источники данных РФ и КБР
              </h3>
              <p className="text-xs text-slate-400">
                Мониторинг прямого подключения к государственным и региональным реестрам
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
              title="Проверить статус подключения"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {sources.map((src) => (
            <div
              key={src.id}
              className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  <span className="font-bold text-white text-sm">
                    {src.shortName}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    <span>Пинг: {src.lastPingMs} мс</span>
                  </span>
                  <span className="text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                    Подключено
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed">
                {src.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span>Протокол: <strong>{src.protocol}</strong></span>
                <span>Найдено объектов в КБР: <strong className="text-white">{src.totalRecordsFound}</strong></span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <span>Портал источника</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
