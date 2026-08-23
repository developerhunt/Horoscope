import React from 'react';
import { ShadbalaData } from '../types';
import { Activity, Award, ShieldCheck, Zap } from 'lucide-react';

interface ShadbalaGraphProps {
  data?: ShadbalaData;
  shadbala?: ShadbalaData;
  id?: string;
}

export const ShadbalaGraph: React.FC<ShadbalaGraphProps> = ({
  data,
  shadbala,
  id = 'shadbala-section'
}) => {
  const activeData = data || shadbala;

  if (!activeData || !activeData.planets || activeData.planets.length === 0) {
    return null;
  }

  return (
    <div id={id} className="bg-[#FFFDF5] border border-amber-900/30 rounded-xs p-3 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-900" />
          <h3 className="text-sm font-bold text-amber-950 font-serif">
            ஷட்பல வலிமை அட்டவணை & ஒப்பீடு (Sixfold Planetary Strength)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-300">
            <Award className="w-3.5 h-3.5" /> முதன்மை பலம்: {activeData.strongestPlanet}
          </span>
          <span className="text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-xs border border-neutral-300">
            1 ரூபம் = 60 விரூபங்கள்
          </span>
        </div>
      </div>

      {/* Planetary Strengths Table & Visual Progress Meter */}
      <div className="space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-amber-900/20">
            <thead>
              <tr className="bg-amber-100/60 text-amber-950 font-serif border-b border-amber-900/30 text-center">
                <th className="p-1.5 border-r border-amber-900/20 text-left">கிரகம்</th>
                <th className="p-1.5 border-r border-amber-900/20" title="ஸ்தான பலம்">ஸ்தானம்</th>
                <th className="p-1.5 border-r border-amber-900/20" title="திக்க பலம்">திக்கு</th>
                <th className="p-1.5 border-r border-amber-900/20" title="கால பலம்">காலம்</th>
                <th className="p-1.5 border-r border-amber-900/20" title="சேஷ்டா பலம்">சேஷ்டை</th>
                <th className="p-1.5 border-r border-amber-900/20" title="நைசர்கிக பலம்">நைசர்கிகம்</th>
                <th className="p-1.5 border-r border-amber-900/20" title="திருக் பலம்">திருக்கு</th>
                <th className="p-1.5 border-r border-amber-900/20 font-bold bg-amber-200/50">மொத்த ரூபங்கள்</th>
                <th className="p-1.5 border-r border-amber-900/20">தேவை (ரூபம்)</th>
                <th className="p-1.5 border-r border-amber-900/20">விகிதம் (%)</th>
                <th className="p-1.5 border-r border-amber-900/20">வரிசை</th>
                <th className="p-1.5">நிலை</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/10">
              {activeData.planets.map((p, idx) => {
                const isSufficient = p.totalRupas >= p.requiredRupas;
                const ratioPct = Math.min(180, Math.round((p.totalRupas / p.requiredRupas) * 100));

                return (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}>
                    <td className="p-1.5 font-bold text-neutral-900 border-r border-amber-900/15 flex items-center justify-between">
                      <span>{p.planet}</span>
                      <span className="text-[10px] text-neutral-500 font-mono font-normal">({p.planetEnglish})</span>
                    </td>
                    <td className="p-1.5 text-center border-r border-amber-900/15 font-mono">{p.sthanaBala}</td>
                    <td className="p-1.5 text-center border-r border-amber-900/15 font-mono">{p.digBala}</td>
                    <td className="p-1.5 text-center border-r border-amber-900/15 font-mono">{p.kaalaBala}</td>
                    <td className="p-1.5 text-center border-r border-amber-900/15 font-mono">{p.chestaBala}</td>
                    <td className="p-1.5 text-center border-r border-amber-900/15 font-mono">{p.naisargikaBala}</td>
                    <td className="p-1.5 text-center border-r border-amber-900/15 font-mono">{p.drikBala}</td>
                    <td className="p-1.5 text-center font-bold text-amber-950 bg-amber-100/30 border-r border-amber-900/15 font-mono text-[13px]">
                      {p.totalRupas.toFixed(2)}
                    </td>
                    <td className="p-1.5 text-center border-r border-amber-900/15 text-neutral-600 font-mono">
                      {p.requiredRupas.toFixed(1)}
                    </td>
                    <td className="p-1.5 text-center border-r border-amber-900/15 font-mono font-semibold">
                      <span className={isSufficient ? 'text-emerald-700' : 'text-amber-800'}>
                        {ratioPct}%
                      </span>
                    </td>
                    <td className="p-1.5 text-center border-r border-amber-900/15 font-bold text-neutral-800 font-mono">
                      #{p.rank}
                    </td>
                    <td className="p-1.5 text-center">
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                          isSufficient
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                            : 'bg-amber-100 text-amber-900 border border-amber-400'
                        }`}
                      >
                        {isSufficient ? (
                          <>
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-700" />
                            வலுவானது
                          </>
                        ) : (
                          <>
                            <Zap className="w-2.5 h-2.5 text-amber-700" />
                            சராசரி
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Visual Strength Bar Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-amber-900/20">
          {activeData.planets.map((p, idx) => {
            const pct = Math.min(100, (p.totalRupas / (p.requiredRupas * 1.5)) * 100);
            const isSufficient = p.totalRupas >= p.requiredRupas;
            return (
              <div key={idx} className="bg-amber-50/40 p-1.5 rounded-xs border border-amber-900/15">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-amber-950 flex items-center gap-1">
                    <span className="w-4 text-center font-mono text-[11px] text-amber-800 font-bold">#{p.rank}</span>
                    {p.planet} ({p.planetEnglish})
                  </span>
                  <span className="font-mono text-[11px] text-neutral-700">
                    <strong className="text-amber-950">{p.totalRupas.toFixed(2)}</strong> / {p.requiredRupas.toFixed(1)} ரூபம் ({p.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-200 h-2 rounded-xs overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isSufficient ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
