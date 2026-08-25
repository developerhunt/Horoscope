export interface HoroscopeInput {
  name: string;
  gender: 'ஆண்' | 'பெண்' | 'இதர';
  dob: string;
  tob: string;
  pob: string;
  fatherName?: string;
  motherName?: string;
  lat?: string;
  lon?: string;
  timezone?: string;
  nodeCalculation?: 'mean' | 'true';
}

export interface BasicDetails {
  genderLabel: string;
  name: string;
  fatherName: string;
  motherName: string;
  dob: string;
  tob: string;
  pob: string;
  nakshatra: string;
  rasi: string;
  latLong: string;
  ayanamsa: string;
  lagna: string;
  sunrise: string;
  thithi: string;
}

export interface DivisionalChartInfo {
  code: 'D1' | 'D2' | 'D3' | 'D4' | 'D6' | 'D7' | 'D8' | 'D9' | 'D10' | 'D11' | 'D12' | 'D16' | 'D20' | 'D24' | 'D27' | 'D30' | 'D60';
  nameTamil: string;
  nameEnglish: string;
  division: number;
  significanceTamil: string;
  significanceEnglish: string;
  boxes: ZodiacBox[];
}

export interface AshtakavargaPlanetScore {
  planet: string;
  planetEnglish: string;
  bindus: number[]; // 12 values for signs 0 to 11
  total: number;
}

export interface AshtakavargaData {
  sarvashtakavarga: number[]; // 12 numbers for signs 0 to 11 (Mesham to Meenam)
  bhinnaAshtakavarga: Record<string, number[]>;
  planetScores: AshtakavargaPlanetScore[];
  totalBindus: number;
  highestRasi: { signIndex: number; signTamil: string; bindus: number };
  lowestRasi: { signIndex: number; signTamil: string; bindus: number };
}

export interface ShadbalaPlanet {
  planet: string;
  planetEnglish: string;
  sthanaBala: number; // in Virupas
  digBala: number;
  kaalaBala: number;
  chestaBala: number;
  naisargikaBala: number;
  drikBala: number;
  totalVirupas: number;
  totalRupas: number;
  requiredRupas: number;
  strengthRatio: number;
  percentage: number;
  rank: number;
  isStrong: boolean;
}

export interface ShadbalaData {
  planets: ShadbalaPlanet[];
  strongestPlanet: string;
  weakestPlanet: string;
}

export interface JaiminiKaraka {
  karakaCode: 'AK' | 'AmK' | 'BK' | 'MK' | 'PK' | 'GK' | 'DK';
  karakaNameTamil: string;
  karakaNameEnglish: string;
  significanceTamil: string;
  significanceEnglish: string;
  planetTamil: string;
  planetEnglish: string;
  degreeInRasi: number;
  degreeFormatted: string;
  signIndex: number;
  signTamil: string;
  rawLongitude: number;
}

export interface UpagrahaInfo {
  nameTamil: string;
  nameEnglish: string;
  rawLongitude: number;
  degreeFormatted: string;
  signIndex: number;
  signTamil: string;
  nakshatra: string;
  pada: number;
  starLord: string;
  significance: string;
}

export interface PlanetaryDegree {
  planet: string;
  degree: string;
  star: string;
  nakshatra?: string;
  pada: string | number;
  starLord?: string;
  star_lord?: string;
  rasi?: string;
  rasiIndex?: number;
  isRetrograde?: boolean;
  isCombust?: boolean;
  rawLongitude?: number;
}

export interface BhuktiTimeline {
  bhuktiLord: string;
  startDate: string;
  endDate: string;
  duration: string;
  isCurrent?: boolean;
}

export interface DasaTimeline {
  dasaLord: string;
  startDate: string;
  endDate: string;
  duration: string;
  isCurrent?: boolean;
  activeBhukti?: string;
  bhuktis?: BhuktiTimeline[];
}

export interface CurrentDasaBhuktiInfo {
  dasaLord: string;
  bhuktiLord: string;
  dasaStartDate: string;
  dasaEndDate: string;
  bhuktiStartDate: string;
  bhuktiEndDate: string;
  summaryText: string;
}

export interface ZodiacBox {
  id: number; // 0 to 11 (0: Mesham ... 11: Meenam)
  nameTamil: string;
  englishName: string;
  planets: string[];
  ashtakavargaBindu?: number;
  isLagna?: boolean;
}

export interface FooterInfo {
  janmaDasaIruppu: string;
  nadappuVayadu: string;
  nadappuDasaBhukti: string;
}

export interface NadiAnalysis {
  east: { planets: string[]; yoga: string };
  south: { planets: string[]; yoga: string };
  west: { planets: string[]; yoga: string };
  north: { planets: string[]; yoga: string };
  keyYogas: string[];
}

export interface DSSystemAnalysis {
  rahuKetuMidpoint1: string;
  rahuKetuMidpoint2: string;
  midpointHits: string[];
  currentDasaLord: string;
  dasaLagnaSign: string;
  dusthanaSummary: string[];
}

export interface DSPredictionRuleMatch {
  ruleId: string;
  title: string;
  sourcePage: number;
  section: string;
}

export interface DSPredictionTiming {
  dasa: string;
  bhukti: string;
  startDate?: string;
  endDate?: string;
  window?: string;
}

export interface DSPredictionItem {
  category: string;
  title: string;
  status: 'strong_indication' | 'moderate_indication' | 'favorable' | 'caution';
  summary: string;
  signals: string[];
  obstructions: string[];
  timing: DSPredictionTiming;
  matchedRules: DSPredictionRuleMatch[];
  reasoning: string;
}

export interface PanchangamDetails {
  thithi: string;
  paksham: string;
  nakshatra: string;
  pada: number;
  nithyaYoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  ayanamsaDeg: string;
}

export interface HoroscopeData {
  title: string;
  input: HoroscopeInput;
  basicDetails: BasicDetails;
  planetaryDegrees: PlanetaryDegree[];
  dasaTimelines: DasaTimeline[];
  currentDasaBhukti?: CurrentDasaBhuktiInfo;
  rasiChart: ZodiacBox[];
  navamsamChart: ZodiacBox[];
  footerInfo: FooterInfo;
  nadiAnalysis?: NadiAnalysis;
  dsSystem?: DSSystemAnalysis;
  panchangam?: PanchangamDetails;
  specialPredictions?: string[];
  dsPredictions?: Record<string, DSPredictionItem>;
  subLagnaPredictions?: Record<string, DSPredictionItem>;
  divisionalCharts?: Record<string, DivisionalChartInfo> | DivisionalChartInfo[];
  ashtakavarga?: AshtakavargaData;
  shadbala?: ShadbalaData;
  jaiminiKarakas?: JaiminiKaraka[];
  upagrahas?: UpagrahaInfo[];
}

// ==========================================
// MARRIAGE COMPATIBILITY (10 PORUTHAM) TYPES
// ==========================================

export interface PoruthamItem {
  id: string;
  nameTamil: string;
  nameEnglish: string;
  status: 'good' | 'average' | 'poor';
  resultTamil: string;
  score: number;
  maxScore: number;
  explanation: string;
  importance: 'critical' | 'high' | 'medium' | 'standard';
}

export interface KujaDoshaAnalysis {
  hasDosha: boolean;
  score: number; // 0 for none, 1-3 based on strength
  placements: string[];
  exceptions: string[];
  balanceStatus: string;
}

export interface PapaSamyamDetail {
  fromLagna: number;
  fromMoon: number;
  fromVenus: number;
  total: number;
  breakdown: string[];
}

export interface PapaSamyamAnalysis {
  boyPoints: number;
  girlPoints: number;
  boyDetails?: PapaSamyamDetail;
  girlDetails?: PapaSamyamDetail;
  difference: number;
  isBalanced: boolean;
  verdictTamil: string;
  verdictDescription: string;
}

export interface DasaSandhiOccurrence {
  person: 'boy' | 'girl';
  dasaEnding: string;
  dasaStarting: string;
  transitionDate: string;
  formattedDate: string;
  age: number;
}

export interface DasaSandhiAlert {
  boyTransition: DasaSandhiOccurrence;
  girlTransition: DasaSandhiOccurrence;
  gapMonths: number;
  description: string;
}

export interface DasaSandhiAnalysis {
  hasSandhiAlert: boolean;
  alerts: DasaSandhiAlert[];
  details: string;
}

export interface PersonMatchingSummary {
  name: string;
  gender: 'ஆண்' | 'பெண்';
  nakshatra: string;
  nakshatraIndex: number;
  pada: number;
  rasi: string;
  rasiIndex: number;
  rasiLord: string;
  gana: string;
  yoni: { animal: string; gender: string };
  rajju: string;
  hasFullChart: boolean;
  chartData?: HoroscopeData;
}

export interface MarriageCompatibilityResult {
  boy: PersonMatchingSummary;
  girl: PersonMatchingSummary;
  totalScore: number;
  maxScore: number;
  percentage: number;
  matchCount: number;
  isRajjuMatch: boolean;
  isVedhaMatch: boolean;
  finalVerdict: 'excellent' | 'moderate' | 'not_recommended';
  verdictTitleTamil: string;
  verdictSubtitleTamil: string;
  summaryTamil: string;
  poruthams: PoruthamItem[];
  kujaDosha: {
    boy: KujaDoshaAnalysis;
    girl: KujaDoshaAnalysis;
    isBalanced: boolean;
    balanceVerdict: string;
  };
  papaSamyam: PapaSamyamAnalysis;
  dasaSandhi: DasaSandhiAnalysis;
  recommendationsTamil: string[];
}
