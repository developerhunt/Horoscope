import React from 'react';
import { HoroscopeData } from '../types';
import { SouthIndianChart } from './SouthIndianChart';
import { PlanetaryTable } from './PlanetaryTable';
import { DSPredictionsDashboard } from './DSPredictionsDashboard';
import { Download, Compass, ShieldCheck, Orbit, Sparkles } from 'lucide-react';

interface JathagamLayoutProps {
  data: HoroscopeData;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onDownloadPdf?: () => void;
  isDownloadingPdf?: boolean;
}

export const JathagamLayout: React.FC<JathagamLayoutProps> = ({
  data,
  containerRef,
  onDownloadPdf,
  isDownloadingPdf = false
}) => {
  const { basicDetails, planetaryDegrees, dasaTimelines, rasiChart, navamsamChart, footerInfo, panchangam, dsSystem, nadiAnalysis, specialPredictions } = data;

  return (
    <div className="w-full flex flex-col items-center py-4 px-2">
      
      {/* Top Bar with Download PDF Button */}
      <div className="w-full max-w-[820px] flex items-center justify-between mb-3 no-print">
        <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
          <Orbit className="w-3.5 h-3.5 text-amber-400" />
          <span>திருக்கணித முறைப்படி கணிக்கப்பட்ட ஜாதக கட்டம் (A4 Printable Format)</span>
        </span>
        {onDownloadPdf && (
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>{isDownloadingPdf ? 'PDF தயாராகிறது...' : 'Download PDF'}</span>
          </button>
        )}
      </div>

      {/* A4 Jathagam Printable Sheet Container */}
      <div
        ref={containerRef}
        id="a4-jathagam-sheet"
        className="w-full max-w-[820px] bg-[#FDF7E3] text-neutral-900 border-2 border-neutral-900 shadow-2xl p-4 sm:p-6 relative font-tamil leading-relaxed select-text flex flex-col justify-between"
        style={{
          boxSizing: 'border-box'
        }}
      >
        {/* Header: Center-aligned "௨" and Main Title inside border */}
        <div className="text-center mb-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 leading-none select-none tracking-widest">
            ௨
          </div>
          <div className="mt-1.5">
            <div className="inline-block border-2 border-neutral-900 bg-[#F7EED5] px-6 sm:px-10 py-0.5 shadow-xs">
              <h1 className="text-sm sm:text-base font-bold text-neutral-950 tracking-wider">
                {data.title || 'திருக்கணிதப்படி ஜாதகம்'}
              </h1>
            </div>
          </div>
        </div>

        {/* Section 1: Basic Details (2-Column Balanced HTML Table) */}
        <div className="my-1.5 border border-neutral-900 bg-[#FFFDF7] shadow-xs">
          <div className="bg-[#EFE6CE] text-center font-bold py-0.5 border-b border-neutral-900 text-[10.5px] text-neutral-950">
            ஜாதகர் விபரங்கள் (Basic Details)
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-900 text-[10px]">
            
            {/* Left Column: Name, Father, Mother, DOB, TOB, POB, Nakshatram, Rasi */}
            <div className="divide-y divide-neutral-300">
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">{basicDetails.genderLabel}:</span>
                <span className="font-bold text-neutral-950">{basicDetails.name}</span>
              </div>
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">தகப்பனார்:</span>
                <span className="font-medium text-neutral-900">{basicDetails.fatherName}</span>
              </div>
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">தாயார்:</span>
                <span className="font-medium text-neutral-900">{basicDetails.motherName}</span>
              </div>
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">பிறந்த தேதி:</span>
                <span className="font-medium text-neutral-900">{basicDetails.dob}</span>
              </div>
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">பிறந்த நேரம்:</span>
                <span className="font-medium text-neutral-900">{basicDetails.tob}</span>
              </div>
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">பிறந்த ஊர்:</span>
                <span className="font-medium text-neutral-900">{basicDetails.pob}</span>
              </div>
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">நட்சத்திரம்:</span>
                <span className="font-bold text-amber-950">{basicDetails.nakshatra}</span>
              </div>
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">ஜென்ம ராசி:</span>
                <span className="font-bold text-amber-950">{basicDetails.rasi}</span>
              </div>
            </div>

            {/* Right Column: Lat/Long, Ayanamsa, Lagna, Sunrise, Thithi, Age, Dasa Details */}
            <div className="divide-y divide-neutral-300">
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">அட்ச / தீர்க்க ரேகை:</span>
                <span className="font-mono text-[9.5px] font-medium text-neutral-900">{basicDetails.latLong}</span>
              </div>
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">அயனாம்சம்:</span>
                <span className="font-medium text-neutral-900">{basicDetails.ayanamsa}</span>
              </div>
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">ஜென்ம லக்னம்:</span>
                <span className="font-bold text-red-800">{basicDetails.lagna}</span>
              </div>
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">சூரிய உதயம்:</span>
                <span className="font-medium text-neutral-900">{basicDetails.sunrise}</span>
              </div>
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">திதி:</span>
                <span className="font-medium text-neutral-900">{basicDetails.thithi}</span>
              </div>
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">யோகம் / கரணம்:</span>
                <span className="font-medium text-neutral-900">
                  {panchangam ? `${panchangam.nithyaYoga} / ${panchangam.karana}` : 'சித்த யோகம் / பவ கரணம்'}
                </span>
              </div>
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">நடப்பு வயது:</span>
                <span className="font-medium text-neutral-900">{footerInfo.nadappuVayadu.replace('நடப்பு வயது: ', '')}</span>
              </div>
              <div className="flex justify-between py-0.5 px-2 hover:bg-[#F9F3DE]">
                <span className="font-semibold text-neutral-800">தசா இருப்பு:</span>
                <span className="font-medium text-neutral-900">{footerInfo.janmaDasaIruppu.replace('ஜென்ம கால தசா இருப்பு: ', '')}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Split Tables (Left: Planetary Degrees, Right: Dasa-Bhukti Timelines) */}
        <div className="my-1.5">
          <PlanetaryTable
            planetaryDegrees={planetaryDegrees}
            dasaTimelines={dasaTimelines}
          />
        </div>

        {/* Section 3: Two 4x4 CSS Grids for Rasi and Navamsa with merged 2x2 centers & outer bindus */}
        <div className="my-1.5 border border-neutral-900 bg-[#FFFDF7] p-2 shadow-xs">
          <div className="bg-[#EDE3C8] text-center font-bold py-0.5 border-b border-neutral-900 text-[10.5px] text-neutral-950 font-tamil mb-1.5">
            இராசி & நவாம்ச கட்டங்கள் (Chakras)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 items-center justify-items-center">
            {/* Rasi Chart with Ashtakavarga numbers positioned outside the outer border */}
            <div className="w-full flex flex-col items-center">
              <SouthIndianChart
                title="இராசி"
                boxes={rasiChart}
                showAshtakavarga={true}
                id="rasi-chart"
              />
            </div>

            {/* Navamsa Chart */}
            <div className="w-full flex flex-col items-center">
              <SouthIndianChart
                title="நவாம்சம்"
                boxes={navamsamChart}
                showAshtakavarga={false}
                id="navamsam-chart"
              />
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="mt-1.5 border border-neutral-900 bg-[#FAF1DA] p-1.5 text-[9.5px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 font-medium text-neutral-900">
            <div>✦ {footerInfo.janmaDasaIruppu}</div>
            <div>✦ {footerInfo.nadappuVayadu}</div>
            <div>✦ {footerInfo.nadappuDasaBhukti}</div>
          </div>
        </div>

      </div>

      {/* Advanced Vedic Insights Card (Nadi & D.S. Astro System) */}
      {(nadiAnalysis || dsSystem || (specialPredictions && specialPredictions.length > 0)) && (
        <div className="w-full max-w-[820px] mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 no-print font-sans">
          
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <Compass className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm sm:text-base font-bold font-tamil text-amber-300">
              D.S. Astro System & நாடி சிறப்பு ஜோதிட விதிகள் (Special Astro Insights)
            </h2>
          </div>

          {/* D.S. System Special Predictive Rules Output */}
          {specialPredictions && specialPredictions.length > 0 && (
            <div className="mb-4 bg-slate-950/80 border border-amber-900/40 rounded-xl p-4 space-y-2">
              <div className="font-bold text-amber-300 font-tamil flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>D.S. ஆஸ்ட்ரோ சிஸ்டம் சிறப்பு பலன்கள் & விதிகள் (D.S. System Predictions)</span>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {specialPredictions.map((pred, pIdx) => {
                  const isPositive = pred.includes('காதல் திருமணம்') || pred.includes('சிறப்பான') || pred.includes('சொந்தத் தொழில்') || pred.includes('யோகம்');
                  const isCaution = pred.includes('கடன்') || pred.includes('நோய்') || pred.includes('ஏமாற்றம்') || pred.includes('கவனம்') || pred.includes('தாமதம்') || pred.includes('எச்சரிக்கை');
                  
                  return (
                    <div
                      key={pIdx}
                      className={`p-2.5 rounded-lg border text-xs leading-relaxed font-tamil flex items-start gap-2 ${
                        isCaution
                          ? 'bg-amber-950/20 border-amber-800/40 text-amber-100'
                          : isPositive
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-100'
                          : 'bg-slate-900/80 border-slate-800 text-slate-200'
                      }`}
                    >
                      <span className="text-amber-400 mt-0.5 select-none font-bold">✦</span>
                      <span>{pred}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* Left: Nadi Directional Conjunctions & Yogas */}
            {nadiAnalysis && (
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
                <div className="font-bold text-amber-400 font-tamil flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>நாடி திசைவாரிக் கூட்டுக் கிரகங்கள் (Nadi Directional Trines)</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300 block mb-0.5">கிழக்கு (East - 1,5,9):</span>
                    <span className="text-amber-200">{nadiAnalysis.east.yoga}</span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300 block mb-0.5">தெற்கு (South - 2,6,10):</span>
                    <span className="text-amber-200">{nadiAnalysis.south.yoga}</span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300 block mb-0.5">மேற்கு (West - 3,7,11):</span>
                    <span className="text-amber-200">{nadiAnalysis.west.yoga}</span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="font-semibold text-slate-300 block mb-0.5">வடக்கு (North - 4,8,12):</span>
                    <span className="text-amber-200">{nadiAnalysis.north.yoga}</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400 text-[11px] block mb-1">சிறப்பு நாடி யோகங்கள்:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {nadiAnalysis.keyYogas.map((y, yIdx) => (
                      <span key={yIdx} className="bg-amber-950/50 border border-amber-800/50 text-amber-300 text-[10.5px] px-2 py-0.5 rounded-md font-medium font-tamil">
                        ✦ {y}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Right: D.S. System Rahu-Ketu Midpoint & Dasa Lagna */}
            {dsSystem && (
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
                <div className="font-bold text-amber-400 font-tamil flex items-center gap-1.5">
                  <Orbit className="w-3.5 h-3.5" />
                  <span>D.S. சிஸ்டம் கர்ம அச்சு & தசாநாதன் லக்னம்</span>
                </div>

                {/* Rahu Ketu Midpoints */}
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>ராகு-கேது மத்திய பாகை 1:</span>
                    <span className="font-mono text-amber-300">{dsSystem.rahuKetuMidpoint1}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>ராகு-கேது மத்திய பாகை 2:</span>
                    <span className="font-mono text-amber-300">{dsSystem.rahuKetuMidpoint2}</span>
                  </div>
                  <div className="text-[10.5px] text-slate-400 mt-1">
                    {dsSystem.midpointHits.map((h, hIdx) => (
                      <div key={hIdx} className="text-emerald-400 font-medium font-tamil">✦ {h}</div>
                    ))}
                  </div>
                </div>

                {/* Thasanathan Lagna & Dusthana */}
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>நடப்பு தசாநாதன் லக்னம்:</span>
                    <span className="text-amber-300 font-tamil font-bold">{dsSystem.dasaLagnaSign} ({dsSystem.currentDasaLord} திசை)</span>
                  </div>
                  <div className="text-[10.5px] text-slate-400 pt-1 space-y-0.5 font-tamil">
                    {dsSystem.dusthanaSummary.map((d, dIdx) => (
                      <div key={dIdx} className="text-slate-300">✦ {d}</div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* D.S. Astro System Comprehensive Rules & Predictions Dashboard */}
      <div className="w-full max-w-[820px] mt-6 no-print">
        <DSPredictionsDashboard data={data} />
      </div>

    </div>
  );
};
