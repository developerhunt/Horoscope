import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HoroscopeInput } from '../types';
import { NominatimPlace, formatPlaceTitle, formatDMSCoordinates } from '../utils/geoUtils';
import { User, Calendar, Clock, MapPin, Users, Sparkles, Check, ChevronDown, X, Loader2, Globe, Heart } from 'lucide-react';

interface InputFormProps {
  initialValues?: HoroscopeInput;
  onSubmit: (data: HoroscopeInput) => void;
  isGenerating?: boolean;
}

interface SuggestionItem {
  id: string | number;
  displayName: string;
  mainName: string;
  subtitle: string;
  lat: string;
  lon: string;
  isGlobal?: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({
  initialValues = {
    name: '',
    gender: 'ஆண்',
    fatherName: '',
    motherName: '',
    dob: '',
    tob: '',
    pob: '',
    lat: undefined,
    lon: undefined,
    nodeCalculation: 'mean'
  },
  onSubmit,
  isGenerating = false
}) => {
  const [formData, setFormData] = useState<HoroscopeInput>({
    ...initialValues,
    nodeCalculation: initialValues.nodeCalculation || 'mean'
  });
  
  // Place of Birth Autocomplete & Geocoding State
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: string; lon: string } | null>(
    initialValues.lat && initialValues.lon ? { lat: initialValues.lat, lon: initialValues.lon } : null
  );

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleChange = (field: keyof HoroscopeInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch locations from OpenStreetMap Nominatim with debouncing
  // Strictly ONLY called when query has >= 3 characters
  const fetchNominatimLocations = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setIsSearchingLocation(false);
      setIsCityOpen(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsSearchingLocation(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=6&addressdetails=1`,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            'Accept-Language': 'en,ta'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Nominatim API response not ok');
      }

      const data: NominatimPlace[] = await response.json();

      if (data && data.length > 0) {
        const formatted: SuggestionItem[] = data.map(item => {
          const { mainName, subtitle } = formatPlaceTitle(item);
          return {
            id: item.place_id,
            displayName: item.display_name,
            mainName,
            subtitle,
            lat: item.lat,
            lon: item.lon,
            isGlobal: true
          };
        });
        setSuggestions(formatted);
        setIsCityOpen(true);
      } else {
        setSuggestions([]);
        setIsCityOpen(true);
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Location lookup fallback:', err);
        setSuggestions([]);
      }
    } finally {
      setIsSearchingLocation(false);
    }
  }, []);

  // Debounced input handler for Place of Birth (350ms delay)
  // Strictly DO NOT show any suggestions or dropdown when user merely clicks or has < 3 chars
  const handleCityInput = (val: string) => {
    handleChange('pob', val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = val.trim();
    if (trimmed.length >= 3) {
      setIsSearchingLocation(true);
      debounceTimerRef.current = setTimeout(() => {
        fetchNominatimLocations(trimmed);
      }, 350);
    } else {
      // Strictly do not open dropdown if fewer than 3 characters
      setIsSearchingLocation(false);
      setSuggestions([]);
      setIsCityOpen(false);
    }
  };

  const handleSelectLocation = (loc: SuggestionItem) => {
    const cleanName = loc.mainName ? `${loc.mainName}, ${loc.subtitle.split('•')[0].trim()}` : loc.displayName;
    
    setFormData(prev => ({
      ...prev,
      pob: cleanName,
      lat: loc.lat,
      lon: loc.lon
    }));

    setSelectedCoordinates({ lat: loc.lat, lon: loc.lon });
    setIsCityOpen(false); // Close dropdown immediately
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dob || !formData.tob || !formData.pob.trim()) {
      return;
    }
    setIsCityOpen(false);
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Form Container (Premium Dark Theme) */}
      <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
        
        {/* Title Header */}
        <div className="text-center mb-6 border-b border-slate-800 pb-5">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mb-1 select-none font-tamil">
            ௨
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-tamil tracking-wide">
            ஜாதக விபரங்கள் உள்ளீடு
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enter birth details to generate the traditional Thirukanidappadi Horoscope
          </p>
        </div>

        {/* Dynamic Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          
          {/* Row 1: User Name & Gender Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. User Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>பெயர் (Name)</span>
                <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="உங்கள் பெயரை உள்ளிடவும் (Enter full name)"
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-slate-100 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none font-medium placeholder:text-slate-600"
              />
            </div>

            {/* 2. Gender Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>பாலினம் (Gender)</span>
                <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value as 'ஆண்' | 'பெண்' | 'இதர')}
                  className="w-full appearance-none bg-slate-950 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-slate-100 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none font-medium pr-10 cursor-pointer"
                >
                  <option value="ஆண்">ஆண் (Male)</option>
                  <option value="பெண்">பெண் (Female)</option>
                  <option value="இதர">இதர (Other)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Row 2: Father's Name & Mother's Name Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Father's Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>தகப்பனார் பெயர் (Father's Name)</span>
              </label>
              <input
                type="text"
                value={formData.fatherName || ''}
                onChange={(e) => handleChange('fatherName', e.target.value)}
                placeholder="தந்தையின் பெயரை உள்ளிடவும் (Father's Name)"
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-slate-100 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none font-medium placeholder:text-slate-600"
              />
            </div>

            {/* Mother's Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-amber-400" />
                <span>தாயார் பெயர் (Mother's Name)</span>
              </label>
              <input
                type="text"
                value={formData.motherName || ''}
                onChange={(e) => handleChange('motherName', e.target.value)}
                placeholder="தாயாரின் பெயரை உள்ளிடவும் (Mother's Name)"
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-slate-100 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none font-medium placeholder:text-slate-600"
              />
            </div>

          </div>

          {/* Row 3: Date of Birth & Time of Birth Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>பிறந்த தேதி (Date of Birth)</span>
                <span className="text-amber-400">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-slate-100 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none font-medium"
              />
            </div>

            {/* Time of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>பிறந்த நேரம் (Time of Birth)</span>
                <span className="text-amber-400">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.tob}
                onChange={(e) => handleChange('tob', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-slate-100 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none font-medium"
              />
            </div>

          </div>

          {/* Row 4: Place of Birth (Real-Time Worldwide Autocomplete Search) */}
          <div className="relative" ref={cityDropdownRef}>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>பிறந்த ஊர் (Place of Birth)</span>
                <span className="text-amber-400">*</span>
              </span>
              <span className="text-[11px] text-amber-400/80 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>Worldwide Search (Min 3 chars)</span>
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                required
                value={formData.pob}
                onChange={(e) => handleCityInput(e.target.value)}
                placeholder="பிறந்த ஊர் / நகரம் (Type city name to search...)"
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-slate-100 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none font-medium placeholder:text-slate-600 pr-10"
              />
              
              {/* Right Indicator: Loading Spinner OR Clear Button */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isSearchingLocation ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                ) : formData.pob ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleChange('pob', '');
                      setFormData(p => ({ ...p, lat: undefined, lon: undefined }));
                      setSelectedCoordinates(null);
                      setSuggestions([]);
                      setIsCityOpen(false);
                    }}
                    className="text-slate-400 hover:text-slate-200 p-0.5"
                    title="Clear location"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                )}
              </div>
            </div>

            {/* Selected Coordinates Indicator Pill */}
            {selectedCoordinates && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
                <span className="font-semibold font-tamil">அட்ச / தீர்க்க ரேகை:</span>
                <span className="font-mono">{formatDMSCoordinates(selectedCoordinates.lat, selectedCoordinates.lon)}</span>
              </div>
            )}

            {/* Autocomplete Dropdown Menu (Strictly shows ONLY when query >= 3 chars) */}
            {isCityOpen && formData.pob.trim().length >= 3 && (
              <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-slate-800/60 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/90 sticky top-0 backdrop-blur-sm flex justify-between items-center z-10">
                  <span>உலகளாவிய இடங்கள் (Global Search Results)</span>
                  {isSearchingLocation && (
                    <span className="flex items-center gap-1 text-amber-400 text-[10px] normal-case">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      தேடுகிறது...
                    </span>
                  )}
                </div>

                {suggestions.length === 0 && !isSearchingLocation ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    பொருத்தமான இடங்கள் கிடைக்கவில்லை. தாங்களே தொடர்ந்து தட்டச்சு செய்யலாம்.
                  </div>
                ) : (
                  suggestions.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800 text-xs flex items-center justify-between text-slate-200 transition-colors group cursor-pointer"
                    >
                      <div className="flex flex-col pr-2 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="font-semibold text-slate-100 group-hover:text-amber-300 truncate">
                            {loc.mainName}
                          </span>
                          {loc.isGlobal && (
                            <span className="text-[9px] bg-slate-800 border border-slate-700 text-slate-400 px-1 py-0.2 rounded font-sans">
                              OSM
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal truncate mt-0.5 pl-4.5">
                          {loc.subtitle || loc.displayName}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-end shrink-0 pl-2">
                        {loc.lat && loc.lon && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formatDMSCoordinates(loc.lat, loc.lon).split('/')[0].trim()}
                          </span>
                        )}
                        {formData.pob === loc.displayName && (
                          <Check className="w-3.5 h-3.5 text-amber-400 mt-0.5" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

            {/* Row 5: Rahu / Ketu Calculation Setting (Mean vs True Node) */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950/60 border border-slate-800 px-3.5 py-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200 font-tamil">
                    ராகு / கேது கணித முறை:
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="nodeCalculation"
                      value="mean"
                      checked={formData.nodeCalculation !== 'true'}
                      onChange={() => setFormData(p => ({ ...p, nodeCalculation: 'mean' }))}
                      className="w-3.5 h-3.5 accent-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <span className="text-xs font-tamil text-slate-300 group-hover:text-amber-300 transition-colors">
                      சராசரி (Mean Node)
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="nodeCalculation"
                      value="true"
                      checked={formData.nodeCalculation === 'true'}
                      onChange={() => setFormData(p => ({ ...p, nodeCalculation: 'true' }))}
                      className="w-3.5 h-3.5 accent-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <span className="text-xs font-tamil text-slate-300 group-hover:text-amber-300 transition-colors">
                      உண்மை (True Node)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button with Loading State */}
            <div className="pt-3">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/20 transition-all duration-200 transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-tamil font-semibold">ஜாதகக் கணக்கீடுகள் செய்யப்படுகின்றன... (Loading...)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span className="font-tamil">ஜாதகம் கணிக்கவும் (Generate Horoscope)</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
