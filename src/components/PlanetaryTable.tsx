import React, { useState } from 'react';
import { PlanetaryDegree, DasaTimeline } from '../types';
import { Sparkles, Calendar, ChevronRight } from 'lucide-react';

interface PlanetaryTableProps {
  planetaryDegrees: PlanetaryDegree[];
  dasaTimelines: DasaTimeline[];
}

export const PlanetaryTable: React.FC<PlanetaryTableProps> = ({
  planetaryDegrees,
  dasaTimelines
}) => {
  const [viewMode, setViewMode] = useState<'dasas' | 'bhuktis'>('dasas');
  const activeDasa = dasaTimelines.find(d => d.isCurrent) || dasaTimelines[0];
  const [selectedDasaLord, setSelectedDasaLord] = useState<string>(activeDasa?.dasaLord || '');

  const currentViewingDasa = dasaTimelines.find(d => d.dasaLord === selectedDasaLord) || activeDasa;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px] leading-tight text-neutral-900">
      
      {/* Left Side: Planetary Degrees Table (Planet, Degree, Star, Pada) */}
      <div className="flex flex-col border border-neutral-900 bg-[#FFFDF7] shadow-xs">
        <div className="bg-[#EDE3C8] text-center font-bold py-1 px-2 border-b border-neutral-900 text-[11px] text-amber-950 font-tamil flex items-center justify-center gap-1">
          <span>கிரக நிலை & பாகை அட்டவணை (Planetary Degrees)</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#F5EDD5] border-b border-neutral-800 text-[10px] font-bold text-neutral-900">
                <th className="py-1 px-1.5 border-r border-neutral-400">கிரகம் (Planet)</th>
                <th className="py-1 px-1.5 border-r border-neutral-400 text-center">பாகை (Degree)</th>
                <th className="py-1 px-1.5 border-r border-neutral-400">நட்சத்திரம் (Star)</th>
                <th className="py-1 px-1.5 text-center">பாதம்</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-300">
              {planetaryDegrees.map((item, idx) => {
                const isLagna = item.planet.includes('லக்னம்');
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-[#F7F0DC] transition-colors ${
                      isLagna
                        ? 'bg-amber-100/70 font-bold'
                        : idx % 2 === 0
                        ? 'bg-white/60'
                        : 'bg-transparent'
                    }`}
                  >
                    <td className="py-0.5 px-1.5 border-r border-neutral-300 font-medium flex items-center justify-between">
                      <span>{item.planet}</span>
                      {item.isRetrograde && (
                        <span className="text-[8.5px] text-indigo-800 bg-indigo-100 px-1 rounded font-bold">
                          (வ)
                        </span>
                      )}
                    </td>
                    <td className="py-0.5 px-1.5 border-r border-neutral-300 font-mono text-[9.5px] text-center">
                      {item.degree}
                    </td>
                    <td className="py-0.5 px-1.5 border-r border-neutral-300">
                      {item.star}
                    </td>
                    <td className="py-0.5 px-1.5 text-center font-bold text-neutral-800">
                      {item.pada}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Side: Dasa-Bhukti Timelines with View Mode Toggle */}
      <div className="flex flex-col border border-neutral-900 bg-[#FFFDF7] shadow-xs">
        <div className="bg-[#EDE3C8] py-1 px-2 border-b border-neutral-900 text-[11px] text-amber-950 font-tamil flex items-center justify-between">
          <span className="font-bold">விம்சோத்தரி தசா-புக்தி அட்டவணை</span>
          <div className="flex items-center gap-1 no-print">
            <button
              type="button"
              onClick={() => setViewMode('dasas')}
              className={`px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer transition-all ${
                viewMode === 'dasas'
                  ? 'bg-amber-900 text-amber-100 shadow-xs'
                  : 'bg-amber-200/80 text-amber-900 hover:bg-amber-300'
              }`}
            >
              திசைகள் (9)
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeDasa) setSelectedDasaLord(activeDasa.dasaLord);
                setViewMode('bhuktis');
              }}
              className={`px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer transition-all flex items-center gap-0.5 ${
                viewMode === 'bhuktis'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-amber-200/80 text-amber-900 hover:bg-amber-300'
              }`}
            >
              <span>புக்திகள்</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block animate-ping" />
            </button>
          </div>
        </div>

        {/* View Mode 1: 9 Dasas Overview */}
        {viewMode === 'dasas' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[10px]">
              <thead>
                <tr className="bg-[#F5EDD5] border-b border-neutral-800 font-bold text-neutral-900">
                  <th className="py-1 px-1.5 border-r border-neutral-400">திசை (Dasa)</th>
                  <th className="py-1 px-1.5 border-r border-neutral-400 text-center">தொடக்கம்</th>
                  <th className="py-1 px-1.5 border-r border-neutral-400 text-center">முடிவு</th>
                  <th className="py-1 px-1.5 text-center">கால அளவு</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-300">
                {dasaTimelines.map((dasa, idx) => {
                  const isCurrent = dasa.isCurrent;
                  return (
                    <tr
                      key={idx}
                      onClick={() => {
                        setSelectedDasaLord(dasa.dasaLord);
                        if (dasa.bhuktis && dasa.bhuktis.length > 0) {
                          setViewMode('bhuktis');
                        }
                      }}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-yellow-100 text-red-600 font-bold border-l-2 border-red-600'
                          : idx % 2 === 0
                          ? 'bg-white/60 hover:bg-[#FBF4E4]'
                          : 'bg-transparent hover:bg-[#FBF4E4]'
                      }`}
                    >
                      <td className="py-0.5 px-1.5 border-r border-neutral-300 font-medium">
                        <div className="flex items-center justify-between">
                          <span className={isCurrent ? 'text-red-600 font-bold' : 'text-neutral-900'}>
                            {dasa.dasaLord} திசை
                          </span>
                          {isCurrent && (
                            <span className="text-[8px] bg-red-600 text-white px-1 py-0.2 rounded font-bold ml-1 shadow-xs">
                              நடப்பு
                            </span>
                          )}
                        </div>
                        {isCurrent && dasa.activeBhukti && (
                          <div className="text-[8.5px] text-red-700 font-semibold mt-0.5 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 inline text-red-600" />
                            <span>{dasa.activeBhukti}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-0.5 px-1.5 border-r border-neutral-300 text-center font-mono text-[9px]">
                        {dasa.startDate}
                      </td>
                      <td className="py-0.5 px-1.5 border-r border-neutral-300 text-center font-mono text-[9px]">
                        {dasa.endDate}
                      </td>
                      <td className="py-0.5 px-1.5 text-center text-[9.5px]">
                        {dasa.duration}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* View Mode 2: Bhuktis of Selected/Current Dasa */}
        {viewMode === 'bhuktis' && currentViewingDasa && (
          <div className="flex flex-col">
            {/* Bhukti selector header */}
            <div className="bg-[#F8EFE0] px-2 py-1 border-b border-neutral-400 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 font-bold text-amber-950">
                <span>{currentViewingDasa.dasaLord} திசையின் 9 புக்திகள்:</span>
                {currentViewingDasa.isCurrent && (
                  <span className="text-[8px] bg-red-600 text-white px-1 py-0.2 rounded font-bold">
                    நடப்பு திசை
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 no-print">
                <select
                  value={currentViewingDasa.dasaLord}
                  onChange={(e) => setSelectedDasaLord(e.target.value)}
                  aria-label="Select Dasa"
                  className="bg-white border border-neutral-400 rounded px-1 py-0.5 text-[9px] font-bold text-neutral-800"
                >
                  {dasaTimelines.map((d, dIdx) => (
                    <option key={dIdx} value={d.dasaLord}>
                      {d.dasaLord} திசை {d.isCurrent ? '(நடப்பு)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[10px]">
                <thead>
                  <tr className="bg-[#F5EDD5] border-b border-neutral-800 font-bold text-neutral-900">
                    <th className="py-1 px-1.5 border-r border-neutral-400">புக்தி (Bhukti)</th>
                    <th className="py-1 px-1.5 border-r border-neutral-400 text-center">தொடக்கம்</th>
                    <th className="py-1 px-1.5 border-r border-neutral-400 text-center">முடிவு</th>
                    <th className="py-1 px-1.5 text-center">கால அளவு</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-300">
                  {currentViewingDasa.bhuktis && currentViewingDasa.bhuktis.length > 0 ? (
                    currentViewingDasa.bhuktis.map((bhukti, bIdx) => {
                      const isCurrentBhukti = bhukti.isCurrent;
                      return (
                        <tr
                          key={bIdx}
                          className={`transition-colors ${
                            isCurrentBhukti
                              ? 'bg-yellow-100 text-red-600 font-bold border-l-2 border-red-600'
                              : bIdx % 2 === 0
                              ? 'bg-white/60'
                              : 'bg-transparent'
                          }`}
                        >
                          <td className="py-0.5 px-1.5 border-r border-neutral-300 font-medium">
                            <div className="flex items-center justify-between">
                              <span className={isCurrentBhukti ? 'text-red-600 font-bold' : 'text-neutral-900'}>
                                {bhukti.bhuktiLord} புக்தி
                              </span>
                              {isCurrentBhukti && (
                                <span className="text-[8px] bg-red-600 text-white px-1 py-0.2 rounded font-bold ml-1 shadow-xs animate-pulse">
                                  நடப்பு
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-neutral-300 text-center font-mono text-[9px]">
                            {bhukti.startDate}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-neutral-300 text-center font-mono text-[9px]">
                            {bhukti.endDate}
                          </td>
                          <td className="py-0.5 px-1.5 text-center text-[9.5px]">
                            {bhukti.duration}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-2 text-neutral-500">
                        புக்தி விபரம் இல்லை
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Back button */}
            <div className="p-1 bg-[#FAF2DC] border-t border-neutral-300 text-right no-print">
              <button
                type="button"
                onClick={() => setViewMode('dasas')}
                className="text-[9px] text-amber-900 font-bold hover:underline cursor-pointer flex items-center justify-end gap-0.5 ml-auto"
              >
                <span>முழு திசை அட்டவணைக்குத் திரும்பு</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
