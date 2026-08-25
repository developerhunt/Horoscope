import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  HoroscopeInput,
  MarriageCompatibilityResult,
  PoruthamItem
} from '../types';
import {
  calculateHoroscope,
  NAKSHATRAS,
  RASI_NAMES_TAMIL
} from '../data/astroEngine';
import {
  NAKSHATRA_DATABASE,
  calculateMarriageCompatibility,
  PersonMatchInput
} from '../data/poruthamEngine';
import { TAMIL_NADU_CITIES, CityOption } from '../data/cities';
import { formatDMSCoordinates, formatPlaceTitle, NominatimPlace } from '../utils/geoUtils';
import { exportToPdf } from '../utils/pdfExport';
import {
  Heart,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Flame,
  Scale,
  Sparkles,
  RefreshCw,
  User,
  Calendar,
  Clock,
  MapPin,
  Check,
  ChevronDown,
  Layers,
  Activity,
  Compass
} from 'lucide-react';

interface SuggestionItem {
  id: string | number;
  displayName: string;
  mainName: string;
  subtitle: string;
  lat: string;
  lon: string;
  isGlobal?: boolean;
}

// City / Location Autocomplete component for Horoscope inputs
interface LocationInputProps {
  label: string;
  value: string;
  onChange: (city: string, lat?: string, lon?: string) => void;
  initialLat?: string;
  initialLon?: string;
  accentColor?: 'blue' | 'rose';
}

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  value,
  onChange,
  initialLat,
  initialLon,
  accentColor = 'blue'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [coords, setCoords] = useState<{ lat: string; lon: string } | null>(
    initialLat && initialLon ? { lat: initialLat, lon: initialLon } : null
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      const popular = TAMIL_NADU_CITIES.slice(0, 8).map(c => ({
        id: c.name,
        displayName: `${c.tamilName} (${c.name})`,
        mainName: c.tamilName,
        subtitle: c.state,
        lat: c.lat,
        lon: c.long,
        isGlobal: false
      }));
      setSuggestions(popular);
      setIsSearching(false);
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setIsSearching(true);

    try {
      const qLower = trimmed.toLowerCase();
      const localMatches: SuggestionItem[] = TAMIL_NADU_CITIES
        .filter(c => c.name.toLowerCase().includes(qLower) || c.tamilName.toLowerCase().includes(qLower))
        .map(c => ({
          id: c.name,
          displayName: `${c.tamilName} (${c.name})`,
          mainName: c.tamilName,
          subtitle: c.state,
          lat: c.lat,
          lon: c.long,
          isGlobal: false
        }));

      if (trimmed.length >= 3) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&addressdetails=1&limit=5`,
          {
            signal: abortControllerRef.current.signal,
            headers: { 'Accept-Language': 'ta,en' }
          }
        );
        if (res.ok) {
          const globalData: NominatimPlace[] = await res.json();
          const globalMatches: SuggestionItem[] = globalData.map(p => {
            const { mainName, subtitle } = formatPlaceTitle(p);
            return {
              id: p.place_id,
              displayName: p.display_name,
              mainName,
              subtitle,
              lat: p.lat,
              lon: p.lon,
              isGlobal: true
            };
          });
          setSuggestions([...localMatches, ...globalMatches]);
        } else {
          setSuggestions(localMatches);
        }
      } else {
        setSuggestions(localMatches);
      }
    } catch {
      // Ignored
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val, coords?.lat, coords?.lon);
    setIsOpen(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      searchLocations(val);
    }, 250);
  };

  const handleSelect = (s: SuggestionItem) => {
    onChange(s.mainName, s.lat, s.lon);
    setCoords({ lat: s.lat, lon: s.lon });
    setIsOpen(false);
  };

  const ringFocus = accentColor === 'rose'
    ? 'focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
    : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

  return (
    <div ref={containerRef} className="relative space-y-1">
      <label className="block text-slate-400 text-xs font-tamil flex items-center justify-between">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-amber-400" />
          {label}
        </span>
        {coords && (
          <span className="text-[10px] text-slate-400 font-mono">
            {formatDMSCoordinates(coords.lat, coords.lon)}
          </span>
        )}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            if (!value) searchLocations('');
          }}
          placeholder="எ.கா. சென்னை, மதுரை, கோயம்புத்தூர்..."
          className={`w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all ${ringFocus}`}
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && !value) searchLocations('');
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
          {isSearching && (
            <div className="p-2.5 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 font-tamil">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>இடங்களைத் தேடுகிறது...</span>
            </div>
          )}
          {!isSearching && suggestions.length === 0 && (
            <div className="p-2.5 text-center text-xs text-slate-400 font-tamil">
              இடம் கிடைக்கவில்லை
            </div>
          )}
          {!isSearching && suggestions.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 border-b border-slate-800/60 last:border-0 flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
            >
              <div>
                <div className="font-semibold font-tamil text-slate-100">{s.mainName}</div>
                <div className="text-[10px] text-slate-400">{s.subtitle}</div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {formatDMSCoordinates(s.lat, s.lon)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const MarriageMatchingTab: React.FC = () => {
  const [matchMode, setMatchMode] = useState<'quick' | 'full'>('quick');

  // Quick Select State
  const [boyStarIdx, setBoyStarIdx] = useState<number>(0); // Aswini
  const [boyPada, setBoyPada] = useState<number>(1);
  const [boyName, setBoyName] = useState<string>('மணமகன்');

  const [girlStarIdx, setGirlStarIdx] = useState<number>(3); // Rohini
  const [girlPada, setGirlPada] = useState<number>(1);
  const [girlName, setGirlName] = useState<string>('மணமகள்');

  // Full Chart Inputs
  const [boyForm, setBoyForm] = useState<HoroscopeInput>({
    name: 'மணமகன்',
    gender: 'ஆண்',
    dob: '1995-05-15',
    tob: '08:30',
    pob: 'சென்னை, தமிழ்நாடு',
    lat: "13° 05' N",
    lon: "80° 16' E"
  });

  const [girlForm, setGirlForm] = useState<HoroscopeInput>({
    name: 'மணமகள்',
    gender: 'பெண்',
    dob: '1997-08-20',
    tob: '10:15',
    pob: 'மதுரை, தமிழ்நாடு',
    lat: "09° 55' N",
    lon: "78° 07' E"
  });

  const [result, setResult] = useState<MarriageCompatibilityResult | null>(() => {
    const boyInput: PersonMatchInput = {
      name: 'மணமகன்',
      gender: 'ஆண்',
      nakshatraIndex: 0,
      pada: 1
    };
    const girlInput: PersonMatchInput = {
      name: 'மணமகள்',
      gender: 'பெண்',
      nakshatraIndex: 3,
      pada: 1
    };
    return calculateMarriageCompatibility(boyInput, girlInput);
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showPdfSuccess, setShowPdfSuccess] = useState(false);

  const reportContainerRef = useRef<HTMLDivElement>(null);

  // Re-calculate compatibility
  const handleCalculateMatch = () => {
    setIsCalculating(true);

    try {
      if (matchMode === 'quick') {
        const boyInput: PersonMatchInput = {
          name: boyName.trim() || 'மணமகன்',
          gender: 'ஆண்',
          nakshatraIndex: boyStarIdx,
          pada: boyPada
        };
        const girlInput: PersonMatchInput = {
          name: girlName.trim() || 'மணமகள்',
          gender: 'பெண்',
          nakshatraIndex: girlStarIdx,
          pada: girlPada
        };
        const res = calculateMarriageCompatibility(boyInput, girlInput);
        setResult(res);
      } else {
        // Calculate Full Charts for both
        const boyChart = calculateHoroscope(boyForm);
        const girlChart = calculateHoroscope(girlForm);

        // Find Moon position / Nakshatra from chart
        const boyMoon = boyChart.planetaryDegrees.find(p => p.planet.includes('சந்திரன்'));
        const girlMoon = girlChart.planetaryDegrees.find(p => p.planet.includes('சந்திரன்'));

        let bStar = boyStarIdx;
        let bPada = boyPada;
        let bRasi = 0;
        if (boyMoon) {
          bStar = boyMoon.nakshatra ? NAKSHATRAS.indexOf(boyMoon.nakshatra) : (boyMoon.star ? NAKSHATRAS.indexOf(boyMoon.star) : -1);
          if (bStar === -1) bStar = 0;
          bPada = typeof boyMoon.pada === 'number' ? boyMoon.pada : (parseInt(String(boyMoon.pada), 10) || 1);
          bRasi = boyMoon.rasiIndex !== undefined
            ? boyMoon.rasiIndex
            : (boyMoon.rasi ? RASI_NAMES_TAMIL.indexOf(boyMoon.rasi) : 0);
          if (bRasi < 0) bRasi = 0;
        }

        let gStar = girlStarIdx;
        let gPada = girlPada;
        let gRasi = 0;
        if (girlMoon) {
          gStar = girlMoon.nakshatra ? NAKSHATRAS.indexOf(girlMoon.nakshatra) : (girlMoon.star ? NAKSHATRAS.indexOf(girlMoon.star) : -1);
          if (gStar === -1) gStar = 0;
          gPada = typeof girlMoon.pada === 'number' ? girlMoon.pada : (parseInt(String(girlMoon.pada), 10) || 1);
          gRasi = girlMoon.rasiIndex !== undefined
            ? girlMoon.rasiIndex
            : (girlMoon.rasi ? RASI_NAMES_TAMIL.indexOf(girlMoon.rasi) : 0);
          if (gRasi < 0) gRasi = 0;
        }

        const boyInput: PersonMatchInput = {
          name: boyForm.name?.trim() || 'மணமகன்',
          gender: 'ஆண்',
          nakshatraIndex: bStar,
          pada: bPada,
          rasiIndex: bRasi,
          chartData: boyChart
        };

        const girlInput: PersonMatchInput = {
          name: girlForm.name?.trim() || 'மணமகள்',
          gender: 'பெண்',
          nakshatraIndex: gStar,
          pada: gPada,
          rasiIndex: gRasi,
          chartData: girlChart
        };

        const res = calculateMarriageCompatibility(boyInput, girlInput);
        setResult(res);
      }
    } catch (err) {
      console.error('Error calculating compatibility:', err);
    } finally {
      setIsCalculating(false);
      setTimeout(() => {
        reportContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Quick Preset Handlers
  const handleApplyPreset = (boyS: number, boyP: number, girlS: number, girlP: number) => {
    setBoyStarIdx(boyS);
    setBoyPada(boyP);
    setGirlStarIdx(girlS);
    setGirlPada(girlP);

    const boyInput: PersonMatchInput = {
      name: boyName || 'மணமகன்',
      gender: 'ஆண்',
      nakshatraIndex: boyS,
      pada: boyP
    };
    const girlInput: PersonMatchInput = {
      name: girlName || 'மணமகள்',
      gender: 'பெண்',
      nakshatraIndex: girlS,
      pada: girlP
    };
    const res = calculateMarriageCompatibility(boyInput, girlInput);
    setResult(res);
  };

  // PDF Export
  const handleDownloadReportPdf = async () => {
    if (!reportContainerRef.current) return;
    setIsDownloadingPdf(true);

    const fileName = `Thirumana_Porutham_${result?.boy.name || 'Boy'}_${result?.girl.name || 'Girl'}.pdf`;
    const success = await exportToPdf(reportContainerRef.current, fileName);
    setIsDownloadingPdf(false);

    if (success) {
      setShowPdfSuccess(true);
      setTimeout(() => setShowPdfSuccess(false), 3500);
    }
  };

  const boyStarData = NAKSHATRA_DATABASE[boyStarIdx];
  const girlStarData = NAKSHATRA_DATABASE[girlStarIdx];
  const boyAutoRasi = boyStarData ? RASI_NAMES_TAMIL[boyStarData.padaRasiMap[boyPada - 1]] : '';
  const girlAutoRasi = girlStarData ? RASI_NAMES_TAMIL[girlStarData.padaRasiMap[girlPada - 1]] : '';

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      
      {/* Top Banner & Mode Selector */}
      <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/70 border border-rose-500/30 rounded-2xl p-4 sm:p-6 shadow-xl no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-rose-500/20">
              <Heart className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-100 font-tamil flex items-center gap-2">
                <span>திருமணப் பொருத்தம் & 10 பொருத்தம் கணிப்பான்</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Master Engine
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-tamil mt-0.5">
                திருக்கணித முறைப்படி 10 பொருத்தங்கள், ரஜ்ஜு, வேதை, செவ்வாய் தோஷம், ராகு-கேது (சர்ப்ப) தோஷம், பாப சாம்யம் மற்றும் தசா சந்தி முழு ஆய்வு
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMatchMode('quick')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-tamil transition-all cursor-pointer ${
                matchMode === 'quick'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ விரைவு நட்சத்திரப் பொருத்தம்
            </button>
            <button
              type="button"
              onClick={() => setMatchMode('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-tamil transition-all cursor-pointer ${
                matchMode === 'full'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🪐 முழு ஜாதகக் கணிப்பு
            </button>
          </div>
        </div>

        {/* Preset Quick Test Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-tamil text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> மாதிரி பொருத்தங்கள்:
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset(0, 1, 3, 1)}
            className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-tamil transition-all text-[11px] cursor-pointer"
          >
            உத்தமப் பொருத்தம் (அஸ்வினி - ரோகிணி)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(1, 1, 16, 1)}
            className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-tamil transition-all text-[11px] cursor-pointer"
          >
            வேதை தோஷ ஆய்வு (பரணி - அனுஷம்)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(4, 1, 13, 1)}
            className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-tamil transition-all text-[11px] cursor-pointer"
          >
            சிரசு ரஜ்ஜு ஆய்வு (மிருகசீரிஷம் - சித்திரை)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(0, 1, 14, 1)}
            className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-tamil transition-all text-[11px] cursor-pointer"
          >
            சம சப்தம ராசி (மேஷம் - துலாம்)
          </button>
        </div>
      </div>

      {/* DUAL INPUT SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
        
        {/* BOY DETAILS PANEL */}
        <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-tamil">
                ஆ
              </span>
              <h3 className="font-bold text-sm text-blue-200 font-tamil">மணமகன் விபரம் (Groom)</h3>
            </div>
            <span className="text-[10px] text-blue-400/80 bg-blue-950/60 border border-blue-800/50 px-2 py-0.5 rounded-full font-tamil">
              ஆண் ஜாதகம்
            </span>
          </div>

          {matchMode === 'quick' ? (
            <div className="space-y-3.5 text-xs font-tamil">
              <div>
                <label className="block text-slate-400 mb-1">மணமகன் பெயர்</label>
                <input
                  type="text"
                  value={boyName}
                  onChange={(e) => setBoyName(e.target.value)}
                  placeholder="மணமகன் பெயர்"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">பிறந்த நட்சத்திரம்</label>
                  <select
                    value={boyStarIdx}
                    onChange={(e) => setBoyStarIdx(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    {NAKSHATRAS.map((star, idx) => (
                      <option key={star} value={idx}>
                        {idx + 1}. {star}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">பாதம் (1 to 4)</label>
                  <select
                    value={boyPada}
                    onChange={(e) => setBoyPada(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value={1}>1-ஆம் பாதம்</option>
                    <option value={2}>2-ஆம் பாதம்</option>
                    <option value={3}>3-ஆம் பாதம்</option>
                    <option value={4}>4-ஆம் பாதம்</option>
                  </select>
                </div>
              </div>

              {/* Auto-computed Rasi badge */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-400">கணிக்கப்பட்ட ராசி:</span>
                <span className="font-bold text-amber-400">{boyAutoRasi} ராசி</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs font-tamil">
              <div>
                <label className="block text-slate-400 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-blue-400" /> பெயர்
                </label>
                <input
                  type="text"
                  value={boyForm.name}
                  onChange={(e) => setBoyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="மணமகன் பெயர்"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-400" /> பிறந்த தேதி
                  </label>
                  <input
                    type="date"
                    value={boyForm.dob}
                    onChange={(e) => setBoyForm(prev => ({ ...prev, dob: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" /> பிறந்த நேரம்
                  </label>
                  <input
                    type="time"
                    value={boyForm.tob}
                    onChange={(e) => setBoyForm(prev => ({ ...prev, tob: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <LocationInput
                label="பிறந்த இடம் & அட்ச/தீர்க்க ரேகை"
                value={boyForm.pob}
                initialLat={boyForm.lat}
                initialLon={boyForm.lon}
                accentColor="blue"
                onChange={(pob, lat, lon) => {
                  setBoyForm(prev => ({ ...prev, pob, lat, lon }));
                }}
              />
            </div>
          )}
        </div>

        {/* GIRL DETAILS PANEL */}
        <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold font-tamil">
                பெ
              </span>
              <h3 className="font-bold text-sm text-rose-200 font-tamil">மணமகள் விபரம் (Bride)</h3>
            </div>
            <span className="text-[10px] text-rose-400/80 bg-rose-950/60 border border-rose-800/50 px-2 py-0.5 rounded-full font-tamil">
              பெண் ஜாதகம்
            </span>
          </div>

          {matchMode === 'quick' ? (
            <div className="space-y-3.5 text-xs font-tamil">
              <div>
                <label className="block text-slate-400 mb-1">மணமகள் பெயர்</label>
                <input
                  type="text"
                  value={girlName}
                  onChange={(e) => setGirlName(e.target.value)}
                  placeholder="மணமகள் பெயர்"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">பிறந்த நட்சத்திரம்</label>
                  <select
                    value={girlStarIdx}
                    onChange={(e) => setGirlStarIdx(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-rose-500 outline-none cursor-pointer"
                  >
                    {NAKSHATRAS.map((star, idx) => (
                      <option key={star} value={idx}>
                        {idx + 1}. {star}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">பாதம் (1 to 4)</label>
                  <select
                    value={girlPada}
                    onChange={(e) => setGirlPada(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-rose-500 outline-none cursor-pointer"
                  >
                    <option value={1}>1-ஆம் பாதம்</option>
                    <option value={2}>2-ஆம் பாதம்</option>
                    <option value={3}>3-ஆம் பாதம்</option>
                    <option value={4}>4-ஆம் பாதம்</option>
                  </select>
                </div>
              </div>

              {/* Auto-computed Rasi badge */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-400">கணிக்கப்பட்ட ராசி:</span>
                <span className="font-bold text-rose-400">{girlAutoRasi} ராசி</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs font-tamil">
              <div>
                <label className="block text-slate-400 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-rose-400" /> பெயர்
                </label>
                <input
                  type="text"
                  value={girlForm.name}
                  onChange={(e) => setGirlForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="மணமகள் பெயர்"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-rose-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-rose-400" /> பிறந்த தேதி
                  </label>
                  <input
                    type="date"
                    value={girlForm.dob}
                    onChange={(e) => setGirlForm(prev => ({ ...prev, dob: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-400" /> பிறந்த நேரம்
                  </label>
                  <input
                    type="time"
                    value={girlForm.tob}
                    onChange={(e) => setGirlForm(prev => ({ ...prev, tob: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-rose-500 outline-none"
                  />
                </div>
              </div>

              <LocationInput
                label="பிறந்த இடம் & அட்ச/தீர்க்க ரேகை"
                value={girlForm.pob}
                initialLat={girlForm.lat}
                initialLon={girlForm.lon}
                accentColor="rose"
                onChange={(pob, lat, lon) => {
                  setGirlForm(prev => ({ ...prev, pob, lat, lon }));
                }}
              />
            </div>
          )}
        </div>

      </div>

      {/* CALCULATE PRIMARY CTA BUTTON */}
      <div className="flex flex-wrap items-center justify-center gap-3 no-print">
        <button
          type="button"
          onClick={handleCalculateMatch}
          disabled={isCalculating}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-rose-600/25 transition-all cursor-pointer font-tamil disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>{isCalculating ? 'பொருத்தம் கணிக்கப்படுகிறது...' : 'திருமணப் பொருத்தம் பார்க்க'}</span>
        </button>

        {result && (
          <button
            type="button"
            onClick={handleDownloadReportPdf}
            disabled={isDownloadingPdf}
            className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 font-tamil"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{isDownloadingPdf ? 'தயாராகிறது...' : 'அறிக்கை PDF பதிவிறக்கம்'}</span>
          </button>
        )}
      </div>

      {/* PDF Download Toast */}
      {showPdfSuccess && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-950 border border-emerald-500/60 text-emerald-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>திருமணப் பொருத்த அறிக்கை PDF வடிவில் பதிவிறக்கம் செய்யப்பட்டது!</span>
        </div>
      )}

      {/* ========================================== */}
      {/* RESULTS REPORT DASHBOARD (PRINT READY) */}
      {/* ========================================== */}
      {result && (
        <div
          ref={reportContainerRef}
          className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-7 shadow-2xl space-y-6 text-slate-100 print:bg-white print:text-black print:p-4 print:border-none print:shadow-none"
        >
          
          {/* A4 REPORT HEADER */}
          <div className="border-b border-slate-800 print:border-slate-300 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold text-amber-400 print:text-amber-700 font-tamil">௨</span>
                  <h2 className="text-base sm:text-xl font-bold text-slate-100 print:text-slate-900 font-tamil">
                    திருமணப் பொருத்த சாஸ்திர அறிக்கை (10 Porutham Master Report)
                  </h2>
                </div>
                <p className="text-xs text-slate-400 print:text-slate-600 font-tamil">
                  திருக்கணித பஞ்சாங்க ஜோதிட சாஸ்திர விதிகளின்படி கணிக்கப்பட்டது
                </p>
              </div>

              {/* Score Badge */}
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 rounded-xl px-4 py-2.5 text-center">
                  <div className="text-xl sm:text-2xl font-black text-amber-400 print:text-amber-700 font-mono leading-none">
                    {result.totalScore} <span className="text-xs text-slate-400">/ {result.maxScore}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 print:text-slate-600 font-tamil mt-1">
                    {result.matchCount} பொருத்தங்கள் உண்டு ({result.percentage}%)
                  </div>
                </div>
              </div>
            </div>

            {/* SIDE-BY-SIDE BOY & GIRL ASTROLOGICAL PROFILE SUMMARY */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/80 print:bg-slate-50 border border-slate-800/80 print:border-slate-300 rounded-xl p-3.5 text-xs font-tamil">
              {/* Boy Profile */}
              <div className="space-y-2 border-b sm:border-b-0 sm:border-r border-slate-800 print:border-slate-300 pb-3 sm:pb-0 sm:pr-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px] flex items-center justify-center">ஆ</span>
                    <span className="font-bold text-slate-100 print:text-slate-900 text-sm">{result.boy.name}</span>
                  </div>
                  <span className="text-[10px] bg-blue-950/80 text-blue-300 px-2 py-0.5 rounded border border-blue-800/60 font-semibold">
                    மணமகன்
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-300 print:text-slate-700">
                  <div>
                    <span className="text-slate-400">நட்சத்திரம்:</span> <b className="text-amber-300 print:text-amber-800">{result.boy.nakshatra} ({result.boy.pada})</b>
                  </div>
                  <div>
                    <span className="text-slate-400">ராசி:</span> <b>{result.boy.rasi}</b> ({result.boy.rasiLord})
                  </div>
                  {result.boy.lagna && (
                    <div>
                      <span className="text-slate-400">லக்னம்:</span> <b className="text-blue-300 print:text-blue-700">{result.boy.lagna}</b> ({result.boy.lagnaLord})
                    </div>
                  )}
                  {result.boy.currentDasa && (
                    <div>
                      <span className="text-slate-400">நடப்பு தசை:</span> <b className="text-emerald-300 print:text-emerald-700">{result.boy.currentDasa}</b>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">கணம்:</span> {result.boy.gana}
                  </div>
                  <div>
                    <span className="text-slate-400">யோனி:</span> {result.boy.yoni.animal} ({result.boy.yoni.gender})
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">ரஜ்ஜு:</span> <b className="text-slate-200 print:text-slate-800">{result.boy.rajju} ரஜ்ஜு</b>
                  </div>
                </div>
              </div>

              {/* Girl Profile */}
              <div className="space-y-2 pt-2 sm:pt-0 sm:pl-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] flex items-center justify-center">பெ</span>
                    <span className="font-bold text-slate-100 print:text-slate-900 text-sm">{result.girl.name}</span>
                  </div>
                  <span className="text-[10px] bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded border border-rose-800/60 font-semibold">
                    மணமகள்
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-300 print:text-slate-700">
                  <div>
                    <span className="text-slate-400">நட்சத்திரம்:</span> <b className="text-amber-300 print:text-amber-800">{result.girl.nakshatra} ({result.girl.pada})</b>
                  </div>
                  <div>
                    <span className="text-slate-400">ராசி:</span> <b>{result.girl.rasi}</b> ({result.girl.rasiLord})
                  </div>
                  {result.girl.lagna && (
                    <div>
                      <span className="text-slate-400">லக்னம்:</span> <b className="text-rose-300 print:text-rose-700">{result.girl.lagna}</b> ({result.girl.lagnaLord})
                    </div>
                  )}
                  {result.girl.currentDasa && (
                    <div>
                      <span className="text-slate-400">நடப்பு தசை:</span> <b className="text-emerald-300 print:text-emerald-700">{result.girl.currentDasa}</b>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">கணம்:</span> {result.girl.gana}
                  </div>
                  <div>
                    <span className="text-slate-400">யோனி:</span> {result.girl.yoni.animal} ({result.girl.yoni.gender})
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">ரஜ்ஜு:</span> <b className="text-slate-200 print:text-slate-800">{result.girl.rajju} ரஜ்ஜு</b>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FINAL VERDICT HERO CARD */}
          <div
            className={`rounded-2xl p-4 sm:p-5 border transition-all ${
              result.finalVerdict === 'excellent'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 print:bg-emerald-50 print:border-emerald-300 print:text-emerald-900'
                : result.finalVerdict === 'moderate'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 print:bg-amber-50 print:border-amber-300 print:text-amber-900'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200 print:bg-rose-50 print:border-rose-300 print:text-rose-900'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5">
                {result.finalVerdict === 'excellent' && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 print:text-emerald-700 shrink-0" />
                )}
                {result.finalVerdict === 'moderate' && (
                  <Sparkles className="w-6 h-6 text-amber-400 print:text-amber-700 shrink-0" />
                )}
                {result.finalVerdict === 'not_recommended' && (
                  <XCircle className="w-6 h-6 text-rose-400 print:text-rose-700 shrink-0" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-base sm:text-lg font-tamil">
                    {result.verdictTitleTamil}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-tamil bg-slate-900/60 print:bg-white border border-current font-semibold">
                    {result.verdictSubtitleTamil}
                  </span>
                </div>
                <p className="text-xs font-tamil opacity-90 leading-relaxed pt-1">
                  {result.summaryTamil}
                </p>
              </div>
            </div>
          </div>

          {/* CRITICAL SAFETY CARDS (RAJJU & VEDHAI) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Rajju Card */}
            <div
              className={`rounded-xl p-3.5 border text-xs font-tamil ${
                result.isRajjuMatch
                  ? 'bg-slate-950/80 print:bg-slate-50 border-emerald-500/40 text-slate-200'
                  : 'bg-rose-950/50 print:bg-rose-50 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ரஜ்ஜு பொருத்தம் (மாங்கல்ய பலம்)
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    result.isRajjuMatch
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {result.isRajjuMatch ? 'உத்தமம் (பாஸ்)' : 'கடுமையான தோஷம்'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 print:text-slate-600 leading-relaxed">
                பெண்: <b className="text-slate-200 print:text-slate-900">{result.girl.rajju} ரஜ்ஜு</b> • ஆண்: <b className="text-slate-200 print:text-slate-900">{result.boy.rajju} ரஜ்ஜு</b>.
                {result.isRajjuMatch
                  ? ' இருவரும் வெவ்வேறு ரஜ்ஜு கொண்டிருப்பதால் மாங்கல்ய தோஷமில்லை.'
                  : ' ஒரே ரஜ்ஜு அமைந்திருப்பதால் சாஸ்திரப்படி எச்சரிக்கை.'}
              </p>
            </div>

            {/* Vedhai Card */}
            <div
              className={`rounded-xl p-3.5 border text-xs font-tamil ${
                result.isVedhaMatch
                  ? 'bg-slate-950/80 print:bg-slate-50 border-emerald-500/40 text-slate-200'
                  : 'bg-rose-950/50 print:bg-rose-50 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  வேதைப் பொருத்தம் (தாக்குதல் இன்மை)
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    result.isVedhaMatch
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {result.isVedhaMatch ? 'வேதை இல்லை' : 'வேதை தோஷம்'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 print:text-slate-600 leading-relaxed">
                {result.isVedhaMatch
                  ? `${result.girl.nakshatra} மற்றும் ${result.boy.nakshatra} நட்சத்திரங்களுக்குள் வேதை பகை இல்லை.`
                  : `${result.girl.nakshatra} மற்றும் ${result.boy.nakshatra} ஒன்றுக்கொன்று வேதை நட்சத்திரங்களாக அமைகின்றன.`}
              </p>
            </div>
          </div>

          {/* 10 PORUTHAM BREAKDOWN TABLE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
              <h3 className="font-bold text-sm text-amber-400 print:text-amber-800 font-tamil flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>10 பொருத்தங்களின் விரிவான சாஸ்திர விபரங்கள்</span>
              </h3>
              <span className="text-xs text-slate-400 print:text-slate-600 font-mono">
                {result.totalScore} / {result.maxScore} மதிப்பெண்கள்
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
              <table className="w-full text-left text-xs font-tamil">
                <thead className="bg-slate-950/80 print:bg-slate-100 text-slate-400 print:text-slate-700 border-b border-slate-800 print:border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">வ.எண்</th>
                    <th className="py-2.5 px-3 font-semibold">பொருத்தத்தின் பெயர்</th>
                    <th className="py-2.5 px-3 font-semibold text-center">நிலை / முடிவு</th>
                    <th className="py-2.5 px-3 font-semibold text-center">மதிப்பெண்</th>
                    <th className="py-2.5 px-3 font-semibold">காரகம் & பலன்கள்</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                  {result.poruthams.map((p, idx) => {
                    const isGood = p.status === 'good';
                    const isAvg = p.status === 'average';
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-800/30 print:hover:bg-transparent transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-200 print:text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{p.nameTamil}</span>
                            {p.importance === 'critical' && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                முக்கியம்
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 print:text-slate-400 font-sans">
                            {p.nameEnglish}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              isGood
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isAvg
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {p.resultTamil}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-400 print:text-amber-800">
                          {p.score} <span className="text-[10px] text-slate-500">/ {p.maxScore}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-300 print:text-slate-700 leading-relaxed max-w-xs">
                          {p.explanation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ADVANCED CHARTS ANALYSIS: KUJA DOSHA, RAHU-KETU, PAPA SAMYAM, DASA SANDHI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Kuja Dosha Card */}
            <div className="bg-slate-950/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-xl p-4 space-y-3 font-tamil text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-rose-300 print:text-rose-800">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>செவ்வாய் தோஷ ஒப்பீடு (Kuja Dosha)</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    result.kujaDosha.isBalanced
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {result.kujaDosha.isBalanced ? 'சமநிலை உண்டு' : 'சமநிலையின்மை'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="bg-slate-900 print:bg-white border border-slate-800/80 print:border-slate-200 rounded-lg p-2.5">
                  <div className="flex items-center justify-between font-semibold text-slate-300 print:text-slate-800 mb-1">
                    <span>ஆண் செவ்வாய் நிலை:</span>
                    <span className="text-[11px] text-amber-400 print:text-amber-700 font-mono">
                      புள்ளிகள்: {result.kujaDosha.boy.score}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 print:text-slate-600">
                    {result.kujaDosha.boy.balanceStatus}
                  </p>
                  {result.kujaDosha.boy.exceptions.length > 0 && (
                    <div className="text-[10px] text-emerald-400 print:text-emerald-700 mt-1">
                      ✓ {result.kujaDosha.boy.exceptions.join(', ')}
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 print:bg-white border border-slate-800/80 print:border-slate-200 rounded-lg p-2.5">
                  <div className="flex items-center justify-between font-semibold text-slate-300 print:text-slate-800 mb-1">
                    <span>பெண் செவ்வாய் நிலை:</span>
                    <span className="text-[11px] text-rose-400 print:text-rose-700 font-mono">
                      புள்ளிகள்: {result.kujaDosha.girl.score}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 print:text-slate-600">
                    {result.kujaDosha.girl.balanceStatus}
                  </p>
                  {result.kujaDosha.girl.exceptions.length > 0 && (
                    <div className="text-[10px] text-emerald-400 print:text-emerald-700 mt-1">
                      ✓ {result.kujaDosha.girl.exceptions.join(', ')}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-300 print:text-slate-700 italic pt-1">
                  முடிவு: {result.kujaDosha.balanceVerdict}
                </div>
              </div>
            </div>

            {/* Rahu-Ketu (Sarpa) Dosha Card */}
            <div className="bg-slate-950/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-xl p-4 space-y-3 font-tamil text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-purple-300 print:text-purple-800">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>ராகு-கேது (சர்ப்ப) தோஷம்</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    result.rahuKetuDosha.isBalanced
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {result.rahuKetuDosha.isBalanced ? 'சமநிலை உண்டு' : 'சமநிலையின்மை'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="bg-slate-900 print:bg-white border border-slate-800/80 print:border-slate-200 rounded-lg p-2.5">
                  <div className="flex items-center justify-between font-semibold text-slate-300 print:text-slate-800 mb-1">
                    <span>ஆண் ராகு-கேது நிலை:</span>
                    <span className="text-[11px] text-purple-400 print:text-purple-700 font-mono">
                      புள்ளிகள்: {result.rahuKetuDosha.boy.score}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 print:text-slate-600">
                    {result.rahuKetuDosha.boy.balanceStatus}
                  </p>
                  {result.rahuKetuDosha.boy.placements.length > 0 && (
                    <div className="text-[10px] text-slate-400 mt-1">
                      {result.rahuKetuDosha.boy.placements.join(' • ')}
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 print:bg-white border border-slate-800/80 print:border-slate-200 rounded-lg p-2.5">
                  <div className="flex items-center justify-between font-semibold text-slate-300 print:text-slate-800 mb-1">
                    <span>பெண் ராகு-கேது நிலை:</span>
                    <span className="text-[11px] text-purple-400 print:text-purple-700 font-mono">
                      புள்ளிகள்: {result.rahuKetuDosha.girl.score}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 print:text-slate-600">
                    {result.rahuKetuDosha.girl.balanceStatus}
                  </p>
                  {result.rahuKetuDosha.girl.placements.length > 0 && (
                    <div className="text-[10px] text-slate-400 mt-1">
                      {result.rahuKetuDosha.girl.placements.join(' • ')}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-300 print:text-slate-700 italic pt-1">
                  முடிவு: {result.rahuKetuDosha.balanceVerdict}
                </div>
              </div>
            </div>

            {/* Papa Samyam Card */}
            <div className="bg-slate-950/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-xl p-4 space-y-3 font-tamil text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 print:text-amber-800">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>பாப சாம்ய சமநிலை (Papa Samyam)</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    result.papaSamyam.isBalanced
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {result.papaSamyam.isBalanced ? 'சுப சமநிலை' : 'பாப தோஷம்'}
                </span>
              </div>

              <div className="space-y-2">
                {/* Visual comparative bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>ஆண் பாபப் புள்ளிகள்: <b className="text-blue-400">{result.papaSamyam.boyPoints}</b></span>
                    <span>பெண் பாபப் புள்ளிகள்: <b className="text-rose-400">{result.papaSamyam.girlPoints}</b></span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-blue-500 h-full transition-all"
                      style={{
                        width: `${
                          result.papaSamyam.boyPoints + result.papaSamyam.girlPoints > 0
                            ? (result.papaSamyam.boyPoints / (result.papaSamyam.boyPoints + result.papaSamyam.girlPoints)) * 100
                            : 50
                        }%`
                      }}
                    />
                    <div
                      className="bg-rose-500 h-full transition-all"
                      style={{
                        width: `${
                          result.papaSamyam.boyPoints + result.papaSamyam.girlPoints > 0
                            ? (result.papaSamyam.girlPoints / (result.papaSamyam.boyPoints + result.papaSamyam.girlPoints)) * 100
                            : 50
                        }%`
                      }}
                    />
                  </div>
                </div>

                <div className="bg-slate-900 print:bg-white border border-slate-800/80 print:border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-300 print:text-slate-700 leading-relaxed">
                  <div className="font-semibold text-amber-400 print:text-amber-700 mb-0.5">
                    {result.papaSamyam.verdictTamil}
                  </div>
                  <p className="text-slate-400 print:text-slate-600">
                    {result.papaSamyam.verdictDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Dasa Sandhi & Same Dasa Card */}
            <div className="bg-slate-950/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-xl p-4 space-y-3 font-tamil text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-sky-300 print:text-sky-800">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>தசா சந்தி & தசா ஆய்வு</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    !result.dasaSandhi.hasSandhiAlert && !result.sameDasaRunning.isSame
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {!result.dasaSandhi.hasSandhiAlert && !result.sameDasaRunning.isSame ? 'சுப தசா நிலை' : 'கவனிக்கத்தக்கது'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="bg-slate-900 print:bg-white border border-slate-800/80 print:border-slate-200 rounded-lg p-2.5">
                  <div className="text-slate-300 print:text-slate-800 font-semibold mb-1">
                    நடப்பு தசா விவரம்:
                  </div>
                  <p className="text-[11px] text-slate-400 print:text-slate-600">
                    {result.sameDasaRunning.details}
                  </p>
                </div>

                <div className="bg-slate-900 print:bg-white border border-slate-800/80 print:border-slate-200 rounded-lg p-2.5">
                  <div className="text-slate-300 print:text-slate-800 font-semibold mb-1">
                    தசா சந்தி மாற்றம் (Timeline Gap):
                  </div>
                  <p className="text-[11px] text-slate-400 print:text-slate-600">
                    {result.dasaSandhi.details}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RECOMMENDATIONS & PARIHARAM */}
          {result.recommendationsTamil.length > 0 && (
            <div className="bg-amber-950/30 print:bg-amber-50 border border-amber-500/30 print:border-amber-200 rounded-xl p-4 font-tamil text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300 print:text-amber-800">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>ஜோதிட சாஸ்திர பரிந்துரைகள் & பரிகார ஆலோசனைகள்:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-300 print:text-slate-700 list-disc list-inside">
                {result.recommendationsTamil.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* PRINT FOOTER */}
          <div className="border-t border-slate-800 print:border-slate-300 pt-3 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 print:text-slate-400 font-tamil">
            <span>திருக்கணித முறைப்படி துல்லியமாக கணிக்கப்பட்ட திருமணப் பொருத்த அறிக்கை</span>
            <span>Horoscopenee Compatibility Master Engine</span>
          </div>

        </div>
      )}

    </div>
  );
};
