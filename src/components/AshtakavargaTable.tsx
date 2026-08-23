import React, { useState } from 'react';
import { AshtakavargaData } from '../types';
import { Grid, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

interface AshtakavargaTableProps {
  data?: AshtakavargaData;
  ashtakavarga?: AshtakavargaData;
  id?: string;
}

const RASI_TAMIL_SHORT = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்',
  'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்',
  'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'
];

export const AshtakavargaTable: React.FC<AshtakavargaTableProps> = ({
  data,
  ashtakavarga,
  id = 'ashtakavarga-section'
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'summary'>('matrix');
  const activeData = data || ashtakavarga;

  if (!activeData || !activeData.sarvashtakavarga) {
    return null;
  }

  return (
    <div id={id} className="bg-[#FFFDF5] border border-amber-900/30 rounded-xs p-3 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-amber-900" />
          <h3 className="text-sm font-bold text-amber-950 font-serif">
            பராசர அஷ்டகவர்க்க பரல்கள் அட்டவணை (Ashtakavarga Table)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-amber-100/60 p-0.5 rounded-xs border border-amber-900/20 text-xs">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-2 py-0.5 rounded-xs transition-colors ${
                activeTab === 'matrix' ? 'bg-amber-900 text-white font-bold' : 'text-amber-900 hover:bg-amber-200/50'
              }`}
            >
              விரிவான அட்டவணை (BAV)
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-2 py-0.5 rounded-xs transition-colors ${
                activeTab === 'summary' ? 'bg-amber-900 text-white font-bold' : 'text-amber-900 hover:bg-amber-200/50'
              }`}
            >
              சர்வாஷ்டகவர்க்கம் (SAV)
            </button>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 text-xs">
        <div className="bg-amber-50/60 border border-amber-900/20 p-2 rounded-xs flex items-center justify-between">
          <span className="text-neutral-700">மொத்த பரல்கள்:</span>
          <span className="font-mono font-bold text-amber-950 text-sm">{activeData.totalBindus}</span>
        </div>
        <div className="bg-emerald-50/60 border border-emerald-300 p-2 rounded-xs flex items-center justify-between">
          <span className="text-emerald-900 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" /> அதிக பலம் (உயர் ராசி):
          </span>
          <span className="font-bold text-emerald-950">
            {activeData.highestRasi?.signTamil} ({activeData.highestRasi?.bindus} பரல்)
          </span>
        </div>
        <div className="bg-red-50/60 border border-red-300 p-2 rounded-xs flex items-center justify-between">
          <span className="text-red-900 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-red-700" /> குறைந்த பரல் ராசி:
          </span>
          <span className="font-bold text-red-950">
            {activeData.lowestRasi?.signTamil} ({activeData.lowestRasi?.bindus} பரல்)
          </span>
        </div>
      </div>

      {/* Main Table */}
      {activeTab === 'matrix' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse border border-amber-900/20">
            <thead>
              <tr className="bg-amber-100/60 text-amber-950 font-serif border-b border-amber-900/30">
                <th className="p-1.5 border-r border-amber-900/20 text-left font-bold">கிரகம்</th>
                {RASI_TAMIL_SHORT.map((rasi, idx) => (
                  <th key={idx} className="p-1.5 border-r border-amber-900/20 font-bold min-w-[32px]">
                    {rasi}
                  </th>
                ))}
                <th className="p-1.5 font-bold bg-amber-200/50 min-w-[36px]">மொத்தம்</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/10">
              {activeData.planetScores &&
                activeData.planetScores.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}>
                    <td className="p-1.5 text-left font-bold text-neutral-900 border-r border-amber-900/15">
                      {row.planet}
                      <span className="text-[10px] text-neutral-500 ml-1 font-mono font-normal">
                        ({row.planetEnglish})
                      </span>
                    </td>
                    {row.bindus.map((b, sIdx) => (
                      <td
                        key={sIdx}
                        className={`p-1.5 border-r border-amber-900/15 font-mono ${
                          b >= 5 ? 'font-bold text-emerald-800 bg-emerald-50/40' : b <= 2 ? 'text-amber-800' : 'text-neutral-800'
                        }`}
                      >
                        {b}
                      </td>
                    ))}
                    <td className="p-1.5 font-bold font-mono text-amber-950 bg-amber-100/40">
                      {row.total}
                    </td>
                  </tr>
                ))}
              {/* Sarvashtakavarga Summary Row */}
              <tr className="bg-amber-200/60 font-bold text-amber-950 border-t-2 border-amber-900/40">
                <td className="p-1.5 text-left border-r border-amber-900/20 font-serif">
                  சர்வாஷ்டகவர்க்கம் (SAV)
                </td>
                {activeData.sarvashtakavarga.map((b, sIdx) => (
                  <td
                    key={sIdx}
                    className={`p-1.5 border-r border-amber-900/20 font-mono text-sm ${
                      b >= 30
                        ? 'text-emerald-900 font-extrabold bg-emerald-100/50'
                        : b <= 24
                        ? 'text-red-900 font-extrabold bg-red-100/50'
                        : 'text-amber-950'
                    }`}
                  >
                    {b}
                  </td>
                ))}
                <td className="p-1.5 font-extrabold font-mono text-sm bg-amber-300/60">
                  {activeData.totalBindus}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* SAV 12-Sign Grid Cards */
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {activeData.sarvashtakavarga.map((b, sIdx) => {
            const isHigh = b >= 30;
            const isLow = b <= 24;
            return (
              <div
                key={sIdx}
                className={`p-2 rounded-xs border text-center ${
                  isHigh
                    ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950'
                    : isLow
                    ? 'bg-red-50/80 border-red-300 text-red-950'
                    : 'bg-amber-50/50 border-amber-900/20 text-neutral-900'
                }`}
              >
                <div className="text-[11px] font-semibold text-neutral-600 mb-0.5">
                  {RASI_TAMIL_SHORT[sIdx]}
                </div>
                <div className="text-lg font-bold font-mono">{b}</div>
                <div className="text-[9px] font-semibold text-neutral-500 mt-0.5">
                  {isHigh ? 'சுப யோகம்' : isLow ? 'சுய முயற்சி' : 'சம நிலை'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
