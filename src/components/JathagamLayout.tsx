import React from 'react';
import { HoroscopeData } from '../types';
import { SouthIndianChart } from './SouthIndianChart';
import { PlanetaryTable } from './PlanetaryTable';
import { DSPredictionsDashboard } from './DSPredictionsDashboard';
import { ShadbalaGraph } from './ShadbalaGraph';
import { JaiminiTable } from './JaiminiTable';
import { AshtakavargaTable } from './AshtakavargaTable';
import { UpagrahasCard } from './UpagrahasCard';
import { DivisionalChartsGrid } from './DivisionalChartsGrid';
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
  const {
    basicDetails,
    planetaryDegrees,
    dasaTimelines,
    rasiChart,
    navamsamChart,
    footerInfo,
    panchangam,
    dsSystem,
    nadiAnalysis,
    specialPredictions,
    divisionalCharts,
    ashtakavarga,
    shadbala,
    jaiminiKarakas,
    upagrahas
  } = data;

  return (
    <div className="w-full flex flex-col items-center py-4 px-2">
      
      {/* Top Floating / Sticky Action Bar with Download Full PDF Button */}
      <div className="w-full max-w-[860px] flex flex-wrap items-center justify-between gap-3 mb-4 p-3 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg backdrop-blur-md no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            ௨
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-100 font-tamil">
              முழுமையான திருக்கணித ஜாதக அறிக்கை (Full Multi-Page Vedic Report)
            </h2>
            <p className="text-[11px] text-slate-400 font-sans">
              அனைத்து வர்க்க சக்கரங்கள், அஷ்டகவர்க்கம், ஷட்பலம், ஜைமினி & பலன்கள் அடங்கியது
            </p>
          </div>
        </div>

        {onDownloadPdf && (
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>{isDownloadingPdf ? 'PDF தயாராகிறது...' : 'முழு ஜாதகம் PDF Download'}</span>
          </button>
        )}
      </div>

      {/* MASTER REPORT CONTAINER (Captured completely by multi-page PDF generator) */}
      <div
        ref={containerRef}
        id="full-jathagam-report"
        className="w-full max-w-[860px] flex flex-col gap-6"
      >
        
        {/* ========================================================================= */}
        {/* PAGE 1: PRIMARY JATHAGAM SHEET (Basic Details, Planets, Dasa, Rasi, Navamsa) */}
        {/* ========================================================================= */}
        <div
          id="a4-jathagam-sheet-page-1"
          className="w-full bg-[#FDF7E3] text-neutral-900 border-2 border-neutral-900 shadow-2xl p-4 sm:p-6 font-tamil leading-relaxed select-text flex flex-col justify-between"
          style={{ boxSizing: 'border-box' }}
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

          {/* Section 2: Split Tables (Planetary Degrees & Dasa-Bhukti Timelines) */}
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
              {/* Rasi Chart with Ashtakavarga numbers */}
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

          {/* Mini Highlights: Jaimini AK & Mandi / Gulika */}
          {(jaiminiKarakas || upagrahas) && (
            <div className="my-1.5 border border-neutral-900 bg-[#FFFDF7] p-1.5 text-[9.5px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 divide-y sm:divide-y-0 sm:divide-x divide-neutral-300">
                {jaiminiKarakas && jaiminiKarakas.length > 0 && (
                  <div className="pr-1 flex items-center justify-between">
                    <span className="font-bold text-amber-950">ஆத்மகாரகன் (AK):</span>
                    <span className="font-semibold text-neutral-900">
                      {jaiminiKarakas[0].planetTamil} ({jaiminiKarakas[0].degreeFormatted} - {jaiminiKarakas[0].signTamil})
                    </span>
                  </div>
                )}
                {upagrahas && upagrahas.length > 0 && (
                  <div className="sm:pl-2 flex items-center justify-between">
                    <span className="font-bold text-amber-950">மாந்தி / குளிகன்:</span>
                    <span className="font-semibold text-neutral-900">
                      {upagrahas.map(u => `${u.nameTamil}: ${u.signTamil}`).join(' | ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Summary */}
          <div className="mt-1.5 border border-neutral-900 bg-[#FAF1DA] p-1.5 text-[9.5px]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 font-medium text-neutral-900">
              <div>✦ {footerInfo.janmaDasaIruppu}</div>
              <div>✦ {footerInfo.nadappuVayadu}</div>
              <div>✦ {footerInfo.nadappuDasaBhukti}</div>
            </div>
          </div>

        </div>

        {/* Page Break Line for PDF / Print */}
        <div className="page-break w-full my-2 border-b border-dashed border-slate-700/50 no-print" />

        {/* ========================================================================= */}
        {/* PAGE 2: DIVISIONAL CHARTS GRID (D1 to D60 - Shodasavarga Chakras) */}
        {/* ========================================================================= */}
        <div
          id="a4-jathagam-sheet-page-2"
          className="w-full bg-[#FDF7E3] text-neutral-900 border-2 border-neutral-900 shadow-2xl p-4 sm:p-6 font-tamil leading-relaxed select-text"
          style={{ boxSizing: 'border-box' }}
        >
          <DivisionalChartsGrid
            divisionalCharts={divisionalCharts}
            rasiChart={rasiChart}
            navamsamChart={navamsamChart}
            id="divisional-charts-module"
          />
        </div>

        {/* Page Break Line for PDF / Print */}
        <div className="page-break w-full my-2 border-b border-dashed border-slate-700/50 no-print" />

        {/* ========================================================================= */}
        {/* PAGE 3: ASHTAKAVARGA MATRIX & SHADBALA SIXFOLD PLANETARY STRENGTHS */}
        {/* ========================================================================= */}
        <div
          id="a4-jathagam-sheet-page-3"
          className="w-full bg-[#FDF7E3] text-neutral-900 border-2 border-neutral-900 shadow-2xl p-4 sm:p-6 font-tamil leading-relaxed select-text space-y-4"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Classical Ashtakavarga Full Analysis Table */}
          <AshtakavargaTable
            ashtakavarga={ashtakavarga}
            id="ashtakavarga-module"
          />

          {/* Shadbala (Sixfold Planetary Strengths) */}
          <ShadbalaGraph
            shadbala={shadbala}
            id="shadbala-module"
          />
        </div>

        {/* Page Break Line for PDF / Print */}
        <div className="page-break w-full my-2 border-b border-dashed border-slate-700/50 no-print" />

        {/* ========================================================================= */}
        {/* PAGE 4: JAIMINI KARAKAS & UPAGRAHAS */}
        {/* ========================================================================= */}
        <div
          id="a4-jathagam-sheet-page-4"
          className="w-full bg-[#FDF7E3] text-neutral-900 border-2 border-neutral-900 shadow-2xl p-4 sm:p-6 font-tamil leading-relaxed select-text space-y-4"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Header Title for Page 4 */}
          <div className="text-center border-b-2 border-neutral-900 pb-2">
            <div className="text-xl sm:text-2xl font-extrabold text-neutral-950 leading-none select-none tracking-widest mb-1">
              ௨
            </div>
            <div className="inline-block border border-neutral-900 bg-[#F7EED5] px-4 py-0.5 shadow-xs">
              <h2 className="text-xs sm:text-sm font-bold text-neutral-950 tracking-wider">
                ஜைமினி காரகங்கள் & உபகிரகங்கள் (Jaimini Karakas & Upagrahas)
              </h2>
            </div>
          </div>

          {/* Jaimini Karakas Table */}
          <JaiminiTable
            jaiminiKarakas={jaiminiKarakas}
            id="jaimini-module"
          />

          {/* Upagrahas Card (Mandi & Gulika) */}
          <UpagrahasCard
            upagrahas={upagrahas}
            id="upagrahas-module"
          />
        </div>

        {/* ========================================================================= */}
        {/* D.S. ASTRO SYSTEM & PREDICTIONS (EXCLUDED FROM PDF EXPORT) */}
        {/* ========================================================================= */}
        <div
          data-html2canvas-ignore="true"
          id="ds-astro-system-predictions-container"
          className="w-full space-y-6 mt-4 no-print"
        >
          {/* Advanced Vedic Insights Card (Nadi & D.S. Astro System) */}
          {(nadiAnalysis || dsSystem || (specialPredictions && specialPredictions.length > 0)) && (
            <div className="bg-[#FFFDF5] border border-amber-900/30 rounded-xs p-4 shadow-xs text-neutral-900 font-tamil">
              
              <div className="flex items-center gap-2 border-b border-amber-900/20 pb-2 mb-3">
                <Compass className="w-4 h-4 text-amber-900" />
                <h2 className="text-sm sm:text-base font-bold text-amber-950">
                  D.S. Astro System & நாடி சிறப்பு ஜோதிட விதிகள் (Special Astro Insights)
                </h2>
              </div>

              {/* D.S. System Special Predictive Rules Output */}
              {specialPredictions && specialPredictions.length > 0 && (
                <div className="mb-3 bg-amber-50/60 border border-amber-900/20 rounded-xs p-3 space-y-1.5">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                    <span>D.S. ஆஸ்ட்ரோ சிஸ்டம் சிறப்பு பலன்கள் & விதிகள் (D.S. System Predictions)</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {specialPredictions.map((pred, pIdx) => {
                      const isPositive = pred.includes('காதல் திருமணம்') || pred.includes('சிறப்பான') || pred.includes('சொந்தத் தொழில்') || pred.includes('யோகம்');
                      const isCaution = pred.includes('கடன்') || pred.includes('நோய்') || pred.includes('ஏமாற்றம்') || pred.includes('கவனம்') || pred.includes('தாமதம்') || pred.includes('எச்சரிக்கை');
                      
                      return (
                        <div
                          key={pIdx}
                          className={`p-2 rounded-xs border text-xs leading-relaxed flex items-start gap-2 ${
                            isCaution
                              ? 'bg-amber-100/50 border-amber-800/30 text-amber-950'
                              : isPositive
                              ? 'bg-emerald-50 border-emerald-700/30 text-emerald-950'
                              : 'bg-white border-amber-900/15 text-neutral-900'
                          }`}
                        >
                          <span className="text-amber-800 mt-0.5 select-none font-bold">✦</span>
                          <span>{pred}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                
                {/* Left: Nadi Directional Conjunctions & Yogas */}
                {nadiAnalysis && (
                  <div className="bg-amber-50/40 border border-amber-900/20 rounded-xs p-2.5 space-y-2">
                    <div className="font-bold text-amber-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                      <span>நாடி திசைவாரிக் கூட்டுக் கிரகங்கள் (Nadi Directional Trines)</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="bg-white p-1.5 rounded-xs border border-amber-900/15">
                        <span className="font-semibold text-neutral-700 block mb-0.5">கிழக்கு (East - 1,5,9):</span>
                        <span className="text-amber-950 font-medium">{nadiAnalysis.east.yoga}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-xs border border-amber-900/15">
                        <span className="font-semibold text-neutral-700 block mb-0.5">தெற்கு (South - 2,6,10):</span>
                        <span className="text-amber-950 font-medium">{nadiAnalysis.south.yoga}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-xs border border-amber-900/15">
                        <span className="font-semibold text-neutral-700 block mb-0.5">மேற்கு (West - 3,7,11):</span>
                        <span className="text-amber-950 font-medium">{nadiAnalysis.west.yoga}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-xs border border-amber-900/15">
                        <span className="font-semibold text-neutral-700 block mb-0.5">வடக்கு (North - 4,8,12):</span>
                        <span className="text-amber-950 font-medium">{nadiAnalysis.north.yoga}</span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-amber-900/15">
                      <span className="text-neutral-600 text-[11px] block mb-1">சிறப்பு நாடி யோகங்கள்:</span>
                      <div className="flex flex-wrap gap-1">
                        {nadiAnalysis.keyYogas.map((y, yIdx) => (
                          <span key={yIdx} className="bg-amber-100/70 border border-amber-900/20 text-amber-950 text-[10.5px] px-1.5 py-0.5 rounded-xs font-medium">
                            ✦ {y}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Right: D.S. System Rahu-Ketu Midpoint & Dasa Lagna */}
                {dsSystem && (
                  <div className="bg-amber-50/40 border border-amber-900/20 rounded-xs p-2.5 space-y-2">
                    <div className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Orbit className="w-3.5 h-3.5 text-amber-800" />
                      <span>D.S. சிஸ்டம் கர்ம அச்சு & தசாநாதன் லக்னம்</span>
                    </div>

                    {/* Rahu Ketu Midpoints */}
                    <div className="bg-white p-2 rounded-xs border border-amber-900/15 text-[11px] space-y-1">
                      <div className="flex justify-between text-neutral-800">
                        <span>ராகு-கேது மத்திய பாகை 1:</span>
                        <span className="font-mono text-amber-950 font-bold">{dsSystem.rahuKetuMidpoint1}</span>
                      </div>
                      <div className="flex justify-between text-neutral-800">
                        <span>ராகு-கேது மத்திய பாகை 2:</span>
                        <span className="font-mono text-amber-950 font-bold">{dsSystem.rahuKetuMidpoint2}</span>
                      </div>
                      <div className="text-[10.5px] text-neutral-600 mt-1">
                        {dsSystem.midpointHits.map((h, hIdx) => (
                          <div key={hIdx} className="text-emerald-800 font-semibold">✦ {h}</div>
                        ))}
                      </div>
                    </div>

                    {/* Thasanathan Lagna & Dusthana */}
                    <div className="bg-white p-2 rounded-xs border border-amber-900/15 text-[11px] space-y-1">
                      <div className="flex justify-between text-neutral-800 font-medium">
                        <span>நடப்பு தசாநாதன் லக்னம்:</span>
                        <span className="text-amber-950 font-bold">{dsSystem.dasaLagnaSign} ({dsSystem.currentDasaLord} திசை)</span>
                      </div>
                      <div className="text-[10.5px] text-neutral-700 pt-1 space-y-0.5">
                        {dsSystem.dusthanaSummary.map((d, dIdx) => (
                          <div key={dIdx}>✦ {d}</div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>
          )}

          {/* D.S. Astro System Comprehensive Rules & Predictions Dashboard */}
          <div className="w-full">
            <DSPredictionsDashboard data={data} />
          </div>

        </div>

      </div>

    </div>
  );
};

