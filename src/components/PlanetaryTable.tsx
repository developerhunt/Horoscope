import React from 'react';
import { PlanetaryDegree, DasaTimeline } from '../types';

interface PlanetaryTableProps {
  planetaryDegrees: PlanetaryDegree[];
  dasaTimelines: DasaTimeline[];
}

export const PlanetaryTable: React.FC<PlanetaryTableProps> = ({
  planetaryDegrees,
  dasaTimelines
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px] leading-tight text-neutral-900">
      
      {/* Left Side: Planetary Degrees Table (Planet, Degree, Star, Pada) */}
      <div className="flex flex-col border border-neutral-900 bg-[#FFFDF7] shadow-xs">
        <div className="bg-[#EDE3C8] text-center font-bold py-1 px-2 border-b border-neutral-900 text-[11px] text-amber-950 font-tamil">
          கிரக நிலை & பாகை அட்டவணை (Planetary Degrees)
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
                        ? 'bg-amber-100/60 font-bold'
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

      {/* Right Side: Dasa-Bhukti Timelines */}
      <div className="flex flex-col border border-neutral-900 bg-[#FFFDF7] shadow-xs">
        <div className="bg-[#EDE3C8] text-center font-bold py-1 px-2 border-b border-neutral-900 text-[11px] text-amber-950 font-tamil">
          விம்சோத்தரி தசா-புக்தி அட்டவணை (Dasa-Bhukti Timelines)
        </div>
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
              {dasaTimelines.map((dasa, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    dasa.isCurrent
                      ? 'bg-amber-200/70 font-bold text-amber-950'
                      : idx % 2 === 0
                      ? 'bg-white/60'
                      : 'bg-transparent'
                  }`}
                >
                  <td className="py-0.5 px-1.5 border-r border-neutral-300 font-medium">
                    {dasa.dasaLord} திசை
                    {dasa.isCurrent && (
                      <span className="ml-1 text-[8px] bg-red-700 text-white px-1 py-0.2 rounded font-normal">
                        நடப்பு
                      </span>
                    )}
                  </td>
                  <td className="py-0.5 px-1.5 border-r border-neutral-300 text-center font-mono text-[9.5px]">
                    {dasa.startDate}
                  </td>
                  <td className="py-0.5 px-1.5 border-r border-neutral-300 text-center font-mono text-[9.5px]">
                    {dasa.endDate}
                  </td>
                  <td className="py-0.5 px-1.5 text-center">
                    {dasa.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
