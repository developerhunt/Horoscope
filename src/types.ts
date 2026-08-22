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

export interface PlanetaryDegree {
  planet: string;
  degree: string;
  star: string;
  pada: string | number;
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
}
