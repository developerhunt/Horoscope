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

export interface DasaTimeline {
  dasaLord: string;
  startDate: string;
  endDate: string;
  duration: string;
  isCurrent?: boolean;
  activeBhukti?: string;
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
  rasiChart: ZodiacBox[];
  navamsamChart: ZodiacBox[];
  footerInfo: FooterInfo;
  nadiAnalysis?: NadiAnalysis;
  dsSystem?: DSSystemAnalysis;
  panchangam?: PanchangamDetails;
}
