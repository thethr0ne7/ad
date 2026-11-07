import React, { useState } from 'react';
import {
  parseOfficialData,
  SAMPLE_GIS_TORGI_XML,
  SAMPLE_NSPD_GEOJSON,
  SAMPLE_MUNICIPAL_CSV,
  ImportResult,
} from '../utils/dataImporter';
import { LandParcel } from '../types/land';
import {
  X,
  FileCode,
  FileSpreadsheet,
  Layers,
  Upload,
  CheckCircle,
  AlertTriangle,
  FileText,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface DataImportModalProps {
  onClose: () => void;
  onImportSuccess: (parcels: LandParcel[]) => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  onClose,
  onImportSuccess,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'xml' | 'geojson' | 'csv'>('xml');
  const [inputText, setInputText] = useState(SAMPLE_GIS_TORGI_XML);
  const [parseResult, setParseResult] = useState<ImportResult>(() =>
    parseOfficialData(SAMPLE_GIS_TORGI_XML, 'xml')
  );

  const handleFormatChange = (fmt: 'xml' | 'geojson' | 'csv') => {
    setSelectedFormat(fmt);
    let sample = '';
    if (fmt === 'xml') sample = SAMPLE_GIS_TORGI_XML;
    else if (fmt === 'geojson') sample = SAMPLE_NSPD_GEOJSON;
    else if (fmt === 'csv') sample = SAMPLE_MUNICIPAL_CSV;

    setInputText(sample);
    setParseResult(parseOfficialData(sample, fmt));
  };

  const handleTextChange = (val: string) => {
    setInputText(val);
    setParseResult(parseOfficialData(val, selectedFormat));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    let fmt: 'xml' | 'geojson' | 'csv' = selectedFormat;
    if (fileName.endsWith('.xml')) fmt = 'xml';
    else if (fileName.endsWith('.geojson') || fileName.endsWith('.json')) fmt = 'geojson';
    else if (fileName.endsWith('.csv')) fmt = 'csv';

    setSelectedFormat(fmt);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        setParseResult(parseOfficialData(content, fmt));
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (parseResult.parcels.length > 0) {
      onImportSuccess(parseResult.parcels);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Импорт официальных данных и выгрузок КПТ
              </h3>
              <p className="text-xs text-slate-400">
                Парсинг выгрузок ГИС Торги (XML), пространственных слоев НСПД (GeoJSON) и фондов районов КБР (CSV)
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

        {/* Format Selector Bar */}
        <div className="p-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Формат источника:</span>
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => handleFormatChange('xml')}
                className={`px-3 py-1 rounded-md font-medium transition flex items-center space-x-1.5 ${
                  selectedFormat === 'xml'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>ГИС Торги (XML)</span>
              </button>

              <button
                onClick={() => handleFormatChange('geojson')}
                className={`px-3 py-1 rounded-md font-medium transition flex items-center space-x-1.5 ${
                  selectedFormat === 'geojson'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>НСПД (GeoJSON)</span>
              </button>

              <button
                onClick={() => handleFormatChange('csv')}
                className={`px-3 py-1 rounded-md font-medium transition flex items-center space-x-1.5 ${
                  selectedFormat === 'csv'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Муниц. фонд (CSV)</span>
              </button>
            </div>
          </div>

          <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white flex items-center space-x-1.5 transition">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Загрузить файл с ПК</span>
            <input
              type="file"
              accept=".xml,.json,.geojson,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Content Body: Editor + Live Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Raw Text Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-slate-400">
              <span>Содержимое официального файла / структуры данных:</span>
              <span>Символов: {inputText.length}</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition shadow-inner resize-y leading-relaxed"
              placeholder="Вставьте XML, GeoJSON или CSV официальной выгрузки..."
            />
          </div>

          {/* Validation & Parsed Parcels Preview */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">
                  Результат синтаксического анализа:
                </span>
                {parseResult.success && parseResult.parcels.length > 0 ? (
                  <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Успешно распознано: {parseResult.parcels.length} участков</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>0 объектов</span>
                  </span>
                )}
              </div>
            </div>

            {/* Parcels Table Preview */}
            {parseResult.parcels.length > 0 && (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                    <tr>
                      <th className="p-3">Кадастровый номер</th>
                      <th className="p-3">Район / Муниципалитет</th>
                      <th className="p-3">Площадь</th>
                      <th className="p-3">ВРИ / Назначение</th>
                      <th className="p-3">Ст. 39.18 ЗК РФ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {parseResult.parcels.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="p-3 font-mono font-bold text-emerald-400">
                          {p.cadastralNumber}
                        </td>
                        <td className="p-3 text-slate-300">
                          <div>{p.district}</div>
                          <div className="text-[10px] text-slate-500">{p.municipality}</div>
                        </td>
                        <td className="p-3 font-medium text-white">
                          {p.areaHa} га
                        </td>
                        <td className="p-3 text-slate-300">
                          <span className="text-emerald-300 font-mono text-[11px]">
                            {p.permittedUseCode}
                          </span>{' '}
                          — {p.permittedUseTitle}
                        </td>
                        <td className="p-3">
                          {p.legal.isEligibleDirectLeaseWithoutAuction ? (
                            <span className="text-emerald-400 font-medium flex items-center space-x-1 text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Без торгов</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              Торги / Аукцион
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Error notifications */}
            {parseResult.errors.length > 0 && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 space-y-1">
                <div className="font-semibold flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Ошибки распознавания:</span>
                </div>
                {parseResult.errors.map((err, i) => (
                  <div key={i} className="text-xs pl-5">{err}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">
            После импорта участки будут включены в картографический слой и юридический фильтр.
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition"
            >
              Отмена
            </button>

            <button
              onClick={handleExecuteImport}
              disabled={parseResult.parcels.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white rounded-lg font-bold flex items-center space-x-2 transition shadow-md shadow-emerald-900/30"
            >
              <span>Импортировать в систему ({parseResult.parcels.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
