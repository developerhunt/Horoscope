import React from 'react';
import { JaiminiKaraka } from '../types';
import { Compass, Sparkles } from 'lucide-react';

interface JaiminiTableProps {
  karakas?: JaiminiKaraka[];
  jaiminiKarakas?: JaiminiKaraka[];
  id?: string;
}

export const JaiminiTable: React.FC<JaiminiTableProps> = ({
  karakas,
  jaiminiKarakas,
  id = 'jaimini-section'
}) => {
  const activeKarakas = karakas || jaiminiKarakas;

  if (!activeKarakas || activeKarakas.length === 0) {
    return null;
  }

  return (
    <div id={id} className="bg-[#FFFDF5] border border-amber-900/30 rounded-xs p-2.5 sm:p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-amber-900/20 pb-2 mb-2 sm:mb-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Compass className="w-4 h-4 text-amber-900 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-amber-950 font-serif">
            ஜைமினி காரகங்கள் (Jaimini 7-Karaka System)
          </h3>
        </div>
        <span className="text-[10px] sm:text-xs text-amber-900/80 bg-amber-100/50 px-1.5 py-0.5 rounded-xs border border-amber-900/20 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-700" /> பாகை இறங்கு வரிசை
        </span>
      </div>

      <div className="w-full">
        <table className="w-full table-fixed text-left text-[10px] md:text-sm border-collapse border border-amber-900/20">
          <thead>
            <tr className="bg-amber-100/70 text-amber-950 font-serif border-b border-amber-900/30 text-[9px] sm:text-[10.5px] md:text-xs">
              <th className="px-1 py-1.5 border-r border-amber-900/20 text-center w-[11%]">காரகம்</th>
              <th className="px-1 py-1.5 border-r border-amber-900/20 w-[20%]">காரகப் பெயர்</th>
              <th className="px-1 py-1.5 border-r border-amber-900/20 font-bold w-[18%]">கிரகம்</th>
              <th className="px-1 py-1.5 border-r border-amber-900/20 w-[14%]">பாகை</th>
              <th className="px-1 py-1.5 border-r border-amber-900/20 w-[15%]">ராசி</th>
              <th className="px-1 py-1.5 w-[22%]">காரகத்துவம்</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-900/10">
            {activeKarakas.map((k, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}>
                <td className="px-1 py-1.5 text-center font-mono font-bold text-amber-900 bg-amber-50/80 border-r border-amber-900/15 text-[9.5px] sm:text-[10.5px] md:text-xs truncate">
                  {k.karakaCode}
                </td>
                <td className="px-1 py-1.5 font-bold text-neutral-900 border-r border-amber-900/15 leading-tight">
                  <div className="text-[9.5px] sm:text-[10.5px] md:text-xs truncate">{k.karakaNameTamil}</div>
                  <div className="text-[8px] sm:text-[9px] text-neutral-500 font-normal font-mono truncate">({k.karakaNameEnglish})</div>
                </td>
                <td className="px-1 py-1.5 font-bold text-amber-950 border-r border-amber-900/15 leading-tight">
                  <span className="bg-amber-100/70 px-1 py-0.5 rounded-xs border border-amber-900/20 text-[9px] sm:text-[10px] md:text-xs inline-block truncate max-w-full">
                    {k.planetTamil}
                  </span>
                </td>
                <td className="px-1 py-1.5 font-mono text-neutral-800 border-r border-amber-900/15 text-[9px] sm:text-[10px] md:text-xs truncate">
                  {k.degreeFormatted}
                </td>
                <td className="px-1 py-1.5 font-semibold text-neutral-900 border-r border-amber-900/15 text-[9.5px] sm:text-[10.5px] md:text-xs truncate">
                  {k.signTamil}
                </td>
                <td className="px-1 py-1.5 text-neutral-700 text-[8.5px] sm:text-[9.5px] md:text-[11px] leading-tight break-words">
                  <span className="font-semibold text-amber-950 block">{k.significanceTamil}</span>
                  <span className="text-neutral-500 text-[8px] sm:text-[9px] truncate block">({k.significanceEnglish})</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
