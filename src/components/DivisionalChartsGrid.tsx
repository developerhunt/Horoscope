import React, { useState } from 'react';
import { DivisionalChartInfo, ZodiacBox } from '../types';
import { SouthIndianChart } from './SouthIndianChart';
import { Layers, Eye, Grid } from 'lucide-react';

interface DivisionalChartsGridProps {
  divisionalCharts?: Record<string, DivisionalChartInfo> | DivisionalChartInfo[];
  rasiChart?: ZodiacBox[];
  navamsamChart?: ZodiacBox[];
  id?: string;
}

const DEFAULT_CHART_KEYS = [
  'D1', 'D2', 'D3', 'D4', 'D7', 'D8', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D30', 'D60'
];

export const DivisionalChartsGrid: React.FC<DivisionalChartsGridProps> = ({
  divisionalCharts,
  rasiChart,
  navamsamChart,
  id = 'divisional-charts-section'
}) => {
  const [selectedChartKey, setSelectedChartKey] = useState<string>('D1');
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  // Normalize charts map
  const chartsMap: Record<string, DivisionalChartInfo> = {};

  if (Array.isArray(divisionalCharts)) {
    divisionalCharts.forEach(c => {
      if (c && c.code) {
        chartsMap[c.code] = c;
      }
    });
  } else if (divisionalCharts && typeof divisionalCharts === 'object') {
    Object.entries(divisionalCharts).forEach(([k, v]) => {
      if (v && typeof v === 'object' && 'code' in v) {
        chartsMap[k] = v as DivisionalChartInfo;
      }
    });
  }

  // Fallback for D1 and D9 if not in divisionalCharts
  if (!chartsMap['D1'] && rasiChart) {
    chartsMap['D1'] = {
      code: 'D1',
      nameTamil: 'இராசி சக்கரம்',
      nameEnglish: 'Rasi',
      division: 1,
      significanceTamil: 'முழுமையான வாழ்க்கை, உடல் நலம், பொது அமைப்பு',
      significanceEnglish: 'General well-being, physical body',
      boxes: rasiChart
    };
  }

  if (!chartsMap['D9'] && navamsamChart) {
    chartsMap['D9'] = {
      code: 'D9',
      nameTamil: 'நவாம்சம் சக்கரம்',
      nameEnglish: 'Navamsa',
      division: 9,
      significanceTamil: 'திருமணம், வாழ்க்கைத் துணை, தர்ம பலம்',
      significanceEnglish: 'Marriage, spouse, inner strength',
      boxes: navamsamChart
    };
  }

  const availableKeys = Object.keys(chartsMap).length > 0
    ? Object.keys(chartsMap)
    : DEFAULT_CHART_KEYS.filter(k => chartsMap[k]);

  const activeChart = chartsMap[selectedChartKey] || chartsMap['D1'] || chartsMap[availableKeys[0]];

  return (
    <div id={id} className="bg-[#FFFDF5] border border-amber-900/30 rounded-xs p-3 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-900" />
          <h3 className="text-sm font-bold text-amber-950 font-serif">
            வர்க்க சக்கரங்கள் (D-Charts: D1 to D60)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-amber-100/60 p-0.5 rounded-xs border border-amber-900/20 text-xs">
            <button
              onClick={() => setViewMode('single')}
              className={`px-2 py-0.5 rounded-xs flex items-center gap-1 transition-colors ${
                viewMode === 'single'
                  ? 'bg-amber-900 text-white font-bold'
                  : 'text-amber-900 hover:bg-amber-200/50'
              }`}
            >
              <Eye className="w-3 h-3" /> தனிப்பட்ட பார்வை
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-0.5 rounded-xs flex items-center gap-1 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-amber-900 text-white font-bold'
                  : 'text-amber-900 hover:bg-amber-200/50'
              }`}
            >
              <Grid className="w-3 h-3" /> அனைத்து சக்கரங்கள் (Grid)
            </button>
          </div>
        </div>
      </div>

      {/* Selector Pills */}
      <div className="flex flex-wrap gap-1.5 mb-3 pb-2 border-b border-amber-900/15">
        {availableKeys.map(k => {
          const chart = chartsMap[k];
          const isSelected = selectedChartKey === k;
          return (
            <button
              key={k}
              onClick={() => setSelectedChartKey(k)}
              className={`px-2 py-1 text-xs rounded-xs font-semibold border transition-all ${
                isSelected
                  ? 'bg-amber-900 text-white border-amber-950 shadow-xs'
                  : 'bg-white text-neutral-800 border-amber-900/20 hover:bg-amber-100/50'
              }`}
            >
              <span className="font-mono mr-1 font-bold">{k}</span>
              <span>{chart ? chart.nameTamil : k}</span>
            </button>
          );
        })}
      </div>

      {/* Content View */}
      {viewMode === 'single' ? (
        activeChart ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="max-w-[340px] mx-auto w-full">
              <SouthIndianChart
                title={`${activeChart.code} - ${activeChart.nameTamil} (${activeChart.nameEnglish})`}
                boxes={activeChart.boxes}
                id={`chart-${activeChart.code}`}
              />
            </div>
            <div className="bg-amber-50/50 border border-amber-900/20 rounded-xs p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <span className="font-serif font-bold text-amber-950 text-base">
                  {activeChart.nameTamil} ({activeChart.nameEnglish})
                </span>
                <span className="font-mono text-xs font-bold bg-amber-200/60 px-2 py-0.5 rounded-xs border border-amber-900/20 text-amber-950">
                  {activeChart.code} (1/{activeChart.division} வர்க்கம்)
                </span>
              </div>
              <div className="text-xs space-y-1 text-neutral-800">
                <div>
                  <strong className="text-amber-950">முக்கியத்துவம் (Significance):</strong>
                  <p className="mt-0.5 text-neutral-700 leading-relaxed font-semibold">
                    {activeChart.significanceTamil}
                  </p>
                  <p className="text-[11px] text-neutral-500 italic mt-0.5">
                    {activeChart.significanceEnglish}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null
      ) : (
        /* Multi-grid view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableKeys.map(k => {
            const chart = chartsMap[k];
            if (!chart) return null;
            return (
              <div key={k} className="bg-white border border-amber-900/20 rounded-xs p-2 shadow-2xs">
                <SouthIndianChart
                  title={`${chart.code} - ${chart.nameTamil}`}
                  boxes={chart.boxes}
                  id={`chart-grid-${k}`}
                />
                <div className="text-[10px] text-neutral-600 text-center mt-1 font-semibold truncate">
                  {chart.significanceTamil}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
