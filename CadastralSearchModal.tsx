import React, { useState } from 'react';
import { verifyCadastralNumber } from './cadastralVerifier';
import { LandParcel, CadastralVerificationResult } from './land';
import { evaluateLegalStatus } from './legalEngine';
import { calculateEconomics } from './economics';
import {
  X,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  MapPin,
  Compass,
  PlusCircle,
  FileText,
  Building,
} from 'lucide-react';

interface CadastralSearchModalProps {
  onClose: () => void;
  onSelectParcel: (parcel: LandParcel) => void;
  onAddParcel: (parcel: LandParcel) => void;
  existingParcels: LandParcel[];
}

const PRESET_NUMBERS = [
  { label: '07:07:1200000:148 (Урванский, Садоводство)', num: '07:07:1200000:148' },
  { label: '07:08:0600000:312 (Чегемский, Агротуризм)', num: '07:08:0600000:312' },
  { label: '07:04:0900000:542 (Прохладненский, Орошение)', num: '07:04:0900000:542' },
  { label: '07:01:1400000:781 (Баксанский, Торги)', num: '07:01:1400000:781' },
];

export const CadastralSearchModal: React.FC<CadastralSearchModalProps> = ({
  onClose,
  onSelectParcel,
  onAddParcel,
  existingParcels,
}) => {
  const [cadastralInput, setCadastralInput] = useState('07:07:1200000:148');
  const [verificationResult, setVerificationResult] = useState<CadastralVerificationResult>(
    () => verifyCadastralNumber('07:07:1200000:148')
  );

  const handleInputChange = (val: string) => {
    setCadastralInput(val);
    setVerificationResult(verifyCadastralNumber(val));
  };

  const handleSelectPreset = (num: string) => {
    setCadastralInput(num);
    setVerificationResult(verifyCadastralNumber(num));
  };

  // Format validation is not an EGRN lookup. Never create an invented parcel.
  const handleAddAndInspect = () => {
    if (!verificationResult.isValidCadastralFormat) return;
    if (verificationResult.matchedParcel) {
      onSelectParcel(verificationResult.matchedParcel);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Онлайн-проверка кадастрового номера Росреестра
              </h3>
              <p className="text-xs text-slate-400">
                Валидация кадастрового деления РФ, определение района КБР и прямые ссылки на госсистемы
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input area */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Введите официальный кадастровый номер земельного участка (Росреестр):
            </label>
            <div className="relative">
              <input
                type="text"
                value={cadastralInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="07:07:1200000:148"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-inner"
              />
              <div className="absolute right-3 top-3">
                {verificationResult.isValidCadastralFormat ? (
                  <span className="flex items-center space-x-1 text-emerald-400 font-sans text-xs bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Корректный формат</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-rose-400 font-sans text-xs bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Неверный формат</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="space-y-1.5">
            <div className="text-slate-400 text-[11px]">
              Примеры реальных участков с/х фондов районов КБР:
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_NUMBERS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(p.num)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] border transition ${
                    cadastralInput === p.num
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                      : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Verification Result Breakdown */}
          {verificationResult.isValidCadastralFormat ? (
            <div className="space-y-4 pt-2">
              {/* Cadastral hierarchy breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3">
                  <div className="text-slate-400 text-[10px]">Округ (Субъект РФ)</div>
                  <div className="font-mono text-base font-bold text-white mt-0.5">
                    {verificationResult.regionCode}
                  </div>
                  <div className="text-emerald-400 text-[11px] font-medium truncate mt-0.5">
                    {verificationResult.regionName}
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3">
                  <div className="text-slate-400 text-[10px]">Кадастровый район</div>
                  <div className="font-mono text-base font-bold text-white mt-0.5">
                    {verificationResult.districtCode}
                  </div>
                  <div className="text-slate-200 text-[11px] font-medium truncate mt-0.5">
                    {verificationResult.districtName}
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3">
                  <div className="text-slate-400 text-[10px]">Кадастровый квартал</div>
                  <div className="font-mono text-base font-bold text-white mt-0.5">
                    {verificationResult.quarterCode}
                  </div>
                  <div className="text-slate-400 text-[11px] truncate mt-0.5">
                    Зона учета
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3">
                  <div className="text-slate-400 text-[10px]">Статус в системе DIVE</div>
                  <div className="font-mono text-base font-bold text-emerald-400 mt-0.5">
                    {verificationResult.matchedParcel ? 'Зарегистрирован' : 'Новый контур'}
                  </div>
                  <div className="text-slate-400 text-[11px] truncate mt-0.5">
                    {verificationResult.matchedParcel ? 'Есть в реестре' : 'Доступен к оценке'}
                  </div>
                </div>
              </div>

              {/* Legal Summary */}
              <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1.5">
                <div className="font-semibold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Правовая справка по кадастровому делению:</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {verificationResult.legalAnalysisSummary}
                </p>
              </div>

              {/* Direct links to Russian state registries */}
              <div className="space-y-2">
                <div className="font-semibold text-white text-xs">
                  Прямой переход к официальным картографическим и реестровым порталам РФ:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={verificationResult.directLinks.rosreestrPkkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 rounded-xl flex items-center justify-between group transition"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-emerald-300 transition">
                        Росреестр: Публичная кадастровая карта (ПКК)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Официальный контур, площадь и кадастровая стоимость
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 shrink-0 ml-2" />
                  </a>

                  <a
                    href={verificationResult.directLinks.nspdUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 rounded-xl flex items-center justify-between group transition"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-emerald-300 transition">
                        НСПД: Национальная система пространственных данных
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Свободные неразграниченные контуры и сервитуты
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 shrink-0 ml-2" />
                  </a>

                  <a
                    href={verificationResult.directLinks.gisTorgiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 rounded-xl flex items-center justify-between group transition"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-emerald-300 transition">
                        ГИС Торги: Реестр торгов и извещений
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Проверка публикации извещений по ст. 39.18 ЗК РФ
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 shrink-0 ml-2" />
                  </a>

                  <a
                    href={verificationResult.directLinks.egrnPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 rounded-xl flex items-center justify-between group transition"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-emerald-300 transition">
                        Справочная онлайн-информация ЕГРН
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Проверка прав, обременений и арестов в режиме реального времени
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 shrink-0 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
              <div className="font-semibold text-rose-300">
                Формат кадастрового номера не распознан
              </div>
              <p className="text-slate-400 text-xs">
                {verificationResult.legalAnalysisSummary}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">
            Формат номера не подтверждает регистрацию, право собственности или границы. Официальный формат Росреестра: <strong>07:XX:XXXXXXX:XXXX</strong>
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition"
            >
              Закрыть
            </button>

            {verificationResult.isValidCadastralFormat && verificationResult.matchedParcel && (
              <button
                onClick={handleAddAndInspect}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center space-x-2 transition shadow-md shadow-emerald-900/30"
              >
                {verificationResult.matchedParcel ? (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Открыть досье участка</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Добавить и рассчитать в системе</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
