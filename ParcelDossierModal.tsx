import React, { useState } from 'react';
import { LandParcel, ParcelHistoryEntry } from './land';
import { Land3DScene } from './Land3DScene';
import { AiGroundingPanel } from './AiGroundingPanel';
import {
  X,
  FileText,
  Box,
  Scale,
  DollarSign,
  Layers,
  Sparkles,
  Printer,
  Download,
  ShieldCheck,
  Gavel,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Building,
  Route,
  Zap,
  Droplets,
  Flame,
  Award,
  History,
  PlusCircle,
  Clock,
  UserCheck,
} from 'lucide-react';

interface ParcelDossierModalProps {
  parcel: LandParcel;
  onClose: () => void;
  initialTab?: 'overview' | '3d' | 'legal' | 'economics' | 'documents' | 'ai' | 'history';
  onUpdateParcel?: (updatedParcel: LandParcel) => void;
}

export const ParcelDossierModal: React.FC<ParcelDossierModalProps> = ({
  parcel,
  onClose,
  initialTab = 'overview',
  onUpdateParcel,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | '3d' | 'legal' | 'economics' | 'documents' | 'ai' | 'history'
  >(initialTab);

  // New history entry form state
  const [newEventAction, setNewEventAction] = useState(
    'Подача заявления о предварительном согласовании предоставления земельного участка (ст. 39.15 ЗК РФ)'
  );
  const [newEventAuthor, setNewEventAuthor] = useState('Заявитель (Глава КФХ)');
  const [newEventDocNum, setNewEventDocNum] = useState('');
  const [newEventNotes, setNewEventNotes] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(parcel, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Dossier_${parcel.cadastralNumber.replace(/:/g, '_')}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleAddHistoryEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventAction.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry: ParcelHistoryEntry = {
      id: `hist-user-${Date.now()}`,
      date: `${todayStr} (Сегодня)`,
      action: newEventAction.trim(),
      author: newEventAuthor.trim() || 'Пользователь системы DIVE',
      documentNumber: newEventDocNum.trim() || undefined,
      notes: newEventNotes.trim() || undefined,
    };

    const updated: LandParcel = {
      ...parcel,
      history: [newEntry, ...(parcel.history || [])],
    };

    if (onUpdateParcel) {
      onUpdateParcel(updated);
    }

    setNewEventDocNum('');
    setNewEventNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-800/80 px-2.5 py-0.5 rounded">
                {parcel.cadastralNumber}
              </span>
              <span className="text-xs bg-slate-800 border border-slate-700 text-white font-semibold px-2 py-0.5 rounded">
                {parcel.areaHa} га
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                {parcel.district}
              </span>
              {parcel.legal.isEligibleDirectLeaseWithoutAuction && (
                <span className="inline-flex items-center space-x-1 text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Доступно без торгов (ст. 39.18 ЗК РФ)</span>
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white pt-1">
              {parcel.name}
            </h2>
            <p className="text-xs text-slate-400 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                {parcel.municipality}, {parcel.nearestSettlement} • Источник: {parcel.sourceType}
              </span>
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handlePrint}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
              title="Печать официального досье"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportJson}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
              title="Экспорт в JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-4 sm:px-5 pt-2 border-b border-slate-800 bg-slate-900 overflow-x-auto scrollbar-none text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2.5 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Кадастровые сведения</span>
          </button>

          <button
            onClick={() => setActiveTab('3d')}
            className={`px-3 py-2.5 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === '3d'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Топография & Рельеф</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`px-3 py-2.5 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === 'legal'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Юридическая экспертиза</span>
          </button>

          <button
            onClick={() => setActiveTab('economics')}
            className={`px-3 py-2.5 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === 'economics'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Экономика & Субсидии</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-2.5 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === 'documents'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Пакет документов</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2.5 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>История изменений & Аудит</span>
            {parcel.history && parcel.history.length > 0 && (
              <span className="bg-slate-800 text-emerald-400 px-1.5 py-0.2 rounded-full text-[10px]">
                {parcel.history.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-2.5 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === 'ai'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Геоанализ & Maps Grounding</span>
          </button>
        </div>

        {/* Modal Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Cards: Cadastral & Ownership specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5">
                  <div className="text-slate-400 text-[11px]">Категория земель</div>
                  <div className="font-semibold text-white mt-1">
                    {parcel.category}
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5">
                  <div className="text-slate-400 text-[11px]">Вид использования (ВРИ)</div>
                  <div className="font-semibold text-emerald-400 mt-1">
                    Код {parcel.permittedUseCode} — {parcel.permittedUseTitle}
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5">
                  <div className="text-slate-400 text-[11px]">Форма собственности</div>
                  <div className="font-semibold text-white mt-1">
                    {parcel.ownership}
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5">
                  <div className="text-slate-400 text-[11px]">Первичный источник данных</div>
                  <div className="font-semibold text-white mt-1 flex items-center justify-between">
                    <span>{parcel.sourceType}</span>
                    <a
                      href={parcel.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center space-x-0.5 text-[11px]"
                    >
                      <span>Открыть</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Infrastructure and Utilities */}
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-white text-sm flex items-center space-x-2">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span>Инженерно-транспортная инфраструктура</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                  <div className="flex items-start space-x-2">
                    <Route className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-200">Дорожный доступ</div>
                      <div className="text-slate-400">
                        {parcel.utilities.roadType} ({parcel.utilities.distanceToHighwayKm} км до трассы)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-200">Электроснабжение</div>
                      <div className="text-slate-400">
                        {parcel.utilities.hasElectricity
                          ? `Линия ${parcel.utilities.electricityDistanceM} м (${parcel.utilities.substationCapacityKva || 160} кВА)`
                          : `Отсутствует (до ЛЭП ${parcel.utilities.electricityDistanceM} м)`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Droplets className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-200">Водоснабжение</div>
                      <div className="text-slate-400">
                        {parcel.utilities.waterSource} ({parcel.utilities.distanceToWaterM} м)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Flame className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-200">Газоснабжение</div>
                      <div className="text-slate-400">
                        {parcel.utilities.hasGas
                          ? `Газопровод ${parcel.utilities.gasDistanceM} м`
                          : `До точки врезки ${parcel.utilities.gasDistanceM} м`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agro and Soil characteristics */}
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-white text-sm flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Почвенно-агрономический потенциал КБР</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-slate-400">Почвенная разновидность</div>
                    <div className="font-semibold text-white mt-1">
                      {parcel.agro.soilType}
                    </div>
                    <div className="text-emerald-400 font-bold mt-1">
                      Бонитет: {parcel.agro.bonitetScore} / 100 баллов
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400">Климатические параметры</div>
                    <div className="text-slate-200 mt-1 space-y-0.5">
                      <div>Осадки: {parcel.agro.annualPrecipitationMm} мм/год</div>
                      <div>Безморозный период: {parcel.agro.frostFreePeriodDays} дней</div>
                      <div>Сумма активных темп: {parcel.agro.activeTempSum}°C</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400">Рекомендуемые культуры</div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {parcel.agro.recommendedCrops.map((crop, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-800 text-emerald-300 border border-slate-700 px-2 py-0.5 rounded text-[11px]"
                        >
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coordinates boundary table */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-white text-sm">
                  Координаты поворотных точек границ (МСК-07 / WGS-84)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {parcel.boundary.map((pt, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 p-2 rounded text-[11px] font-mono"
                    >
                      <span className="text-emerald-400 font-bold">Т.{idx + 1}: </span>
                      {pt.lat.toFixed(6)}, {pt.lng.toFixed(6)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 3D TOPOGRAPHY */}
          {activeTab === '3d' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Интерактивная 3D-модель цифровой высотной матрицы (DEM) рельефа участка
                </span>
                <span className="text-emerald-400 font-medium">
                  {parcel.utilities.reliefType} • H: {parcel.utilities.elevationMeters} м БС
                </span>
              </div>
              <Land3DScene parcel={parcel} />
            </div>
          )}

          {/* TAB 3: LEGAL ASSESSMENT */}
          {activeTab === 'legal' && (
            <div className="space-y-5">
              {/* Direct Lease Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start space-x-3 ${
                  parcel.legal.isEligibleDirectLeaseWithoutAuction
                    ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-200'
                    : 'bg-amber-950/50 border-amber-800/80 text-amber-200'
                }`}
              >
                {parcel.legal.isEligibleDirectLeaseWithoutAuction ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Gavel className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {parcel.legal.isEligibleDirectLeaseWithoutAuction
                      ? 'Основание предоставления: Аренда БЕЗ торгов (ст. 39.18 ЗК РФ)'
                      : parcel.legal.hasAuctionNoticePublished
                      ? `Идут открытые торги на ГИС Торги (Извещение № ${parcel.legal.auctionNoticeNumber})`
                      : 'Предоставление через открытый аукцион либо инвестпроект КБР'}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {parcel.legal.isEligibleDirectLeaseWithoutAuction
                      ? 'Данный участок с/х назначения находится в государственной (неразграниченной) или муниципальной собственности и может быть предоставлен гражданину или главе КФХ для фермерской деятельности без проведения торгов, если в течение 30 дней после официальной публикации извещения не поступит других заявлений.'
                      : 'Участок выставлен на открытый электронный аукцион в соответствии со статьями 39.11 - 39.13 ЗК РФ. Заявки подаются в электронной форме.'}
                  </p>
                </div>
              </div>

              {/* Applicable Norms of Law */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white text-sm">
                  Применимые нормы законодательства РФ и КБР
                </h4>
                <div className="space-y-2.5">
                  {parcel.legal.applicableLaws.map((law, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400">
                          {law.law} — {law.article}
                        </span>
                        {law.linkUrl && (
                          <a
                            href={law.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white flex items-center space-x-1 text-[11px]"
                          >
                            <span>Норматив</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {law.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restrictions and Encumbrances */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white text-sm">
                  Ограничения оборотоспособности и публичные сервитуты
                </h4>
                <div className="space-y-2">
                  {parcel.legal.restrictionsAndEncumbrances.map((res, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start space-x-2.5"
                    >
                      <AlertTriangle
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          res.severity === 'high'
                            ? 'text-rose-400'
                            : res.severity === 'medium'
                            ? 'text-amber-400'
                            : 'text-blue-400'
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-white">
                          {res.type}
                        </div>
                        <div className="text-slate-400 mt-0.5 leading-relaxed">
                          {res.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step by step action plan */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white text-sm">
                  Пошаговый регламент действий заявителя в КБР
                </h4>
                <div className="space-y-2">
                  {parcel.legal.stepByStepActionPlan.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl flex items-start space-x-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                        {step.stepNumber}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="font-bold text-white">
                            {step.title}
                          </span>
                          <span className="text-emerald-400 font-medium text-[11px]">
                            {step.timeframeDays} дней
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          <strong>Инстанция:</strong> {step.authority} •{' '}
                          <strong>Основание:</strong> {step.legalBasis}
                        </div>
                        <p className="text-xs text-slate-300 pt-0.5">
                          {step.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ECONOMICS & SUBSIDIES */}
          {activeTab === 'economics' && (
            <div className="space-y-6">
              {/* Cadastral & Rent summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
                  <div className="text-slate-400">Кадастровая стоимость</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {parcel.economics.cadastralValueRub.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    ~{parcel.economics.cadastralValuePerHaRub.toLocaleString('ru-RU')} ₽/га
                  </div>
                </div>

                <div className="bg-slate-800/70 border border-emerald-500/40 rounded-xl p-4">
                  <div className="text-slate-400">Годовая арендная плата</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">
                    {parcel.economics.annualRentRub.toLocaleString('ru-RU')} ₽/год
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-1">
                    {parcel.economics.rentCalculationBasis}
                  </div>
                </div>

                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
                  <div className="text-slate-400">Выкупная стоимость (через 3 года)</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {parcel.economics.buyoutValueRub?.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    15% по ст. 39.3 ЗК РФ для КФХ
                  </div>
                </div>
              </div>

              {/* CAPEX breakdown */}
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-semibold text-white text-sm">
                    Капитальные затраты на освоение участка (CAPEX)
                  </h4>
                  <span className="font-bold text-emerald-400 text-sm">
                    Итого: {parcel.economics.estimatedCapex.totalCapexRub.toLocaleString('ru-RU')} ₽
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between p-2 bg-slate-900 rounded">
                    <span>Ограждение периметра (3D сетка):</span>
                    <strong className="text-white">
                      {parcel.economics.estimatedCapex.fencingRub.toLocaleString('ru-RU')} ₽
                    </strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-900 rounded">
                    <span>Водоснабжение & скважина / насос:</span>
                    <strong className="text-white">
                      {parcel.economics.estimatedCapex.wellDrillingRub.toLocaleString('ru-RU')} ₽
                    </strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-900 rounded">
                    <span>Подключение к электросетям:</span>
                    <strong className="text-white">
                      {parcel.economics.estimatedCapex.electricityConnectionRub.toLocaleString('ru-RU')} ₽
                    </strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-900 rounded">
                    <span>Подготовка почвы & мелиорация:</span>
                    <strong className="text-white">
                      {parcel.economics.estimatedCapex.landPreparationRub.toLocaleString('ru-RU')} ₽
                    </strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-900 rounded sm:col-span-2">
                    <span>Капельный полив / узлы фильтрации:</span>
                    <strong className="text-white">
                      {parcel.economics.estimatedCapex.irrigationSystemRub.toLocaleString('ru-RU')} ₽
                    </strong>
                  </div>
                </div>
              </div>

              {/* Subsidies and Grants */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white text-sm flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Доступные субсидии и гранты в Кабардино-Балкарии</span>
                </h4>
                <div className="space-y-2.5">
                  {parcel.economics.eligibleSubsidies.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-white text-xs">
                          {sub.programName}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          до {sub.maxAmountRub.toLocaleString('ru-RU')} ₽ ({sub.coFinancingPercent}% грант)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {sub.authority}
                      </div>
                      <p className="text-xs text-slate-300">
                        {sub.conditions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REQUIRED DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Полный комплект документации для подачи заявления в Администрацию района или Министерство земельных и имущественных отношений КБР.
              </div>
              <div className="space-y-2.5">
                {parcel.legal.requiredDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-xl flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-white flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{doc.name}</span>
                        {doc.isMandatory && (
                          <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded">
                            Обязательно
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 pl-6">
                        {doc.description}
                      </p>
                    </div>

                    {doc.templateAvailable && (
                      <button
                        onClick={() => {
                          alert(`Шаблон "${doc.name}" сформирован в формате заявления по КБР.`);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition shrink-0"
                      >
                        Сформировать
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT TRAIL & HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Add New Event Form */}
              <div className="p-4 bg-slate-800/40 border border-slate-700/80 rounded-xl space-y-3">
                <h4 className="font-semibold text-white text-sm flex items-center space-x-2">
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>Внести запись в юридическую историю участка</span>
                </h4>

                <form onSubmit={handleAddHistoryEntry} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Действие / Юридический факт:
                      </label>
                      <select
                        value={newEventAction}
                        onChange={(e) => setNewEventAction(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Подача заявления о предварительном согласовании предоставления земельного участка (ст. 39.15 ЗК РФ)">
                          Подача заявления по ст. 39.15 ЗК РФ (предварительное согласование)
                        </option>
                        <option value="Подача заявления о предоставлении участка в аренду без торгов (ст. 39.18 ЗК РФ)">
                          Подача заявления по ст. 39.18 ЗК РФ (аренда без торгов)
                        </option>
                        <option value="Выполнение схемы расположения земельного участка на КПТ">
                          Выполнение схемы расположения на КПТ (кадастровый инженер)
                        </option>
                        <option value="Проведение полевого обследования и фотофиксации">
                          Полевое обследование и фотофиксация рельефа/коммуникаций
                        </option>
                        <option value="Запрос технических условий подключения к сетям (электроэнергия/газ)">
                          Запрос техусловий подключения (Россети / Газпром)
                        </option>
                        <option value="Публикация официального извещения в печатном органе района">
                          Публикация извещения в районной газете
                        </option>
                        <option value="Заключение договора аренды земельного участка">
                          Заключение договора аренды с уполномоченным органом
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Ответственное лицо / Заявитель:
                      </label>
                      <input
                        type="text"
                        value={newEventAuthor}
                        onChange={(e) => setNewEventAuthor(e.target.value)}
                        placeholder="Глава КФХ / Кадастровый инженер"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Номер документа / Входящий номер:
                      </label>
                      <input
                        type="text"
                        value={newEventDocNum}
                        onChange={(e) => setNewEventDocNum(e.target.value)}
                        placeholder="Вх. № 07-МЗИО/2026-..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Примечания и юридические комментарии:
                      </label>
                      <input
                        type="text"
                        value={newEventNotes}
                        onChange={(e) => setNewEventNotes(e.target.value)}
                        placeholder="Принято к рассмотрению, срок ответа 30 дней..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs flex items-center space-x-1.5 transition shadow-sm"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Зафиксировать в аудит-логе</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* History Timeline */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white text-sm flex items-center space-x-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  <span>Хронология кадастровых и юридических действий по участку</span>
                </h4>

                {(!parcel.history || parcel.history.length === 0) ? (
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
                    История действий по участку пуста. Используйте форму выше для фиксации подачи заявлений.
                  </div>
                ) : (
                  <div className="relative border-l border-slate-800 ml-3 space-y-4 py-1">
                    {parcel.history.map((entry) => (
                      <div key={entry.id} className="relative pl-6">
                        <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                        <div className="p-3 bg-slate-800/60 border border-slate-700/70 rounded-xl space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                            <span className="font-bold text-white text-xs">
                              {entry.action}
                            </span>
                            <span className="text-emerald-400 font-mono font-medium flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{entry.date}</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                            <span className="flex items-center space-x-1">
                              <UserCheck className="w-3 h-3 text-slate-400" />
                              <span>{entry.author}</span>
                            </span>
                            {entry.documentNumber && (
                              <span>Документ: <strong className="text-slate-300">{entry.documentNumber}</strong></span>
                            )}
                          </div>

                          {entry.notes && (
                            <p className="text-slate-300 text-xs pt-1 leading-relaxed">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: AI MAPS GROUNDING */}
          {activeTab === 'ai' && (
            <AiGroundingPanel parcel={parcel} />
          )}
        </div>
      </div>
    </div>
  );
};
