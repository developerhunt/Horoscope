import React from 'react';
import { UpagrahaInfo } from '../types';
import { Moon, ShieldAlert } from 'lucide-react';

interface UpagrahasCardProps {
  upagrahas?: UpagrahaInfo[];
  id?: string;
}

export const UpagrahasCard: React.FC<UpagrahasCardProps> = ({ upagrahas, id = 'upagrahas-section' }) => {
  if (!upagrahas || upagrahas.length === 0) {
    return null;
  }

  return (
    <div id={id} className="bg-[#FFFDF5] border border-amber-900/30 rounded-xs p-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-amber-900/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-amber-900" />
          <h3 className="text-sm font-bold text-amber-950 font-serif">
            உபகிரகங்கள் விவரம் (Mandi & Gulika Position)
          </h3>
        </div>
        <span className="text-xs text-amber-900/80 bg-amber-100/50 px-2 py-0.5 rounded-xs border border-amber-900/20">
          8-பங்கு சூரிய/சனி கால கணக்கீடு
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {upagrahas.map((u, idx) => (
          <div
            key={idx}
            className="bg-amber-50/40 border border-amber-900/20 rounded-xs p-2.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-amber-900/15 pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-800 inline-block" />
                <span className="font-bold text-sm text-amber-950 font-serif">
                  {u.nameTamil} ({u.nameEnglish})
                </span>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-200/60 px-2 py-0.5 rounded-xs border border-amber-900/20 text-amber-950">
                {u.signTamil}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div>
                <span className="text-neutral-500 block text-[10px]">ராசிப் பாகை:</span>
                <span className="font-mono font-bold text-neutral-900">{u.degreeFormatted}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">நட்சத்திரம் & பாதம்:</span>
                <span className="font-semibold text-neutral-900">
                  {u.nakshatra} - {u.pada}-ம் பாதம்
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">நட்சத்திர அதிபதி:</span>
                <span className="font-semibold text-amber-900">{u.starLord}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">முழு பாகை (Absolute):</span>
                <span className="font-mono text-neutral-700">{u.rawLongitude.toFixed(2)}°</span>
              </div>
            </div>

            <div className="text-[11px] text-amber-950/80 bg-white/80 p-1.5 rounded-xs border border-amber-900/10 flex items-start gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>{u.significance}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
