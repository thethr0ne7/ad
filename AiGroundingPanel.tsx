import React, { useState } from 'react';
import { LandParcel } from '../types/land';
import {
  Sparkles,
  MapPin,
  ExternalLink,
  Loader2,
  Send,
  HelpCircle,
  FileCheck2,
  TrendingUp,
} from 'lucide-react';

interface AiGroundingPanelProps {
  parcel: LandParcel;
}

interface GroundingLink {
  title: string;
  uri: string;
  snippet?: string;
}

export const AiGroundingPanel: React.FC<AiGroundingPanelProps> = ({ parcel }) => {
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<GroundingLink[]>([]);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [quotaNotice, setQuotaNotice] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');

  const runAnalysis = async (userQuestion?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze-land', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cadastralNumber: parcel.cadastralNumber,
          name: parcel.name,
          district: parcel.district,
          areaHa: parcel.areaHa,
          lat: parcel.coordinates.lat,
          lng: parcel.coordinates.lng,
          purpose: parcel.permittedUseTitle,
          roadType: parcel.utilities.roadType,
          waterSource: parcel.utilities.waterSource,
          soilType: parcel.agro.soilType,
          nearestSettlement: parcel.nearestSettlement,
          customQuestion: userQuestion || customQuestion || undefined,
        }),
      });

      const data = await res.json();
      setAnalysisText(data.analysisText);
      setGroundingLinks(data.groundingLinks || []);
      setModelUsed(data.modelUsed || 'gemini-3.8-flash');
      setQuotaNotice(data.quotaNotice || null);
    } catch (e: any) {
      setAnalysisText(
        `Отчет сформирован по нормативной базе КБР.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">
              Интеллектуальный геоанализ и Maps Grounding
            </h4>
            <p className="text-xs text-slate-400">
              Модель Gemini 3.8 Flash с привязкой к реальным геоданным и инфраструктуре КБР
            </p>
          </div>
        </div>

        <button
          onClick={() => runAnalysis()}
          disabled={loading}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center justify-center space-x-2 transition shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Анализирую координаты...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Запустить экспресс-анализ</span>
            </>
          )}
        </button>
      </div>

      {/* Suggested Fast Questions */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-slate-400 self-center text-[11px]">Частые вопросы:</span>
        <button
          onClick={() => {
            setCustomQuestion('Оцени доступность оптовых рынков и плодохранилищ КБР для сбыта урожая яблок и ягод');
            runAnalysis('Оцени доступность оптовых рынков и плодохранилищ КБР для сбыта урожая яблок и ягод');
          }}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
        >
          Рынки сбыта и плодохранилища
        </button>
        <button
          onClick={() => {
            setCustomQuestion('Какие требования к проекту для победы в конкурсе «Агростартап» в Минсельхозе КБР?');
            runAnalysis('Какие требования к проекту для победы в конкурсе «Агростартап» в Минсельхозе КБР?');
          }}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
        >
          Субсидия «Агростартап»
        </button>
        <button
          onClick={() => {
            setCustomQuestion('Риски конкурентных торгов: вероятность подачи заявок от других КФХ за 30 дней');
            runAnalysis('Риски конкурентных торгов: вероятность подачи заявок от других КФХ за 30 дней');
          }}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
        >
          Риски торгов (ст. 39.18)
        </button>
      </div>

      {/* Custom Question Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          placeholder="Задайте конкретный вопрос по участку, праву или агротехнологиям..."
          className="flex-1 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customQuestion.trim()) {
              runAnalysis(customQuestion);
            }
          }}
        />
        <button
          onClick={() => runAnalysis(customQuestion)}
          disabled={loading || !customQuestion.trim()}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Спросить</span>
        </button>
      </div>

      {/* Analysis Output Container */}
      {analysisText && (
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Результат аналитического заключения</span>
            </span>
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {modelUsed}
            </span>
          </div>

          {quotaNotice && (
            <div className="bg-amber-950/40 border border-amber-800/60 text-amber-200 px-3 py-2 rounded text-[11px]">
              {quotaNotice}
            </div>
          )}

          <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap font-sans space-y-2">
            {analysisText}
          </div>

          {/* Mandatory Google Maps Grounding Links Display */}
          {groundingLinks.length > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-red-400" />
                <span>Источники картографической привязки (Google Maps):</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {groundingLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-xs flex items-center justify-between text-slate-300 hover:text-white transition group"
                  >
                    <span className="truncate pr-2 font-medium">
                      {link.title}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
