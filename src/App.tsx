import React, { useState, useRef } from 'react';
import { HoroscopeInput, HoroscopeData } from './types';
import { calculateHoroscope, enrichBackendDataWithPredictions } from './data/astroEngine';
import { InputForm } from './components/InputForm';
import { JathagamLayout } from './components/JathagamLayout';
import { exportToPdf } from './utils/pdfExport';
import { ArrowLeft, Check, Download, Compass } from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState<HoroscopeInput>({
    name: '',
    gender: 'ஆண்',
    fatherName: '',
    motherName: '',
    dob: '',
    tob: '',
    pob: '',
    lat: undefined,
    lon: undefined
  });
  
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showPdfSuccess, setShowPdfSuccess] = useState(false);
  const [generationStepText, setGenerationStepText] = useState('');

  const jathagamContainerRef = useRef<HTMLDivElement>(null);

  // Handle Form Submission: Attempts backend API with instant built-in engine fallback
  const handleFormSubmit = async (data: HoroscopeInput) => {
    setIsGenerating(true);
    setFormData(data);
    setGenerationStepText('திருக்கணித பஞ்சாங்க கணிப்புகள் துவங்குகிறது...');

    try {
      // AbortController for checking FastAPI backend via Vite proxy
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        const response = await fetch('/api/v1/generate-horoscope', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const calculatedData = await response.json();
          const enrichedData = enrichBackendDataWithPredictions(calculatedData);
          setHoroscopeData(enrichedData);
          setTimeout(() => {
            jathagamContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
          return;
        }
      } catch {
        // Fall through cleanly to built-in high precision astronomical engine
      }

      // Built-in Thirukanidappadi Astro Engine & D.S. Astro System calculation
      setGenerationStepText('கிரக நிலைகள், நவாம்சம் மற்றும் D.S. ஆஸ்ட்ரோ விதிகள் கணிக்கப்படுகிறது...');
      const calculatedData = calculateHoroscope(data);
      setHoroscopeData(calculatedData);
      
      // Smooth scroll down to generated A4 jathagam view
      setTimeout(() => {
        jathagamContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (error) {
      console.error('Error generating horoscope:', error);
      const fallbackData = calculateHoroscope(data);
      setHoroscopeData(fallbackData);
    } finally {
      setIsGenerating(false);
      setGenerationStepText('');
    }
  };

  // Handle PDF Export
  const handleDownloadPdf = async () => {
    if (!jathagamContainerRef.current) return;
    setIsDownloadingPdf(true);

    const safeName = (formData.name || 'Jathagam').replace(/\s+/g, '_');
    const fileName = `${safeName}_Thirukanidappadi_Jathagam.pdf`;

    const success = await exportToPdf(jathagamContainerRef.current, fileName);
    setIsDownloadingPdf(false);

    if (success) {
      setShowPdfSuccess(true);
      setTimeout(() => setShowPdfSuccess(false), 3500);
    }
  };

  return (
    <div className="min-h-screen h-auto bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden overflow-y-visible">
      
      {/* Top Minimal Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3 sticky top-0 z-50 no-print">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-amber-400 font-tamil">௨</span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-bold text-sm sm:text-base text-slate-100 font-tamil">
                திருக்கணித ஜோதிட கணிப்பான்
              </span>
              <span className="text-[10px] text-amber-400/80 bg-amber-950/40 border border-amber-800/50 px-1.5 py-0.5 rounded font-mono hidden sm:inline">
                A4 Printable Jathagam
              </span>
            </div>
          </div>

          {horoscopeData && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>விபரம் மாற்ற</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloadingPdf ? 'தயாராகிறது...' : 'முழு PDF பதிவிறக்கம்'}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* PDF Download Success Toast */}
      {showPdfSuccess && (
        <div className="fixed top-14 right-4 z-50 bg-emerald-950 border border-emerald-500/60 text-emerald-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>ஜாதகம் முழுமையான பல பக்க A4 PDF வடிவில் பதிவிறக்கம் செய்யப்பட்டது!</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto pb-16 overflow-visible">
        
        {/* STATE 1: Clean Input Form */}
        <section className="no-print">
          <InputForm
            initialValues={formData}
            onSubmit={handleFormSubmit}
            isGenerating={isGenerating}
          />

          {/* Progress Status Pill during generation */}
          {isGenerating && generationStepText && (
            <div className="max-w-md mx-auto -mt-3 mb-6 px-4">
              <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-3 text-center shadow-lg flex items-center justify-center gap-2.5 text-xs text-amber-300 font-tamil animate-pulse">
                <Compass className="w-4 h-4 text-amber-400 animate-spin" />
                <span>{generationStepText}</span>
              </div>
            </div>
          )}
        </section>

        {/* STATE 2: Generated Horoscope View (Classic A4 Template) */}
        {horoscopeData && (
          <section className="mt-2 animate-in fade-in duration-300">
            <JathagamLayout
              data={horoscopeData}
              containerRef={jathagamContainerRef}
              onDownloadPdf={handleDownloadPdf}
              isDownloadingPdf={isDownloadingPdf}
            />
          </section>
        )}

      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500 no-print">
        திருக்கணித முறைப்படி துல்லியமாக கணிக்கப்பட்ட ஜாதக கட்டங்கள் • Classic Vedic Astrology Engine
      </footer>

    </div>
  );
}
