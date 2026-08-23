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
    <div id={id} className="bg-[#FFFDF5] border border-amber-900/30 rounded-xs p-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-amber-900/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-900" />
          <h3 className="text-sm font-bold text-amber-950 font-serif">
            ஜைமினி காரகங்கள் (Jaimini 7-Karaka System)
          </h3>
        </div>
        <span className="text-xs text-amber-900/80 bg-amber-100/50 px-2 py-0.5 rounded-xs border border-amber-900/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-700" /> பாகை இறங்கு வரிசைப்படி
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse border border-amber-900/20">
          <thead>
            <tr className="bg-amber-100/60 text-amber-950 font-serif border-b border-amber-900/30">
              <th className="p-1.5 border-r border-amber-900/20 text-center w-12">காரகம்</th>
              <th className="p-1.5 border-r border-amber-900/20">காரகப் பெயர்</th>
              <th className="p-1.5 border-r border-amber-900/20 font-bold">அமர்ந்த கிரகம்</th>
              <th className="p-1.5 border-r border-amber-900/20">ராசிப் பாகை</th>
              <th className="p-1.5 border-r border-amber-900/20">அமர்ந்த ராசி</th>
              <th className="p-1.5">காரகத்துவம் & பலன் முக்கியத்துவம்</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-900/10">
            {activeKarakas.map((k, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}>
                <td className="p-1.5 text-center font-mono font-bold text-amber-900 bg-amber-50 border-r border-amber-900/15">
                  {k.karakaCode}
                </td>
                <td className="p-1.5 font-bold text-neutral-900 border-r border-amber-900/15">
                  <div>{k.karakaNameTamil}</div>
                  <div className="text-[10px] text-neutral-500 font-normal font-mono">({k.karakaNameEnglish})</div>
                </td>
                <td className="p-1.5 font-bold text-amber-950 border-r border-amber-900/15">
                  <span className="bg-amber-100/70 px-1.5 py-0.5 rounded-xs border border-amber-900/20">
                    {k.planetTamil} ({k.planetEnglish})
                  </span>
                </td>
                <td className="p-1.5 font-mono text-neutral-800 border-r border-amber-900/15">
                  {k.degreeFormatted}
                </td>
                <td className="p-1.5 font-semibold text-neutral-900 border-r border-amber-900/15">
                  {k.signTamil}
                </td>
                <td className="p-1.5 text-neutral-700 text-[11px] leading-snug">
                  <span className="font-semibold text-amber-950">{k.significanceTamil}</span>
                  <span className="text-neutral-500 ml-1">({k.significanceEnglish})</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
