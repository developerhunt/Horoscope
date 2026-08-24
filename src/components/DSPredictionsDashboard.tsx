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
  GitBranch
} from 'lucide-react';

interface DSPredictionsDashboardProps {
  data: HoroscopeData;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'அனைத்தும் (All)', icon: Layers },
  { id: 'general', label: 'லக்ன ஆய்வு (Lagna Analysis)', icon: Compass },
  { id: 'education', label: 'கல்வி & வித்யா (Education)', icon: GraduationCap },
  { id: 'marriage', label: 'திருமணம் (Marriage)', icon: Heart },
  { id: 'career', label: 'தொழில் & உத்தியோகம் (Career)', icon: Briefcase },
  { id: 'children', label: 'குழந்தை பாக்கியம் (Children)', icon: Baby },
  { id: 'finance', label: 'தனம் & கடன் (Finance)', icon: Coins },
  { id: 'property', label: 'வீடு & வாகனம் (Property & Vehicle)', icon: Home },
  { id: 'health', label: 'உடல்நலம் (Health)', icon: Activity },
  { id: 'agriculture', label: 'விவசாயம் & மண் (Agriculture)', icon: TreePine },
  { id: 'travel', label: 'பயணம் & வெளிநாடு (Travel)', icon: Plane },
  { id: 'body-parts', label: 'உடல் உறுப்பு ரகசியம் (Body Secrets)', icon: ShieldAlert },
  { id: 'rahu-ketu', label: 'ராகு-கேது அச்சு (Rahu-Ketu)', icon: Sparkles }
];

const PREDEFINED_QUESTIONS = [
  {
    q: 'எனக்கு எப்போது திருமணம் நடக்கும்?',
    category: 'marriage',
    subtext: 'மங்களகாரகன் செவ்வாய், 12-ஆம் அதிபதி மற்றும் நடப்பு தசா/புத்தி தொடர்பு'
  },
  {
    q: 'சொந்தத் தொழில் யோகம் உண்டா அல்லது வேலையா?',
    category: 'career',
    subtext: '10-ஆம் அதிபதியின் ஆட்சி/உச்சம் மற்றும் 6-ஆம் பாவகம்'
  },
  {
    q: 'அரசு வேலை (Govt Job) தேர்வு எழுதினால் வெற்றி கிடைக்குமா?',
    category: 'career',
    subtext: 'சூரியன், புதன், செவ்வாய், சனி கூட்டு யோகம்'
  },
  {
    q: 'சொந்த வீடு / மனை எப்போது அமையும்?',
    category: 'property',
    subtext: 'தாய்க்காரகன் சந்திரன் சுப பலம் மற்றும் 4-ஆம் பாவகம்'
  },
  {
    q: 'பழைய கடன்கள் எப்போது தீரும்?',
    category: 'finance',
    subtext: 'தசா/புக்தி லக்னத்திற்கு 6-ஆம் இடத்து கேது மற்றும் தன ஸ்தானம்'
  },
  {
    q: 'குழந்தை பாக்கியம் மற்றும் பாலினம் எவ்வாறு அமையும்?',
    category: 'children',
    subtext: 'புத்திரகாரகன் குருவுடன் ராகு/கேது சேர்க்கை & 5-ஆம் அதிபதி'
  },
  {
    q: 'விவசாய நிலம், தோட்டம் அமைத்தல் மற்றும் மண் வளம் எவ்வாறு இருக்கும்?',
    category: 'agriculture',
    subtext: 'ராசிகளின் கால்கள், சந்திரன்-சுக்கிரன் பலம் & மண் வள விதிகள் (DS-AGR)'
  },
  {
    q: 'வெளியூர் / வெளிநாட்டு பயணம் மற்றும் வரன் எந்த திசையில் அமையும்?',
    category: 'travel',
    subtext: '12-ஆம் மறைவு ஸ்தானம், திசைகள் மற்றும் பிரயாண தூர விதி (DS-TRV)'
  }
];

export const DSPredictionsDashboard: React.FC<DSPredictionsDashboardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [subLagnaMode, setSubLagnaMode] = useState<'dasa' | 'bhukti'>('dasa');

  const currentDasa = data.currentDasaBhukti?.dasaLord || 'குரு';
  const currentBhukti = data.currentDasaBhukti?.bhuktiLord || 'சுக்கிரன்';
  const dasaLagna = data.dsSystem?.dasaLagnaSign || data.basicDetails?.lagna || '';

  // Determine active prediction map based on toggle
  const activePredictionsMap = subLagnaMode === 'bhukti' && data.subLagnaPredictions
    ? data.subLagnaPredictions
    : data.dsPredictions || {};

  const toggleReasoning = (catKey: string) => {
    setExpandedReasoning(prev => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  // Convert map to list
  const predictionsList: DSPredictionItem[] = Object.values(activePredictionsMap);

  const filteredPredictions = predictionsList.filter(item => {
    if (activeTab !== 'all' && item.category !== activeTab) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.reasoning.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl text-slate-100 font-sans space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold font-tamil text-amber-300">
              D.S. Astro System • நூல்வழி தசா / புக்தி லக்ன ஆய்வு
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-tamil mt-1">
            ஆசிரியர்: T. ஜெய்சங்கர், மதுரை (அய்யன் ஆஸ்ட்ரோ அகாடமி) • 131 பக்கங்கள் கொண்ட மூலநூல் விதிகள்
          </p>
        </div>

        {/* Controls: Sub-Lagna Pivot Toggle & Current Dasa Snapshot */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sub-Lagna Switcher (Dasa Lagna vs Bhukti Sub-Lagna) */}
          <div className="bg-slate-950 border border-slate-700/80 p-1 rounded-xl flex items-center gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setSubLagnaMode('dasa')}
              className={`px-3 py-1 rounded-lg text-xs font-tamil font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                subLagnaMode === 'dasa'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>தசா லக்னம் (Dasa Lagna)</span>
            </button>
            <button
              type="button"
              onClick={() => setSubLagnaMode('bhukti')}
              className={`px-3 py-1 rounded-lg text-xs font-tamil font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                subLagnaMode === 'bhukti'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>புக்தி லக்னம் (Bhukti Sub-Lagna)</span>
            </button>
          </div>

          {/* Current Core Snapshot Badge */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-900/50 px-3 py-1.5 rounded-xl text-xs font-tamil">
            <span className="text-slate-400">மைய லக்னம்:</span>
            <span className="text-amber-300 font-bold">{dasaLagna}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-medium">{currentDasa} திசை - {currentBhukti} புக்தி</span>
          </div>
        </div>
      </div>

      {/* Interactive Quick Questions Box */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 font-tamil flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>விரைவு ஜோதிடக் கேள்விகள் (Instant Question Lookup)</span>
          </span>
          <span className="text-[11px] text-slate-500 font-tamil">நூல் விதிகளின்படி துல்லிய பதில்</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PREDEFINED_QUESTIONS.map((item, idx) => {
            const isSelected = selectedQuestion === item.q;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSelectedQuestion(null);
                  } else {
                    setSelectedQuestion(item.q);
                    setActiveTab(item.category);
                  }
                }}
                className={`text-left p-2.5 rounded-lg border transition-all text-xs font-tamil cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500/70 text-amber-200 shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100'
                }`}
              >
                <div className="font-semibold">{item.q}</div>
                <div className="text-[10.5px] text-slate-500 mt-0.5">{item.subtext}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Scrollable Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none text-xs font-tamil">
            {CATEGORY_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedQuestion(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative shrink-0 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="விதிகள் / பலன் தேடுக..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 font-tamil focus:outline-none focus:border-amber-500/60"
            />
          </div>
        </div>
      </div>

      {/* Filtered Predictions Cards */}
      <div className="space-y-4">
        {filteredPredictions.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/40 border border-slate-800/60 rounded-xl text-slate-400 font-tamil text-xs">
            தேர்ந்தெடுக்கப்பட்ட பிரிவில் பலன்கள் இல்லை.
          </div>
        ) : (
          filteredPredictions.map(item => {
            const isExpanded = !!expandedReasoning[item.category];
            const isCaution = item.status === 'caution';
            const isStrong = item.status === 'strong_indication';

            return (
              <div
                key={item.category}
                className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700/90 transition-all rounded-xl p-4 sm:p-5 space-y-3 shadow-md"
              >
                {/* Card Top Title & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/70 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base font-tamil text-amber-300">
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10.5px] px-2.5 py-0.5 rounded-full font-tamil font-bold ${
                        isCaution
                          ? 'bg-amber-950/60 border border-amber-600/50 text-amber-200'
                          : isStrong
                          ? 'bg-emerald-950/60 border border-emerald-600/50 text-emerald-200'
                          : 'bg-blue-950/60 border border-blue-600/50 text-blue-200'
                      }`}
                    >
                      {isCaution ? 'கவனம் / எச்சரிக்கை' : isStrong ? 'முழு பலம் / சுப யோகம்' : 'சாதகமான அமைப்பு'}
                    </span>
                  </div>
                </div>

                {/* Primary Synthesized Prediction Summary */}
                <div className="text-xs sm:text-[13px] leading-relaxed font-tamil text-slate-200 bg-slate-900/60 border border-slate-800/60 p-3 rounded-lg">
                  {item.summary}
                </div>

                {/* Signals / Key Supporting Points */}
                {item.signals && item.signals.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 font-tamil flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ஆதார சாதக நிலைகள்:</span>
                    </div>
                    <ul className="space-y-1 pl-4 text-xs font-tamil text-slate-300 list-disc marker:text-amber-400">
                      {item.signals.map((sig, sIdx) => (
                        <li key={sIdx}>{sig}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timing Window */}
                {item.timing && (
                  <div className="flex items-center gap-2 text-xs font-tamil bg-amber-950/20 border border-amber-900/40 px-3 py-2 rounded-lg text-amber-200">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      <strong>கால நிர்ணயம் (Timing Window):</strong> {item.timing.window || `${item.timing.dasa} தசையில் ${item.timing.bhukti} புக்தி`}
                    </span>
                  </div>
                )}

                {/* Matched Rules Citations from Book */}
                {item.matchedRules && item.matchedRules.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <div className="text-[11px] text-slate-400 font-tamil flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-amber-400" />
                      <span>நூல் மேற்கோள்:</span>
                    </div>
                    {item.matchedRules.map((rule, rIdx) => (
                      <span
                        key={rIdx}
                        className="bg-slate-900 border border-slate-700 text-slate-300 text-[10.5px] px-2 py-0.5 rounded font-tamil"
                      >
                        {rule.ruleId} • பக்கம் {rule.sourcePage} ({rule.title})
                      </span>
                    ))}
                  </div>
                )}

                {/* Step-by-Step Reasoning Toggle */}
                <div className="pt-2 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => toggleReasoning(item.category)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-tamil font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>ஏன் இந்த பலன்? (D.S. கணித விளக்கம்)</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 bg-slate-900/90 border border-amber-900/30 p-3 rounded-lg text-xs font-tamil leading-relaxed text-slate-300 animate-in fade-in duration-150">
                      {item.reasoning}
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
