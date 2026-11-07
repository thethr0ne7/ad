import React from 'react';
import { LandParcel } from '../types/land';
import {
  MapPin,
  ShieldCheck,
  Gavel,
  Zap,
  Droplets,
  Flame,
  Route,
  ArrowRight,
  TrendingUp,
  Box,
} from 'lucide-react';

interface ParcelCardProps {
  parcel: LandParcel;
  isSelected: boolean;
  onSelect: (parcel: LandParcel) => void;
  onOpen3D: (parcel: LandParcel) => void;
}

export const ParcelCard: React.FC<ParcelCardProps> = ({
  parcel,
  isSelected,
  onSelect,
  onOpen3D,
}) => {
  return (
    <div
      onClick={() => onSelect(parcel)}
      className={`group relative bg-slate-900 border rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
        isSelected
          ? 'border-emerald-500 bg-slate-900/95 ring-1 ring-emerald-500/50'
          : 'border-slate-800 hover:border-slate-700 bg-slate-900/80'
      }`}
    >
      {/* Header with Cadastral Number & Status Badges */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div>
          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            {parcel.cadastralNumber}
          </span>
          <h3 className="font-semibold text-white text-sm mt-1.5 line-clamp-1 group-hover:text-emerald-300 transition">
            {parcel.name}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
            {parcel.areaHa} га
          </span>
          <span className="text-[10px] text-slate-400">
            {parcel.sourceType}
          </span>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center text-xs text-slate-400 mb-3 space-x-1">
        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="truncate">
          {parcel.district}, {parcel.nearestSettlement}
        </span>
      </div>

      {/* Permitted Use & Key Tags */}
      <div className="text-xs text-slate-300 mb-3 line-clamp-1">
        <span className="text-slate-400">ВРИ:</span> {parcel.permittedUseTitle}
      </div>

      {/* Badges: Direct Lease vs Auction */}
      <div className="flex flex-wrap gap-1.5 mb-3.5">
        {parcel.legal.isEligibleDirectLeaseWithoutAuction ? (
          <span className="inline-flex items-center space-x-1 text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Без торгов (ст. 39.18 ЗК РФ)</span>
          </span>
        ) : parcel.legal.hasAuctionNoticePublished ? (
          <span className="inline-flex items-center space-x-1 text-[11px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded">
            <Gavel className="w-3 h-3 text-amber-400" />
            <span>Торги на ГИС Торги</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1 text-[11px] font-medium bg-blue-950/80 text-blue-300 border border-blue-800/80 px-2 py-0.5 rounded">
            <span>Аренда / Выкуп</span>
          </span>
        )}

        <span className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">
          {parcel.ownership.replace(' (неразграниченная)', '')}
        </span>

        <span className="text-[11px] bg-slate-800 text-emerald-400 border border-slate-700 px-1.5 py-0.5 rounded">
          Бонитет: {parcel.agro.bonitetScore} б.
        </span>
      </div>

      {/* Infrastructure Icons Row */}
      <div className="flex items-center justify-between text-xs text-slate-400 py-2 border-t border-slate-800/80 mb-3">
        <div className="flex items-center space-x-3">
          <span
            title={`Дорога: ${parcel.utilities.roadType}`}
            className={`flex items-center space-x-1 ${
              parcel.utilities.hasRoadAccess ? 'text-emerald-400' : 'text-slate-600'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span className="text-[10px]">
              {parcel.utilities.distanceToHighwayKm} км
            </span>
          </span>

          <span
            title={`Электричество: ${parcel.utilities.electricityDistanceM} м`}
            className={`flex items-center space-x-1 ${
              parcel.utilities.hasElectricity ? 'text-amber-400' : 'text-slate-600'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px]">
              {parcel.utilities.electricityDistanceM} м
            </span>
          </span>

          <span
            title={`Вода: ${parcel.utilities.waterSource}`}
            className="flex items-center space-x-1 text-cyan-400"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span className="text-[10px]">
              {parcel.utilities.distanceToWaterM} м
            </span>
          </span>

          <span
            title={`Газ: ${parcel.utilities.gasDistanceM} м`}
            className={`flex items-center space-x-1 ${
              parcel.utilities.hasGas ? 'text-orange-400' : 'text-slate-600'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-500">Аренда/год</div>
          <div className="font-semibold text-slate-200">
            {parcel.economics.annualRentRub.toLocaleString('ru-RU')} ₽
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen3D(parcel);
          }}
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition border border-slate-700"
        >
          <Box className="w-3.5 h-3.5 text-emerald-400" />
          <span>3D Рельеф</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(parcel);
          }}
          className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition shadow-sm"
        >
          <span>Досье участка</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
