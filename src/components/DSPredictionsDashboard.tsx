import React, { useState } from 'react';
import { HoroscopeData, DSPredictionItem } from '../types';
import {
  Compass,
  BookOpen,
  Calendar,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  GraduationCap,
  Heart,
  Briefcase,
  Baby,
  Coins,
  Home,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  TreePine,
  Plane,
  ShieldAlert,
  GitBranch,
  Flame,
  Clock,
  UserCheck,
  HeartHandshake,
  Check,
  Info
} from 'lucide-react';

interface DSPredictionsDashboardProps {
  data: HoroscopeData;
}

interface CategoryTabConfig {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badgeColor?: string;
}

const CATEGORY_TABS: CategoryTabConfig[] = [
  { id: 'all', label: 'அனைத்தும் (All Topics)', shortLabel: 'அனைத்தும்', icon: Layers },
  { id: 'education', label: 'கல்வி & வித்யா (Education)', shortLabel: 'கல்வி', icon: GraduationCap },
  { id: 'parents', label: 'பெற்றோர் நலம் & குழந்தை வளர்ப்பு (Parents & Upbringing)', shortLabel: 'பெற்றோர்', icon: HeartHandshake },
  { id: 'career', label: 'தொழில் & உத்தியோகம் (Career)', shortLabel: 'தொழில்', icon: Briefcase },
  { id: 'marriage', label: 'திருமணம் & வரன் (Marriage)', shortLabel: 'திருமணம்', icon: Heart },
  { id: 'children', label: 'குழந்தை பாக்கியம் & பாலினம் (Children)', shortLabel: 'குழந்தை/வம்சம்', icon: Baby },
  { id: 'finance', label: 'தனம் & கடன் நிவர்த்தி (Finance)', shortLabel: 'பொருளாதாரம்', icon: Coins },
  { id: 'property', label: 'வீடு & சொகுசு வாகனம் (Property & Vehicle)', shortLabel: 'வீடு/வாகனம்', icon: Home },
  { id: 'health', label: 'உடல் உறுப்புகள் & நோய்கள் (Health)', shortLabel: 'உடல்நலம்', icon: Activity },
  { id: 'agriculture', label: 'விவசாயம் & மண் வளம் (Agriculture)', shortLabel: 'விவசாயம்', icon: TreePine },
  { id: 'travel', label: 'பயணம் & வெளிநாடு (Travel)', shortLabel: 'பயணம்', icon: Plane },
  { id: 'rahu-ketu', label: 'ராகு-கேது கர்ம அச்சு (Rahu-Ketu Axis)', shortLabel: 'ராகு-கேது', icon: Sparkles },
  { id: 'intimacy', label: 'அந்தரங்க ஜோதிட ரகசியங்கள் (Intimacy & Morality)', shortLabel: 'அந்தரங்கம்', icon: Flame, badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60' },
  { id: 'general', label: 'லக்ன ஆய்வு & தசா நிலை (General)', shortLabel: 'பொது லக்னம்', icon: Compass }
];

interface QuickQuestion {
  q: string;
  category: string;
  subtext: string;
  ruleCitation: string;
  minAge?: number;
  maxAge?: number;
}

const PREDEFINED_QUESTIONS: QuickQuestion[] = [
  {
    q: 'கல்வி வளர்ச்சி, உயர் படிப்பு & தேர்ச்சி யோகம் எவ்வாறு உள்ளது?',
    category: 'education',
    subtext: 'வித்யாகாரகன் புதன், 4-ஆம் அதிபதி & குரு பார்வை',
    ruleCitation: 'பக்கம் 14, 42-43 (DS-EDU-001)'
  },
  {
    q: 'எனக்கு எப்போது திருமணம் நடக்கும்?',
    category: 'marriage',
    subtext: 'மங்களகாரகன் செவ்வாய், 12-ஆம் அதிபதி & தசாபுத்தி கால நிர்ணயம்',
    ruleCitation: 'பக்கம் 21-26 (DS-MAR-001)',
    minAge: 16
  },
  {
    q: 'சொந்தத் தொழில் யோகமா அல்லது உத்தியோகமா?',
    category: 'career',
    subtext: '10-ஆம் அதிபதி ஆட்சி/உச்சம் vs 6-ஆம் பாவகம் & சனி பார்வை',
    ruleCitation: 'பக்கம் 43-47 (DS-CAR-001)',
    minAge: 16
  },
  {
    q: 'அரசு வேலை (Govt Job) தேர்வு எழுதினால் வெற்றி கிடைக்குமா?',
    category: 'career',
    subtext: 'சூரியன், புதன், செவ்வாய், சனி கூட்டு யோகம்',
    ruleCitation: 'பக்கம் 44-45 (DS-CAR-002)',
    minAge: 16
  },
  {
    q: 'குழந்தை பாக்கியம் & பாலினம் (ஆண்/பெண்) எவ்வாறு அமையும்?',
    category: 'children',
    subtext: 'புத்திரகாரகன் குருவுடன் ராகு/கேது சேர்க்கை & 15 பாலின விதிகள்',
    ruleCitation: 'பக்கம் 36-48 (DS-CHL-001)',
    minAge: 18
  },
  {
    q: 'பழைய கடன்கள் எப்போது முழுமையாகத் தீரும்?',
    category: 'finance',
    subtext: 'தசா/புக்தி லக்னத்திற்கு 6-ஆம் இடத்து கேது & தன ஸ்தானம்',
    ruleCitation: 'பக்கம் 47-51 (DS-FIN-001)',
    minAge: 15
  },
  {
    q: 'சொந்த வீடு கட்டும் யோகம் & புதிய வாகனம் எப்போது அமையும்?',
    category: 'property',
    subtext: 'தாய்க்காரகன் சந்திரன் சுப பலம், 4-ஆம் பாவகம் & சுக்கிரன்+ராகு சேர்க்கை',
    ruleCitation: 'பக்கம் 54-56 (DS-PRP-001)',
    minAge: 15
  },
  {
    q: 'வெளியூர் / வெளிநாட்டு வேலை & குடியுரிமை யோகம் உண்டா?',
    category: 'travel',
    subtext: '3, 6, 8, 12 மறைவு ஸ்தானங்கள் மற்றும் திசை நிர்ணயம்',
    ruleCitation: 'பக்கம் 49-51 (DS-TRV-001)'
  },
  {
    q: 'விவசாய நிலம், தோட்டம் அமைத்தல் & மண் வளம் எவ்வாறு இருக்கும்?',
    category: 'agriculture',
    subtext: '12 ராசிகளின் 4 நிலை மண் வளம், கால்கள் மற்றும் சாகுபடி பயிர்கள்',
    ruleCitation: 'பக்கம் 15-22 (DS-AGR-001)'
  },
  {
    q: 'உடல் உறுப்பு பலவீனம் & நோய்கள் எப்போது குணமாகும்?',
    category: 'health',
    subtext: '6-ஆம் அதிபதி, சனி தொடர்பு மற்றும் 12 ராசி உடற்கூறியல்',
    ruleCitation: 'பக்கம் 12, 52-54 (DS-HLT-001)'
  },
  {
    q: 'அந்தரங்க தாம்பத்திய ஒழுக்கம், கற்பு நெறி & கள்ளத்தொடர்பு விழிப்புணர்வு நிலை என்ன?',
    category: 'intimacy',
    subtext: 'செவ்வாய்-சுக்கிரன் கட்டுப்பாடு, 4-8-12 மறைவு ஸ்தானங்கள் & சந்திரன்-புதன்-சுக்கிரன் சேர்க்கை',
    ruleCitation: 'பக்கம் 35, 97-124 (DS-INT-001)',
    minAge: 18,
    maxAge: 65
  }
];

export const DSPredictionsDashboard: React.FC<DSPredictionsDashboardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [subLagnaMode, setSubLagnaMode] = useState<'dasa' | 'bhukti'>('dasa');
  const [copiedRuleId, setCopiedRuleId] = useState<string | null>(null);

  const currentDasa = data.currentDasaBhukti?.dasaLord || 'குரு';
  const currentBhukti = data.currentDasaBhukti?.bhuktiLord || 'சுக்கிரன்';
  const dasaLagna = data.dsSystem?.dasaLagnaSign || data.basicDetails?.lagna || '';

  // Calculate age dynamically
  const calculateAge = (): { age: number; stage: string } => {
    const dobStr = data.basicDetails?.dob || (data as any).input?.dob;
    if (!dobStr) return { age: 30, stage: 'குடும்ப & நடுத்தர பருவம்' };
    const parts = dobStr.includes('-') ? dobStr.split('-') : dobStr.split('/');
    if (parts.length < 3) return { age: 30, stage: 'குடும்ப & நடுத்தர பருவம்' };
    const bDate = parts[0].length === 4
      ? new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      : new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const now = new Date();
    let age = now.getFullYear() - bDate.getFullYear();
    const m = now.getMonth() - bDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < bDate.getDate())) {
      age--;
    }
    age = Math.max(0, age);

    let stage = 'குடும்ப & நடுத்தர பருவம்';
    if (age < 15) stage = 'இளமை & ஆரம்பக் கல்விப் பருவம்';
    else if (age < 25) stage = 'இளமை & உயர்கல்வி / ஆரம்ப வாழ்க்கை';
    else if (age < 55) stage = 'தொழில், திருமணம் & குடும்ப பருவம்';
    else stage = 'முதுமை, பேரக்குழந்தை & ஆன்மீக பருவம்';

    return { age, stage };
  };

  const { age: userAge, stage: userAgeStage } = calculateAge();

  // Determine active prediction map based on toggle
  const activePredictionsMap = subLagnaMode === 'bhukti' && data.subLagnaPredictions
    ? data.subLagnaPredictions
    : data.dsPredictions || {};

  const toggleReasoning = (catKey: string) => {
    setExpandedReasoning(prev => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  const copyRuleInfo = (ruleText: string, id: string) => {
    navigator.clipboard?.writeText(ruleText);
    setCopiedRuleId(id);
    setTimeout(() => setCopiedRuleId(null), 2000);
  };

  // Convert map to list
  const predictionsList: DSPredictionItem[] = Object.values(activePredictionsMap);

  // Compute category counts
  const categoryCounts = predictionsList.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  // Dynamic available tabs based on generated categories
  const availableTabs = CATEGORY_TABS.filter(tab => tab.id === 'all' || (categoryCounts[tab.id] && categoryCounts[tab.id] > 0));

  // Filter available quick questions based on user age
  const availableQuestions = PREDEFINED_QUESTIONS.filter(q => {
    if (q.minAge !== undefined && userAge < q.minAge) return false;
    if (q.maxAge !== undefined && userAge > q.maxAge) return false;
    return true;
  });

  const filteredPredictions = predictionsList.filter(item => {
    if (activeTab !== 'all' && item.category !== activeTab) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchReasoning = item.reasoning.toLowerCase().includes(q);
      const matchSignals = item.signals?.some(s => s.toLowerCase().includes(q));
      const matchTiming = item.timing?.window?.toLowerCase().includes(q) ||
                          item.timing?.dasa?.toLowerCase().includes(q) ||
                          item.timing?.bhukti?.toLowerCase().includes(q);
      const matchRules = item.matchedRules?.some(r => r.title.toLowerCase().includes(q) || r.ruleId.toLowerCase().includes(q));
      return matchTitle || matchSummary || matchReasoning || matchSignals || matchTiming || matchRules;
    }
    return true;
  });

  return (
    <div id="ds-predictions-dashboard" className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-7 shadow-2xl text-slate-100 font-sans space-y-6">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner & Dynamic Pivot Mode Switcher                */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-xl font-bold font-tamil text-amber-300 tracking-wide flex items-center gap-2">
                <span>D.S. Astro System • முழுமையான பலன் நிர்ணய பலகை</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                  131 பக்க மூலநூல் கணிதம்
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-tamil mt-0.5">
                ஆசிரியர்: <strong className="text-slate-300">T. ஜெய்சங்கர், மதுரை</strong> (அய்யன் ஆஸ்ட்ரோ அகாடமி) • தசாநாதன் இருக்கும் இடமே லக்னம்
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Pivot Lagna Mode Switcher & Current Timing Snapshot */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sub-Lagna Switcher */}
          <div className="bg-slate-950 border border-slate-700/80 p-1 rounded-xl flex items-center gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setSubLagnaMode('dasa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-tamil font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                subLagnaMode === 'dasa'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="தசா நாதன் நின்ற வீட்டை லக்னமாக பாவித்து முழுமையான தசா கால பலன்"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>தசா லக்னம் (Dasa Lagna)</span>
            </button>
            <button
              type="button"
              onClick={() => setSubLagnaMode('bhukti')}
              className={`px-3 py-1.5 rounded-lg text-xs font-tamil font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                subLagnaMode === 'bhukti'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="நடப்பு புக்தி நாதனை உப-லக்னமாக வைத்து உடனடி நடப்பு கால பலன்"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>புக்தி உப-லக்னம் (Bhukti Sub-Lagna)</span>
            </button>
          </div>

          {/* Life-Stage & Age Awareness Badge */}
          <div className="flex items-center gap-2 bg-slate-950/90 border border-sky-900/60 px-3.5 py-1.5 rounded-xl text-xs font-tamil shadow-sm">
            <UserCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400 font-medium">வயது:</span>
            <span className="text-sky-300 font-bold">{userAge} வயது</span>
            <span className="text-slate-600 font-mono">|</span>
            <span className="text-sky-400 font-semibold">{userAgeStage}</span>
          </div>

          {/* Current Core Snapshot Badge */}
          <div className="flex items-center gap-2 bg-slate-950/90 border border-amber-900/60 px-3.5 py-1.5 rounded-xl text-xs font-tamil shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-medium">இயங்கும் லக்னம்:</span>
            <span className="text-amber-300 font-bold">{dasaLagna}</span>
            <span className="text-slate-600 font-mono">|</span>
            <span className="text-emerald-400 font-semibold">{currentDasa} திசை - {currentBhukti} புக்தி</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Interactive Instant Question Lookup (ஜோதிடக் கேள்வி வழிகாட்டி) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-amber-300 font-tamil">
              விரைவு ஜோதிடக் கேள்விகள் (Instant Question Lookup)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-tamil flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-500" />
            வயது & தசா நிலைக்கு ஏற்ற கேள்விகளைத் தேர்ந்தெடுத்து துல்லிய பலனை உடனடியாக அறியலாம்
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          {availableQuestions.map((item, idx) => {
            const isSelected = selectedQuestion === item.q;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSelectedQuestion(null);
                    setActiveTab('all');
                  } else {
                    setSelectedQuestion(item.q);
                    setActiveTab(item.category);
                  }
                }}
                className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all text-xs font-tamil cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-amber-950/50 border-amber-500 text-amber-100 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-200 text-xs leading-snug line-clamp-2">
                    {item.q}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-normal line-clamp-2">
                    {item.subtext}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[9.5px] font-mono text-amber-400/90 pt-1 border-t border-slate-800/60">
                  <span>{item.ruleCitation}</span>
                  {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Category Tabs & Live Search Bar                            */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Scrollable Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 max-w-full scrollbar-none text-xs font-tamil">
            {availableTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = tab.id === 'all' ? predictionsList.length : (categoryCounts[tab.id] || 0);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedQuestion(null);
                  }}
                  className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-lg shadow-amber-500/20'
                      : tab.badgeColor
                      ? `${tab.badgeColor} hover:bg-slate-800 text-slate-200`
                      : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{tab.shortLabel}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-slate-950 text-amber-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative shrink-0 lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="விதிகள், கிரகம், பலன் தேடுக..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 font-tamil focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/40"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Comprehensive Predictions Grid / Cards                     */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        {filteredPredictions.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-400 font-tamil space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400/60 mx-auto" />
            <p className="text-sm font-semibold">தேர்ந்தெடுக்கப்பட்ட பிரிவில் பலன்கள் பொருந்தவில்லை.</p>
            <p className="text-xs text-slate-500">தேடல் சொல்லை மாற்றவும் அல்லது 'அனைத்தும்' பிரிவை அழுத்தவும்.</p>
          </div>
        ) : (
          filteredPredictions.map(item => {
            const isExpanded = !!expandedReasoning[item.category];
            const isCaution = item.status === 'caution';
            const isStrong = item.status === 'strong_indication';
            const isFavorable = item.status === 'favorable';

            // Distinctive Border & Background per category or status
            const cardBorderClass = item.category === 'intimacy'
              ? 'border-rose-900/50 bg-gradient-to-br from-slate-950 via-slate-950 to-rose-950/20'
              : isCaution
              ? 'border-amber-900/60 bg-gradient-to-br from-slate-950 via-slate-950 to-amber-950/20'
              : isStrong
              ? 'border-emerald-900/60 bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/20'
              : 'border-slate-800 bg-slate-950/90';

            const CategoryIcon = CATEGORY_TABS.find(t => t.id === item.category)?.icon || Sparkles;

            return (
              <div
                key={item.category}
                id={`pred-${item.category}`}
                className={`border rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl transition-all hover:border-slate-700 ${cardBorderClass}`}
              >
                
                {/* 1. Header: Title, Category Badge & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-xl border ${
                      item.category === 'intimacy'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : isCaution
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}>
                      <CategoryIcon className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base font-tamil text-amber-200 tracking-wide">
                        {item.title}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        Category: {item.category.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] px-3 py-1 rounded-full font-tamil font-bold flex items-center gap-1.5 shadow-sm ${
                        item.category === 'intimacy' && isCaution
                          ? 'bg-rose-950/80 border border-rose-600/70 text-rose-200'
                          : isCaution
                          ? 'bg-amber-950/80 border border-amber-600/70 text-amber-200'
                          : isStrong
                          ? 'bg-emerald-950/80 border border-emerald-500/70 text-emerald-200'
                          : isFavorable
                          ? 'bg-blue-950/80 border border-blue-500/70 text-blue-200'
                          : 'bg-indigo-950/80 border border-indigo-500/70 text-indigo-200'
                      }`}
                    >
                      {item.category === 'intimacy' && <Flame className="w-3 h-3 text-rose-400" />}
                      {isCaution && !item.category.includes('intimacy') && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                      {(isStrong || isFavorable) && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      <span>
                        {isCaution ? 'கவனம் / எச்சரிக்கை' : isStrong ? 'முழு பலம் / சுப யோகம்' : 'சாதகமான அமைப்பு'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* 2. Explicit Timing Presentation (கால நிர்ணயம் Highlight) */}
                {item.timing && (
                  <div className="bg-gradient-to-r from-emerald-950/40 via-amber-950/30 to-slate-900 border border-emerald-800/50 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider font-tamil flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>நிகழ்வு கால நிர்ணயம் (Exact Event Timing Window):</span>
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-amber-200 font-tamil mt-0.5">
                          {item.timing.window || `${item.timing.dasa} தசையில் ${item.timing.bhukti} புக்தி காலம்`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className="text-[10.5px] px-2.5 py-1 bg-slate-950/80 border border-amber-900/60 rounded-lg text-slate-300 font-tamil font-mono">
                        {item.timing.dasa} தசை ➔ {item.timing.bhukti} புக்தி
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. Primary Synthesized Prediction Summary (முதன்மைப் பலன்) */}
                <div className="text-xs sm:text-sm leading-relaxed font-tamil text-slate-100 bg-slate-900/70 border border-slate-800/80 p-4 rounded-xl shadow-sm space-y-1">
                  <div className="text-[11px] font-bold text-amber-400/90 font-tamil uppercase flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>முதன்மைப் பலன் தீர்ப்பு (Core Astrological Verdict):</span>
                  </div>
                  <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed pt-0.5">
                    {item.summary}
                  </p>
                </div>

                {/* 4. Supporting Signals (ஆதார சாதக நிலைகள்) */}
                {item.signals && item.signals.length > 0 && (
                  <div className="space-y-2 bg-slate-950/60 border border-slate-800/60 p-3.5 rounded-xl">
                    <div className="text-[11.5px] font-bold text-slate-300 font-tamil flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>ஜாதக அமைப்பு & காரணிகள் (Chart Indications):</span>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                      {item.signals.map((sig, sIdx) => (
                        <li
                          key={sIdx}
                          className="flex items-start gap-2 text-xs font-tamil text-slate-300 bg-slate-900/50 border border-slate-800/70 p-2 rounded-lg"
                        >
                          <span className="text-amber-400 font-bold text-sm leading-none">•</span>
                          <span className="leading-snug">{sig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 5. Obstructions & Cautionary Callouts (தடை மற்றும் விழிப்புணர்வு) */}
                {item.obstructions && item.obstructions.length > 0 && (
                  <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-3.5 space-y-1.5 text-xs font-tamil text-rose-200 shadow-inner">
                    <div className="flex items-center gap-2 font-bold text-rose-300">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>கவனிக்க வேண்டிய தடைகள் & விழிப்புணர்வு (Caution / Remedies):</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      {item.obstructions.map((obs, oIdx) => (
                        <li key={oIdx}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 6. Authentic Book Source Citations (நூல் ஆதார மேற்கோள்) */}
                {item.matchedRules && item.matchedRules.length > 0 && (
                  <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 font-tamil flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>நூல் ஆதார மேற்கோள் (Authentic Book Reference):</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-tamil">
                        ஆசிரியர்: T. ஜெய்சங்கர்
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.matchedRules.map((rule, rIdx) => {
                        const isCopied = copiedRuleId === rule.ruleId;
                        return (
                          <div
                            key={rIdx}
                            onClick={() => copyRuleInfo(`${rule.ruleId}: பக்கம் ${rule.sourcePage} - ${rule.title}`, rule.ruleId)}
                            className="bg-slate-900 border border-slate-700/80 hover:border-amber-500/60 transition-all text-slate-300 text-[11px] px-2.5 py-1 rounded-lg font-tamil flex items-center gap-2 cursor-pointer shadow-sm group"
                            title="விவரங்களை நகலெடுக்க அழுத்தவும்"
                          >
                            <span className="font-mono font-bold text-amber-400 group-hover:text-amber-300">
                              {rule.ruleId}
                            </span>
                            <span className="text-slate-500">|</span>
                            <span className="text-emerald-400 font-semibold">
                              பக்கம் {rule.sourcePage}
                            </span>
                            <span className="text-slate-400 hidden sm:inline">
                              ({rule.title})
                            </span>
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7. Step-by-Step Reasoning Toggle (D.S. கணித விளக்கம்) */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => toggleReasoning(item.category)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/60 hover:border-amber-500/40 text-xs text-amber-300 font-tamil font-semibold transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>ஏன் இந்த பலன்? (D.S. Astro கணித விளக்கம் & விதிமுறை)</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <span>{isExpanded ? 'மறைக்க' : 'காண்க'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-400" />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 bg-slate-900/90 border border-amber-900/40 p-4 rounded-xl text-xs sm:text-[12.5px] font-tamil leading-relaxed text-slate-300 space-y-2 animate-in fade-in duration-200">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                        <Info className="w-3.5 h-3.5" />
                        <span>கணித சூத்திர விளக்கம்:</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                        {item.reasoning}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. Footer Authenticity & System Note                          */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center space-y-1.5 text-xs font-tamil text-slate-400">
        <p className="text-amber-300/90 font-medium">
          D.S. Astro கணிதப் பலகையின் கணிப்புகள் அனைத்தும் அய்யன் ஆஸ்ட்ரோ அகாடமி, மதுரை வெளியீடான 131 பக்க மூலநூலின் விதிகளின்படி துல்லியமாக கணிக்கப்பட்டுள்ளன.
        </p>
        <p className="text-[11px] text-slate-500">
          அனைத்து தசா புத்தி மற்றும் தசா லக்ன / புக்தி உப-லக்ன பிவோட் கணக்கீடுகளும் கணித ரீதியாக மட்டுமே உருவாக்கப்பட்டுள்ளன.
        </p>
      </div>

    </div>
  );
};
