import {
  HoroscopeData,
  PoruthamItem,
  KujaDoshaAnalysis,
  PapaSamyamAnalysis,
  PapaSamyamDetail,
  DasaSandhiAnalysis,
  DasaSandhiAlert,
  PersonMatchingSummary,
  MarriageCompatibilityResult
} from '../types';
import {
  NAKSHATRAS,
  RASI_NAMES_TAMIL,
  SIGN_LORDS,
  PlanetPosition
} from './astroEngine';

// ==========================================
// 1. CLASSICAL NAKSHATRA ATTRIBUTES METADATA
// ==========================================

export type GanaType = 'தேவ' | 'மனித' | 'ராட்சச';
export type RajjuType = 'சிரசு' | 'கண்டம்' | 'உதரம்' | 'தொடை' | 'பாதம்';

export interface NakshatraMasterData {
  index: number;
  nameTamil: string;
  nameEnglish: string;
  gana: GanaType;
  yoniAnimal: string;
  yoniGender: 'ஆண்' | 'பெண்';
  rajju: RajjuType;
  vedhaStarIndices: number[]; // Stars that cause Vedhai dosha with this star
  defaultRasiIndex: number;
  padaRasiMap: [number, number, number, number]; // Rasi index for Pada 1, 2, 3, 4
}

export const NAKSHATRA_DATABASE: NakshatraMasterData[] = [
  {
    index: 0,
    nameTamil: 'அஸ்வினி',
    nameEnglish: 'Ashwini',
    gana: 'தேவ',
    yoniAnimal: 'குதிரை',
    yoniGender: 'ஆண்',
    rajju: 'பாதம்',
    vedhaStarIndices: [17], // Kettai
    defaultRasiIndex: 0,
    padaRasiMap: [0, 0, 0, 0] // Mesham
  },
  {
    index: 1,
    nameTamil: 'பரணி',
    nameEnglish: 'Bharani',
    gana: 'மனித',
    yoniAnimal: 'யானை',
    yoniGender: 'ஆண்',
    rajju: 'தொடை',
    vedhaStarIndices: [16], // Anusham
    defaultRasiIndex: 0,
    padaRasiMap: [0, 0, 0, 0] // Mesham
  },
  {
    index: 2,
    nameTamil: 'கார்த்திகை',
    nameEnglish: 'Krittika',
    gana: 'ராட்சச',
    yoniAnimal: 'ஆடு',
    yoniGender: 'பெண்',
    rajju: 'உதரம்',
    vedhaStarIndices: [15], // Visakam
    defaultRasiIndex: 1,
    padaRasiMap: [0, 1, 1, 1] // Pada 1 Mesham, 2,3,4 Rishabam
  },
  {
    index: 3,
    nameTamil: 'ரோகிணி',
    nameEnglish: 'Rohini',
    gana: 'மனித',
    yoniAnimal: 'பாம்பு',
    yoniGender: 'ஆண்',
    rajju: 'கண்டம்',
    vedhaStarIndices: [14], // Swathi
    defaultRasiIndex: 1,
    padaRasiMap: [1, 1, 1, 1] // Rishabam
  },
  {
    index: 4,
    nameTamil: 'மிருகசீரிஷம்',
    nameEnglish: 'Mrigashirsha',
    gana: 'தேவ',
    yoniAnimal: 'மான்',
    yoniGender: 'பெண்',
    rajju: 'சிரசு',
    vedhaStarIndices: [13, 22], // Chithirai, Avittam
    defaultRasiIndex: 1,
    padaRasiMap: [1, 1, 2, 2] // Pada 1,2 Rishabam, 3,4 Mithunam
  },
  {
    index: 5,
    nameTamil: 'திருவாதிரை',
    nameEnglish: 'Ardra',
    gana: 'மனித',
    yoniAnimal: 'நாய்',
    yoniGender: 'பெண்',
    rajju: 'கண்டம்',
    vedhaStarIndices: [21], // Thiruvonam
    defaultRasiIndex: 2,
    padaRasiMap: [2, 2, 2, 2] // Mithunam
  },
  {
    index: 6,
    nameTamil: 'புனர்பூசம்',
    nameEnglish: 'Punarvasu',
    gana: 'தேவ',
    yoniAnimal: 'பூனை',
    yoniGender: 'பெண்',
    rajju: 'உதரம்',
    vedhaStarIndices: [20], // Uthiradam
    defaultRasiIndex: 2,
    padaRasiMap: [2, 2, 2, 3] // Pada 1,2,3 Mithunam, 4 Katakam
  },
  {
    index: 7,
    nameTamil: 'பூசம்',
    nameEnglish: 'Pushya',
    gana: 'தேவ',
    yoniAnimal: 'ஆடு',
    yoniGender: 'ஆண்',
    rajju: 'தொடை',
    vedhaStarIndices: [19], // Pooradam
    defaultRasiIndex: 3,
    padaRasiMap: [3, 3, 3, 3] // Katakam
  },
  {
    index: 8,
    nameTamil: 'ஆயில்யம்',
    nameEnglish: 'Ashlesha',
    gana: 'ராட்சச',
    yoniAnimal: 'பூனை',
    yoniGender: 'ஆண்',
    rajju: 'பாதம்',
    vedhaStarIndices: [18], // Moolam
    defaultRasiIndex: 3,
    padaRasiMap: [3, 3, 3, 3] // Katakam
  },
  {
    index: 9,
    nameTamil: 'மகம்',
    nameEnglish: 'Magha',
    gana: 'ராட்சச',
    yoniAnimal: 'எலி',
    yoniGender: 'ஆண்',
    rajju: 'பாதம்',
    vedhaStarIndices: [26], // Revathi
    defaultRasiIndex: 4,
    padaRasiMap: [4, 4, 4, 4] // Simham
  },
  {
    index: 10,
    nameTamil: 'பூரம்',
    nameEnglish: 'Purva Phalguni',
    gana: 'மனித',
    yoniAnimal: 'எலி',
    yoniGender: 'பெண்',
    rajju: 'தொடை',
    vedhaStarIndices: [25], // Uthirattathi
    defaultRasiIndex: 4,
    padaRasiMap: [4, 4, 4, 4] // Simham
  },
  {
    index: 11,
    nameTamil: 'உத்திரம்',
    nameEnglish: 'Uttara Phalguni',
    gana: 'மனித',
    yoniAnimal: 'பசு',
    yoniGender: 'ஆண்',
    rajju: 'உதரம்',
    vedhaStarIndices: [24], // Poorattathi
    defaultRasiIndex: 5,
    padaRasiMap: [4, 5, 5, 5] // Pada 1 Simham, 2,3,4 Kanni
  },
  {
    index: 12,
    nameTamil: 'அஸ்தம்',
    nameEnglish: 'Hasta',
    gana: 'தேவ',
    yoniAnimal: 'எருமை',
    yoniGender: 'பெண்',
    rajju: 'கண்டம்',
    vedhaStarIndices: [23, 13], // Sadhayam, Chithirai
    defaultRasiIndex: 5,
    padaRasiMap: [5, 5, 5, 5] // Kanni
  },
  {
    index: 13,
    nameTamil: 'சித்திரை',
    nameEnglish: 'Chitra',
    gana: 'ராட்சச',
    yoniAnimal: 'புலி',
    yoniGender: 'பெண்',
    rajju: 'சிரசு',
    vedhaStarIndices: [4, 12, 22], // Mrigasheersham, Hastham, Avittam
    defaultRasiIndex: 6,
    padaRasiMap: [5, 5, 6, 6] // Pada 1,2 Kanni, 3,4 Thulam
  },
  {
    index: 14,
    nameTamil: 'சுவாதி',
    nameEnglish: 'Swati',
    gana: 'தேவ',
    yoniAnimal: 'எருமை',
    yoniGender: 'ஆண்',
    rajju: 'கண்டம்',
    vedhaStarIndices: [3], // Rohini
    defaultRasiIndex: 6,
    padaRasiMap: [6, 6, 6, 6] // Thulam
  },
  {
    index: 15,
    nameTamil: 'விசாகம்',
    nameEnglish: 'Vishakha',
    gana: 'ராட்சச',
    yoniAnimal: 'புலி',
    yoniGender: 'ஆண்',
    rajju: 'உதரம்',
    vedhaStarIndices: [2], // Karthigai
    defaultRasiIndex: 6,
    padaRasiMap: [6, 6, 6, 7] // Pada 1,2,3 Thulam, 4 Vrichikam
  },
  {
    index: 16,
    nameTamil: 'அனுஷம்',
    nameEnglish: 'Anuradha',
    gana: 'தேவ',
    yoniAnimal: 'மான்',
    yoniGender: 'பெண்',
    rajju: 'தொடை',
    vedhaStarIndices: [1], // Bharani
    defaultRasiIndex: 7,
    padaRasiMap: [7, 7, 7, 7] // Vrichikam
  },
  {
    index: 17,
    nameTamil: 'கேட்டை',
    nameEnglish: 'Jyeshtha',
    gana: 'ராட்சச',
    yoniAnimal: 'மான்',
    yoniGender: 'ஆண்',
    rajju: 'பாதம்',
    vedhaStarIndices: [0], // Aswini
    defaultRasiIndex: 7,
    padaRasiMap: [7, 7, 7, 7] // Vrichikam
  },
  {
    index: 18,
    nameTamil: 'மூலம்',
    nameEnglish: 'Mula',
    gana: 'ராட்சச',
    yoniAnimal: 'நாய்',
    yoniGender: 'ஆண்',
    rajju: 'பாதம்',
    vedhaStarIndices: [8], // Ayilyam
    defaultRasiIndex: 8,
    padaRasiMap: [8, 8, 8, 8] // Dhanusu
  },
  {
    index: 19,
    nameTamil: 'பூராடம்',
    nameEnglish: 'Purva Ashadha',
    gana: 'மனித',
    yoniAnimal: 'குரங்கு',
    yoniGender: 'ஆண்',
    rajju: 'தொடை',
    vedhaStarIndices: [7], // Poosam
    defaultRasiIndex: 8,
    padaRasiMap: [8, 8, 8, 8] // Dhanusu
  },
  {
    index: 20,
    nameTamil: 'உத்திராடம்',
    nameEnglish: 'Uttara Ashadha',
    gana: 'மனித',
    yoniAnimal: 'பசு',
    yoniGender: 'பெண்',
    rajju: 'உதரம்',
    vedhaStarIndices: [6], // Punarpoosam
    defaultRasiIndex: 9,
    padaRasiMap: [8, 9, 9, 9] // Pada 1 Dhanusu, 2,3,4 Makaram
  },
  {
    index: 21,
    nameTamil: 'திருவோணம்',
    nameEnglish: 'Shravana',
    gana: 'தேவ',
    yoniAnimal: 'குரங்கு',
    yoniGender: 'பெண்',
    rajju: 'கண்டம்',
    vedhaStarIndices: [5], // Thiruvathirai
    defaultRasiIndex: 9,
    padaRasiMap: [9, 9, 9, 9] // Makaram
  },
  {
    index: 22,
    nameTamil: 'அவிட்டம்',
    nameEnglish: 'Dhanishta',
    gana: 'ராட்சச',
    yoniAnimal: 'சிங்கம்',
    yoniGender: 'பெண்',
    rajju: 'சிரசு',
    vedhaStarIndices: [4, 13], // Mrigasheersham, Chithirai
    defaultRasiIndex: 9,
    padaRasiMap: [9, 9, 10, 10] // Pada 1,2 Makaram, 3,4 Kumbam
  },
  {
    index: 23,
    nameTamil: 'சதயம்',
    nameEnglish: 'Shatabhisha',
    gana: 'ராட்சச',
    yoniAnimal: 'குதிரை',
    yoniGender: 'பெண்',
    rajju: 'கண்டம்',
    vedhaStarIndices: [12], // Hastham
    defaultRasiIndex: 10,
    padaRasiMap: [10, 10, 10, 10] // Kumbam
  },
  {
    index: 24,
    nameTamil: 'பூரட்டாதி',
    nameEnglish: 'Purva Bhadrapada',
    gana: 'மனித',
    yoniAnimal: 'சிங்கம்',
    yoniGender: 'ஆண்',
    rajju: 'உதரம்',
    vedhaStarIndices: [11], // Uthiram
    defaultRasiIndex: 10,
    padaRasiMap: [10, 10, 10, 11] // Pada 1,2,3 Kumbam, 4 Meenam
  },
  {
    index: 25,
    nameTamil: 'உத்திரட்டாதி',
    nameEnglish: 'Uttara Bhadrapada',
    gana: 'மனித',
    yoniAnimal: 'பசு',
    yoniGender: 'பெண்',
    rajju: 'தொடை',
    vedhaStarIndices: [10], // Pooram
    defaultRasiIndex: 11,
    padaRasiMap: [11, 11, 11, 11] // Meenam
  },
  {
    index: 26,
    nameTamil: 'ரேவதி',
    nameEnglish: 'Revati',
    gana: 'தேவ',
    yoniAnimal: 'யானை',
    yoniGender: 'பெண்',
    rajju: 'பாதம்',
    vedhaStarIndices: [9], // Magam
    defaultRasiIndex: 11,
    padaRasiMap: [11, 11, 11, 11] // Meenam
  }
];

// Animal enmity table (Strict enemies in Yoni Matching)
const YONI_ENEMIES: Record<string, string[]> = {
  'குதிரை': ['எருமை'],
  'எருமை': ['குதிரை'],
  'யானை': ['சிங்கம்'],
  'சிங்கம்': ['யானை'],
  'ஆடு': ['குரங்கு'],
  'குரங்கு': ['ஆடு'],
  'பாம்பு': ['கீரி', 'எலி', 'பூனை'],
  'நாய்': ['மான்'],
  'மான்': ['நாய்'],
  'பூனை': ['எலி', 'பாம்பு'],
  'எலி': ['பூனை', 'பாம்பு'],
  'பசு': ['புலி'],
  'புலி': ['பசு']
};

// Classical Vasiya table (Girl Rasi -> Attracted Boy Rasis)
const VASIYA_MAP: Record<number, number[]> = {
  0: [4, 7],    // Mesham -> Simham, Vrichikam
  1: [3, 6],    // Rishabam -> Katakam, Thulam
  2: [5],       // Mithunam -> Kanni
  3: [8, 7],    // Katakam -> Dhanusu, Vrichikam
  4: [9],       // Simham -> Makaram
  5: [1, 11],   // Kanni -> Rishabam, Meenam
  6: [9],       // Thulam -> Makaram
  7: [3, 5],    // Vrichikam -> Katakam, Kanni
  8: [11],      // Dhanusu -> Meenam
  9: [0, 10],   // Makaram -> Mesham, Kumbam
  10: [11],     // Kumbam -> Meenam
  11: [9]       // Meenam -> Makaram
};

// Planetary Relationships for Rasi Adhipathi Porutham
// Mitra (Friend), Sama (Neutral), Sathru (Enemy)
const PLANETARY_FRIENDSHIPS: Record<string, { friends: string[]; neutrals: string[]; enemies: string[] }> = {
  'சூரியன்': {
    friends: ['சந்திரன்', 'செவ்வாய்', 'குரு'],
    neutrals: ['புதன்'],
    enemies: ['சுக்கிரன்', 'சனி', 'ராகு', 'கேது']
  },
  'சந்திரன்': {
    friends: ['சூரியன்', 'புதன்'],
    neutrals: ['செவ்வாய்', 'குரு', 'சுக்கிரன்', 'சனி'],
    enemies: ['ராகு', 'கேது']
  },
  'செவ்வாய்': {
    friends: ['சூரியன்', 'சந்திரன்', 'குரு'],
    neutrals: ['சுக்கிரன்', 'சனி'],
    enemies: ['புதன்', 'ராகு', 'கேது']
  },
  'புதன்': {
    friends: ['சூரியன்', 'சுக்கிரன்'],
    neutrals: ['செவ்வாய்', 'குரு', 'சனி'],
    enemies: ['சந்திரன்', 'ராகு', 'கேது']
  },
  'குரு': {
    friends: ['சூரியன்', 'சந்திரன்', 'செவ்வாய்'],
    neutrals: ['சனி'],
    enemies: ['புதன்', 'சுக்கிரன்']
  },
  'சுக்கிரன்': {
    friends: ['புதன்', 'சனி'],
    neutrals: ['செவ்வாய்', 'குரு'],
    enemies: ['சூரியன்', 'சந்திரன்']
  },
  'சனி': {
    friends: ['புதன்', 'சுக்கிரன்'],
    neutrals: ['குரு'],
    enemies: ['சூரியன்', 'சந்திரன்', 'செவ்வாய்']
  }
};

// Helper: Calculate friendship relationship
function getPlanetaryRelation(p1: string, p2: string): 'friend' | 'neutral' | 'enemy' {
  if (p1 === p2) return 'friend';
  const rel1 = PLANETARY_FRIENDSHIPS[p1];
  if (!rel1) return 'neutral';
  if (rel1.friends.includes(p2)) return 'friend';
  if (rel1.enemies.includes(p2)) return 'enemy';
  return 'neutral';
}

// ==========================================
// 2. 10 PORUTHAM INDIVIDUAL EVALUATORS
// ==========================================

export function evaluate10Poruthams(
  girlStarIndex: number,
  girlPada: number,
  girlRasiIndex: number,
  boyStarIndex: number,
  boyPada: number,
  boyRasiIndex: number
): PoruthamItem[] {
  const girlStar = NAKSHATRA_DATABASE[girlStarIndex];
  const boyStar = NAKSHATRA_DATABASE[boyStarIndex];

  // 1. DINA PORUTHAM (தினம்)
  const starCount = ((boyStarIndex - girlStarIndex + 27) % 27) + 1;
  const tarabalam = starCount % 9;
  
  let dinaStatus: 'good' | 'average' | 'poor' = 'poor';
  let dinaScore = 0;
  let dinaResult = 'பொருந்தாது';
  let dinaExp = '';

  // Same star exceptions (Eka Nakshatra)
  const sameStarAuspicious = [3, 5, 9, 12, 15, 21, 25, 26]; // Rohini, Ardra, Magha, Hasta, Vishakha, Shravana, U.Bhadra, Revati
  if (starCount === 1) {
    if (sameStarAuspicious.includes(girlStarIndex)) {
      dinaStatus = 'good';
      dinaScore = 1;
      dinaResult = 'ஏக நட்சத்திர உத்தமம்';
      dinaExp = `இருவருக்கும் ஒரே நட்சத்திரமான ${girlStar.nameTamil} அமையப் பெற்று, ஏக நட்சத்திர விதிவிலக்குப்படி உத்தம பொருத்தம்.`;
    } else if (girlPada !== boyPada || girlRasiIndex !== boyRasiIndex) {
      dinaStatus = 'average';
      dinaScore = 0.5;
      dinaResult = 'மத்திமம் (பாத பேதம்)';
      dinaExp = `ஒரே நட்சத்திரம் ஆயினும் பாதங்கள் வெவ்வேறாக இருப்பதால் மத்திம பலன்.`;
    } else {
      dinaStatus = 'poor';
      dinaScore = 0;
      dinaResult = 'பொருந்தாது (ஒரே பாதம்)';
      dinaExp = `ஒரே நட்சத்திரமும் ஒரே பாதமும் கொண்டிருப்பது ஆரோக்கியத்திற்கு உகந்ததல்ல.`;
    }
  } else if ([2, 4, 6, 8, 0].includes(tarabalam)) {
    // 2: சம்பத்து, 4: க்ஷேமம், 6: சாதகம், 8: மைத்ரம், 9/0: பரம மைத்ரம்
    dinaStatus = 'good';
    dinaScore = 1;
    dinaResult = 'உத்தமம்';
    const taraNames: Record<number, string> = {
      2: 'சம்பத்து தாரை',
      4: 'க்ஷேம தாரை',
      6: 'சாதக தாரை',
      8: 'மைத்ர தாரை',
      0: 'பரம மைத்ர தாரை'
    };
    dinaExp = `பெண் நட்சத்திரத்திலிருந்து ஆண் நட்சத்திரம் ${starCount}-வது நட்சத்திரமாக வந்து ${taraNames[tarabalam] || 'சுப தாரை'} அமைவதால் தம்பதியர் நீண்ட ஆயுளும் ஆரோக்கியமும் பெறுவர்.`;
  } else if (starCount === 27) {
    // Vadha / 27th star
    dinaStatus = 'poor';
    dinaScore = 0;
    dinaResult = 'பொருந்தாது (27-வது வதை)';
    dinaExp = `பெண்ணின் நட்சத்திரத்திலிருந்து 27-வது நட்சத்திரமாக அமைவது வதை நட்சத்திர தோஷம் தரும்.`;
  } else {
    // 3: விபத்து, 5: பிரத்யக்கு, 7: வதை
    dinaStatus = 'poor';
    dinaScore = 0;
    dinaResult = 'பொருந்தாது';
    const badTara: Record<number, string> = {
      3: 'விபத்து தாரை',
      5: 'பிரத்யக்கு தாரை',
      7: 'வதை தாரை'
    };
    dinaExp = `தாரபலன் கணக்கில் ${badTara[tarabalam] || 'அசுப தாரை'} வருவதால் தினப் பொருத்தம் அமையவில்லை.`;
  }

  // 2. GANA PORUTHAM (கணம்)
  const gGana = girlStar.gana;
  const bGana = boyStar.gana;
  let ganaStatus: 'good' | 'average' | 'poor' = 'poor';
  let ganaScore = 0;
  let ganaResult = 'பொருந்தாது';
  let ganaExp = '';

  const isRasiLordsFriendly = () => {
    const gl = SIGN_LORDS[girlRasiIndex];
    const bl = SIGN_LORDS[boyRasiIndex];
    return getPlanetaryRelation(gl, bl) === 'friend' || gl === bl;
  };

  if (gGana === bGana) {
    ganaStatus = 'good';
    ganaScore = 1;
    ganaResult = 'உத்தமம் (ஒரே கணம்)';
    ganaExp = `இருவரும் ${gGana} கணத்தைச் சேர்ந்தவர்கள். ஒத்த மனப்பான்மை, பண்பும் நற்பழக்கமும் இணைந்திருக்கும்.`;
  } else if (gGana === 'தேவ' && bGana === 'மனித') {
    ganaStatus = 'good';
    ganaScore = 1;
    ganaResult = 'உத்தமம்';
    ganaExp = `பெண் தேவ கணமும் ஆண் மனித கணமும் கொண்டிருப்பது குடும்ப ஒற்றுமைக்கு உகந்த உத்தம பொருத்தம்.`;
  } else if (gGana === 'மனித' && bGana === 'தேவ') {
    ganaStatus = 'good';
    ganaScore = 0.75;
    ganaResult = 'உத்தமம்';
    ganaExp = `பெண் மனித கணமும் ஆண் தேவ கணமும் பொருந்துவது நல்ல குடும்ப அமைப்பைத் தரும்.`;
  } else if ((gGana === 'தேவ' || gGana === 'மனித') && bGana === 'ராட்சச') {
    if (starCount > 14 || isRasiLordsFriendly()) {
      ganaStatus = 'average';
      ganaScore = 0.5;
      ganaResult = 'மத்திமம் (விதிவிலக்கு)';
      ganaExp = `ஆண் ராட்சச கணமாயினும் நட்சத்திர தூரம் 14-க்கு மேல் அல்லது ராசி அதிபதி சுப நட்பால் தோஷம் நீங்கி மத்திம பலன் தரும்.`;
    } else {
      ganaStatus = 'poor';
      ganaScore = 0;
      ganaResult = 'பொருந்தாது';
      ganaExp = `ஆண் ராட்சச கணமும் பெண் ${gGana} கணமும் இருப்பதால் கருத்து வேறுபாடுகள் வரலாம்.`;
    }
  } else if (gGana === 'ராட்சச' && (bGana === 'தேவ' || bGana === 'மனித')) {
    if (isRasiLordsFriendly() && starCount > 14) {
      ganaStatus = 'average';
      ganaScore = 0.5;
      ganaResult = 'மத்திமம் (நிவர்த்தி)';
      ganaExp = `பெண் ராட்சச கணமாக இருப்பினும் ராசி அதிபதி நட்பால் மத்திம பொருத்தம் பெறுகிறது.`;
    } else {
      ganaStatus = 'poor';
      ganaScore = 0;
      ganaResult = 'பொருந்தாது';
      ganaExp = `பெண் ராட்சச கணமும் ஆண் ${bGana} கணமும் இருப்பது சாஸ்திரப்படி பொருத்தமற்றது.`;
    }
  }

  // 3. MAHENDRA PORUTHAM (மகேந்திரம்)
  // Auspicious counts from Girl to Boy: 4, 7, 10, 13, 16, 19, 22, 25
  const mahendraCounts = [4, 7, 10, 13, 16, 19, 22, 25];
  const isMahendra = mahendraCounts.includes(starCount);
  const mahendraItem: PoruthamItem = {
    id: 'mahendram',
    nameTamil: 'மகேந்திரப் பொருத்தம்',
    nameEnglish: 'Mahendra Porutham',
    status: isMahendra ? 'good' : 'poor',
    resultTamil: isMahendra ? 'உத்தமம் (புத்திர பாக்கியம்)' : 'பொருந்தாது',
    score: isMahendra ? 1 : 0,
    maxScore: 1,
    explanation: isMahendra
      ? `பெண் நட்சத்திரத்திலிருந்து ஆண் நட்சத்திரம் ${starCount}-வது இடமாக அமைவதால் வம்ச விருத்தி, புத்திர பாக்கியம் மற்றும் வளம் பெருகும்.`
      : `மகேந்திர ஸ்தான எண்ணிக்கை (4, 7, 10, 13, 16, 19, 22, 25) அமையவில்லை. இருப்பினும் பிற புத்திர ஸ்தான பலன்களைக் கொண்டு அறியலாம்.`,
    importance: 'high'
  };

  // 4. STREE DHEERKHA PORUTHAM (ஸ்திரீ தீர்க்கம்)
  let streeStatus: 'good' | 'average' | 'poor' = 'poor';
  let streeScore = 0;
  let streeResult = 'பொருந்தாது';
  let streeExp = '';

  if (starCount > 13) {
    streeStatus = 'good';
    streeScore = 1;
    streeResult = 'உத்தமம்';
    streeExp = `பெண் நட்சத்திரத்திலிருந்து ஆண் நட்சத்திரம் ${starCount} தூரத்தில் (13-க்கு மேல்) அமைவதால் பெண்ணுக்கு நீண்ட ஆயுள், சௌபாக்கியம் மற்றும் செல்வம் நிறையும்.`;
  } else if (starCount >= 7 && starCount <= 13) {
    streeStatus = 'average';
    streeScore = 0.5;
    streeResult = 'மத்திமம்';
    streeExp = `நட்சத்திர தூரம் ${starCount} (7 முதல் 13-க்குள்) இருப்பதால் மத்திம ஸ்திரீ தீர்க்க சுபம் உண்டாகும்.`;
  } else {
    streeStatus = 'poor';
    streeScore = 0;
    streeResult = 'பொருந்தாது';
    streeExp = `நட்சத்திர தூரம் ${starCount} (7-க்கு குறைவாக) உள்ளதால் ஸ்திரீ தீர்க்க பலம் குறைவு.`;
  }

  // 5. YONI PORUTHAM (யோனி)
  const gYoni = girlStar.yoniAnimal;
  const bYoni = boyStar.yoniAnimal;
  const isEnemies = (YONI_ENEMIES[gYoni] && YONI_ENEMIES[gYoni].includes(bYoni)) ||
                    (YONI_ENEMIES[bYoni] && YONI_ENEMIES[bYoni].includes(gYoni));
  
  let yoniStatus: 'good' | 'average' | 'poor' = 'poor';
  let yoniScore = 0;
  let yoniResult = 'பொருந்தாது';
  let yoniExp = '';

  if (isEnemies) {
    yoniStatus = 'poor';
    yoniScore = 0;
    yoniResult = 'பகை (பொருந்தாது)';
    yoniExp = `பெண் யோனி (${gYoni}) மற்றும் ஆண் யோனி (${bYoni}) சாஸ்திரப்படி பரம பகை மிருகங்கள். தாம்பத்திய அமைதியில் சிக்கல் வரலாம்.`;
  } else if (gYoni === bYoni) {
    if (girlStar.yoniGender !== boyStar.yoniGender) {
      yoniStatus = 'good';
      yoniScore = 1;
      yoniResult = 'உத்தமம் (ஒரே யோனி ஆண்-பெண்)';
      yoniExp = `இருவருக்கும் ஒரே யோனியாக (${gYoni}) அமைந்து பாலின பேதம் (ஆண்-பெண்) இருப்பதால் தாம்பத்திய சுகம் மற்றும் ஈர்ப்பு உச்சத்தில் இருக்கும்.`;
    } else {
      yoniStatus = 'average';
      yoniScore = 0.5;
      yoniResult = 'மத்திமம் (ஒரே யோனி)';
      yoniExp = `இருவருக்கும் ஒரே யோனியாக (${gYoni}) அமைந்து இரண்டும் ஒரே பாலினமாக இருப்பதால் மத்திம சுகம் தரும்.`;
    }
  } else {
    // Different animals, not hostile
    yoniStatus = 'good';
    yoniScore = 1;
    yoniResult = 'உத்தமம் (நட்பு/சமம்)';
    yoniExp = `பெண் யோனி (${gYoni} ${girlStar.yoniGender}) மற்றும் ஆண் யோனி (${bYoni} ${boyStar.yoniGender}) ஒன்றையொன்று பாதிக்காத சுப சேர்க்கை.`;
  }

  // 6. RASI PORUTHAM (ராசி)
  const rasiCount = ((boyRasiIndex - girlRasiIndex + 12) % 12) + 1;
  let rasiStatus: 'good' | 'average' | 'poor' = 'poor';
  let rasiScore = 0;
  let rasiResult = 'பொருந்தாது';
  let rasiExp = '';

  // Exceptions for 6/8 (Sashtashtakam)
  const isSashtashtakaException = 
    (girlRasiIndex === 0 && boyRasiIndex === 7) || (girlRasiIndex === 7 && boyRasiIndex === 0) || // Mesham - Vrichikam (Mars)
    (girlRasiIndex === 1 && boyRasiIndex === 6) || (girlRasiIndex === 6 && boyRasiIndex === 1) || // Rishabam - Thulam (Venus)
    (girlRasiIndex === 9 && boyRasiIndex === 10) || (girlRasiIndex === 10 && boyRasiIndex === 9); // Makaram - Kumbam (Saturn)

  if (rasiCount === 7) {
    rasiStatus = 'good';
    rasiScore = 1;
    rasiResult = 'சம சப்தம உத்தமம்';
    rasiExp = `இருவரின் ராசிகளும் 7-க்கு 7 சம சப்தம ராசிகளாக (${RASI_NAMES_TAMIL[girlRasiIndex]} - ${RASI_NAMES_TAMIL[boyRasiIndex]}) அமைவது மிகவும் போற்றத்தக்க உத்தம அமைப்பாகும்.`;
  } else if (rasiCount === 1) {
    if (starCount > 1 || girlPada !== boyPada) {
      rasiStatus = 'good';
      rasiScore = 1;
      rasiResult = 'ஏக ராசி உத்தமம்';
      rasiExp = `இருவருக்கும் ஒரே ராசி (${RASI_NAMES_TAMIL[girlRasiIndex]}). மன ஒற்றுமையும் குடும்ப வளர்ச்சியும் நிலைத்திருக்கும்.`;
    } else {
      rasiStatus = 'average';
      rasiScore = 0.5;
      rasiResult = 'ஏக ராசி (மத்திமம்)';
      rasiExp = `ஒரே ராசியும் ஒரே நட்சத்திரமும் அமைந்ததால் மத்திம பலன்.`;
    }
  } else if ([3, 4, 10, 11].includes(rasiCount)) {
    rasiStatus = 'good';
    rasiScore = 1;
    rasiResult = 'உத்தமம்';
    rasiExp = `பெண் ராசியிலிருந்து ஆண் ராசி ${rasiCount}-ஆம் இடமாக அமைவது சுப யோகத்தையும் குடும்ப முன்னேற்றத்தையும் கொடுக்கும்.`;
  } else if (rasiCount === 6 || rasiCount === 8) {
    if (isSashtashtakaException) {
      rasiStatus = 'good';
      rasiScore = 0.75;
      rasiResult = 'உத்தமம் (சஷ்டாஷ்டக விதிவிலக்கு)';
      rasiExp = `6/8 சஷ்டாஷ்டகம் ஆயினும், இரு ராசிகளுக்கும் ஒரே அதிபதி என்பதால் சாஸ்திர விதிவிலக்கு பெற்று நற்பலன் தருகிறது.`;
    } else {
      rasiStatus = 'poor';
      rasiScore = 0;
      rasiResult = 'பொருந்தாது (சஷ்டாஷ்டகம்)';
      rasiExp = `பெண் ராசியிலிருந்து ஆண் ராசி ${rasiCount}-ஆம் இடமாக வந்து சஷ்டாஷ்டக தோஷம் ஏற்படுவதால் மனக்கசப்புகள் ஏற்படலாம்.`;
    }
  } else if (rasiCount === 2 || rasiCount === 12) {
    if (isRasiLordsFriendly()) {
      rasiStatus = 'average';
      rasiScore = 0.5;
      rasiResult = 'மத்திமம் (துவிதீய-துவாதசம்)';
      rasiExp = `2/12 ஸ்தான அமைப்பாயினும் ராசி அதிபதிகள் நட்பு பெற்றுள்ளதால் மத்திம பலன்.`;
    } else {
      rasiStatus = 'poor';
      rasiScore = 0;
      rasiResult = 'பொருந்தாது (2/12 விரயம்)';
      rasiExp = `2/12 துவிதீய-துவாதச அமைப்பால் பொருளாதார விரயங்கள் அல்லது மருத்துவச் செலவுகள் உண்டாகலாம்.`;
    }
  } else if (rasiCount === 5 || rasiCount === 9) {
    rasiStatus = 'good';
    rasiScore = 1;
    rasiResult = 'திரிகோண உத்தமம்';
    rasiExp = `5/9 திரிகோண ராசி சேர்க்கை தர்ம-கர்மாதி அமைப்பையும் நல் ஒழுக்கத்தையும் தரும்.`;
  }

  // 7. RASI ADHIPATHI PORUTHAM (ராசியாதிபதி)
  const gLord = SIGN_LORDS[girlRasiIndex];
  const bLord = SIGN_LORDS[boyRasiIndex];
  const relationGB = getPlanetaryRelation(gLord, bLord);
  const relationBG = getPlanetaryRelation(bLord, gLord);

  let adhiStatus: 'good' | 'average' | 'poor' = 'poor';
  let adhiScore = 0;
  let adhiResult = 'பொருந்தாது';
  let adhiExp = '';

  if (gLord === bLord) {
    adhiStatus = 'good';
    adhiScore = 1;
    adhiResult = 'உத்தமம் (ஒரே அதிபதி)';
    adhiExp = `இருவரின் ராசிநாதனும் '${gLord}' ஒருவரே என்பதால் தம்பதியர் எண்ணங்கள் ஒன்றுபடும்.`;
  } else if (relationGB === 'friend' && relationBG === 'friend') {
    adhiStatus = 'good';
    adhiScore = 1;
    adhiResult = 'உத்தமம் (பரஸ்பர நட்பு)';
    adhiExp = `பெண்ணின் ராசிநாதன் ${gLord} மற்றும் ஆணின் ராசிநாதன் ${bLord} பரஸ்பர உற்ற நண்பர்கள். ஒற்றுமை ஓங்கும்.`;
  } else if ((relationGB === 'friend' && relationBG === 'neutral') || (relationGB === 'neutral' && relationBG === 'friend')) {
    adhiStatus = 'good';
    adhiScore = 0.75;
    adhiResult = 'உத்தமம் (நட்பு & சமம்)';
    adhiExp = `ராசிநாதர்களிடையே சுப சம பாவமும் நட்பும் நிலவுவதால் நல்ல புரிதல் இருக்கும்.`;
  } else if (relationGB === 'neutral' && relationBG === 'neutral') {
    adhiStatus = 'average';
    adhiScore = 0.5;
    adhiResult = 'மத்திமம் (சம நிலை)';
    adhiExp = `ராசிநாதர்கள் இருவரும் சம கிரகங்களாக இருப்பதால் சுமூகமான வாழ்க்கை அமையும்.`;
  } else {
    adhiStatus = 'poor';
    adhiScore = 0;
    adhiResult = 'பொருந்தாது (பகை)';
    adhiExp = `ராசிநாதர்களான ${gLord} மற்றும் ${bLord} பகை கிரகங்களாக இருப்பதால் பரஸ்பர கருத்து வேறுபாடுகள் வரலாம்.`;
  }

  // 8. VASIYA PORUTHAM (வசியம்)
  const isVasiyaFromGirl = VASIYA_MAP[girlRasiIndex] && VASIYA_MAP[girlRasiIndex].includes(boyRasiIndex);
  const isVasiyaFromBoy = VASIYA_MAP[boyRasiIndex] && VASIYA_MAP[boyRasiIndex].includes(girlRasiIndex);
  const isVasiya = isVasiyaFromGirl || isVasiyaFromBoy;

  const vasiyaItem: PoruthamItem = {
    id: 'vasiyam',
    nameTamil: 'வசியப் பொருத்தம்',
    nameEnglish: 'Vasiya Porutham',
    status: isVasiya ? 'good' : 'poor',
    resultTamil: isVasiya ? 'உத்தமம் (வசியம் உண்டு)' : 'பொருந்தாது',
    score: isVasiya ? 1 : 0,
    maxScore: 1,
    explanation: isVasiya
      ? `${RASI_NAMES_TAMIL[girlRasiIndex]} மற்றும் ${RASI_NAMES_TAMIL[boyRasiIndex]} ராசிகளுக்கிடையே சாஸ்திர முறைப்படி பரஸ்பர காந்த ஈர்ப்பும் வசிய பலமும் உண்டு.`
      : `இரு ராசிகளுக்குமிடையே நேரடி வசியக் கவர்ச்சி அமையவில்லை. இருப்பினும் ஏனைய பொருத்தங்கள் வலுவாக இருந்தால் குறைவில்லை.`,
    importance: 'medium'
  };

  // 9. RAJJU PORUTHAM (ரஜ்ஜு - CRITICAL)
  const isSameRajju = girlStar.rajju === boyStar.rajju;
  const isRajjuPass = !isSameRajju;
  const rajjuFaultNames: Record<RajjuType, string> = {
    'சிரசு': 'சிரசு ரஜ்ஜு தோஷம் (கணவருக்கு ஆயுள் குறைவு)',
    'கண்டம்': 'கண்ட ரஜ்ஜு தோஷம் (மனைவிக்கு மங்கல குறைவு)',
    'உதரம்': 'உதர ரஜ்ஜு தோஷம் (புத்திர தடை/சந்தான பாதிப்பு)',
    'தொடை': 'தொடை ரஜ்ஜு தோஷம் (பொருளாதார நஷ்டம்/விரயம்)',
    'பாதம்': 'பாத ரஜ்ஜு தோஷம் (அலைச்சல்/பயணக் கஷ்டங்கள்)'
  };

  const rajjuItem: PoruthamItem = {
    id: 'rajju',
    nameTamil: 'ரஜ்ஜுப் பொருத்தம் (மாங்கல்ய பலம்)',
    nameEnglish: 'Rajju Porutham (Critical)',
    status: isRajjuPass ? 'good' : 'poor',
    resultTamil: isRajjuPass ? 'உத்தமம் (ரஜ்ஜு பொருத்தம் உண்டு)' : 'தோஷம் (ஒரே ரஜ்ஜு - பொருந்தாது)',
    score: isRajjuPass ? 1 : 0,
    maxScore: 1,
    explanation: isRajjuPass
      ? `பெண் ரஜ்ஜு (${girlStar.rajju}) மற்றும் ஆண் ரஜ்ஜு (${boyStar.rajju}) வெவ்வேறாக அமைந்து தீர்க்க மாங்கல்ய பாக்கியமும் தம்பதியர் நீண்ட ஆயுளும் உறுதி செய்யப்படுகிறது.`
      : `இருவருக்கும் ஒரே '${girlStar.rajju}' ரஜ்ஜு அமைந்திருப்பது '${rajjuFaultNames[girlStar.rajju]}' எனும் கடுமையான தோஷத்தை ஏற்படுத்துகிறது.`,
    importance: 'critical'
  };

  // 10. VEDHAI PORUTHAM (வேதை - CRITICAL)
  const isVedhaiAfflicted = girlStar.vedhaStarIndices.includes(boyStarIndex) || boyStar.vedhaStarIndices.includes(girlStarIndex);
  const isVedhaPass = !isVedhaiAfflicted;

  const vedhaItem: PoruthamItem = {
    id: 'vedhai',
    nameTamil: 'வேதைப் பொருத்தம் (தோஷமின்மை)',
    nameEnglish: 'Vedhai Porutham (Critical)',
    status: isVedhaPass ? 'good' : 'poor',
    resultTamil: isVedhaPass ? 'உத்தமம் (வேதை இல்லை)' : 'தோஷம் (வேதை தாக்கம் - பொருந்தாது)',
    score: isVedhaPass ? 1 : 0,
    maxScore: 1,
    explanation: isVedhaPass
      ? `${girlStar.nameTamil} மற்றும் ${boyStar.nameTamil} ஒன்றுக்கொன்று வேதை (தாக்குதல்) இல்லாத சுப நட்சத்திரங்கள்.`
      : `${girlStar.nameTamil} மற்றும் ${boyStar.nameTamil} ஒன்றுக்கொன்று வேதை தோஷம் உள்ள நட்சத்திரங்கள். துன்பங்களும் மனக்கலக்கங்களும் நேரலாம்.`,
    importance: 'critical'
  };

  return [
    {
      id: 'dina',
      nameTamil: 'தினப் பொருத்தம்',
      nameEnglish: 'Dina Porutham (Longevity & Health)',
      status: dinaStatus,
      resultTamil: dinaResult,
      score: dinaScore,
      maxScore: 1,
      explanation: dinaExp,
      importance: 'high'
    },
    {
      id: 'gana',
      nameTamil: 'கணப் பொருத்தம்',
      nameEnglish: 'Gana Porutham (Temperament)',
      status: ganaStatus,
      resultTamil: ganaResult,
      score: ganaScore,
      maxScore: 1,
      explanation: ganaExp,
      importance: 'high'
    },
    mahendraItem,
    {
      id: 'stree_dheerkham',
      nameTamil: 'ஸ்திரீ தீர்க்கப் பொருத்தம்',
      nameEnglish: 'Stree Dheerkha Porutham (Prosperity)',
      status: streeStatus,
      resultTamil: streeResult,
      score: streeScore,
      maxScore: 1,
      explanation: streeExp,
      importance: 'medium'
    },
    {
      id: 'yoni',
      nameTamil: 'யோனிப் பொருத்தம்',
      nameEnglish: 'Yoni Porutham (Physical Harmony)',
      status: yoniStatus,
      resultTamil: yoniResult,
      score: yoniScore,
      maxScore: 1,
      explanation: yoniExp,
      importance: 'high'
    },
    {
      id: 'rasi',
      nameTamil: 'ராசிப் பொருத்தம்',
      nameEnglish: 'Rasi Porutham (Family Lineage)',
      status: rasiStatus,
      resultTamil: rasiResult,
      score: rasiScore,
      maxScore: 1,
      explanation: rasiExp,
      importance: 'high'
    },
    {
      id: 'rasi_adhipathi',
      nameTamil: 'ராசியாதிபதிப் பொருத்தம்',
      nameEnglish: 'Rasi Adhipathi (Mental Harmony)',
      status: adhiStatus,
      resultTamil: adhiResult,
      score: adhiScore,
      maxScore: 1,
      explanation: adhiExp,
      importance: 'high'
    },
    vasiyaItem,
    rajjuItem,
    vedhaItem
  ];
}

// ==========================================
// 3. KUJA DOSHA (செவ்வாய் தோஷம்) ENGINE
// ==========================================

export function evaluateKujaDosha(chart?: HoroscopeData): KujaDoshaAnalysis {
  if (!chart || !chart.planetaryDegrees) {
    return {
      hasDosha: false,
      score: 0,
      placements: [],
      exceptions: ['ஜாதகக் குறிப்பு வழங்கப்படவில்லை (பொது விதிகளின்படி ஆய்வு)'],
      balanceStatus: 'தோஷம் இல்லை'
    };
  }

  const pMap: Record<string, PlanetPosition> = {};
  for (const p of chart.planetaryDegrees) {
    const pName = p.planet;
    // Map to simple planet name
    let clean = pName;
    if (clean.includes('லக்னம்')) clean = 'லக்னம்';
    else if (clean.includes('சூரியன்')) clean = 'சூரியன்';
    else if (clean.includes('சந்திரன்')) clean = 'சந்திரன்';
    else if (clean.includes('செவ்வாய்')) clean = 'செவ்வாய்';
    else if (clean.includes('புதன்')) clean = 'புதன்';
    else if (clean.includes('குரு')) clean = 'குரு';
    else if (clean.includes('சுக்கிரன்')) clean = 'சுக்கிரன்';
    else if (clean.includes('சனி')) clean = 'சனி';
    else if (clean.includes('ராகு')) clean = 'ராகு';
    else if (clean.includes('கேது')) clean = 'கேது';

    const signIdx = p.rasiIndex !== undefined
      ? p.rasiIndex
      : (p.rasi ? RASI_NAMES_TAMIL.indexOf(p.rasi) : 0);
    const degNum = parseFloat(p.degree) || 0;

    pMap[clean] = {
      name: clean,
      sign: signIdx >= 0 ? signIdx : 0,
      degree: degNum,
      rawLon: p.rawLongitude ?? ((signIdx >= 0 ? signIdx : 0) * 30 + degNum)
    };
  }

  const lagna = pMap['லக்னம்'];
  const moon = pMap['சந்திரன்'];
  const venus = pMap['சுக்கிரன்'];
  const mars = pMap['செவ்வாய்'];
  const jupiter = pMap['குரு'];

  if (!mars || !lagna) {
    return {
      hasDosha: false,
      score: 0,
      placements: [],
      exceptions: [],
      balanceStatus: 'தோஷமில்லை'
    };
  }

  const marsSign = mars.sign;
  const placements: string[] = [];
  const exceptions: string[] = [];

  const checkDoshaHouse = (fromSign: number, refName: string, weightMultiplier: number) => {
    const diff = ((marsSign - fromSign + 12) % 12) + 1;
    if ([2, 4, 7, 8, 12].includes(diff)) {
      placements.push(`${refName}-லிருந்து ${diff}-ஆம் வீட்டில் செவ்வாய் (${RASI_NAMES_TAMIL[marsSign]})`);
      return diff === 7 || diff === 8 ? 1.0 * weightMultiplier : 0.5 * weightMultiplier;
    }
    return 0;
  };

  let rawScore = 0;
  rawScore += checkDoshaHouse(lagna.sign, 'லக்னம்', 1.0);
  if (moon) rawScore += checkDoshaHouse(moon.sign, 'சந்திரன்', 0.75);
  if (venus) rawScore += checkDoshaHouse(venus.sign, 'சுக்கிரன்', 0.5);

  // Check classical exceptions (நிவர்த்தி விதிகள்)
  // 1. Mars in Aries or Scorpio (Own House) or Capricorn (Exalted)
  if ([0, 7].includes(marsSign)) {
    exceptions.push('செவ்வாய் ஆட்சி வீட்டில் (மேஷம்/விருச்சிகம்) இருப்பதால் தோஷ நிவர்த்தி');
  }
  if (marsSign === 9) {
    exceptions.push('செவ்வாய் உச்ச வீட்டில் (மகரம்) இருப்பதால் தோஷ நிவர்த்தி');
  }
  if (marsSign === 3 || marsSign === 4) {
    exceptions.push('செவ்வாய் கடகம் அல்லது சிம்மத்தில் அமைந்தால் தோஷமில்லை');
  }

  // 2. Jupiter or Moon aspect or conjunction
  if (jupiter) {
    const jupMarsDiff = ((marsSign - jupiter.sign + 12) % 12) + 1;
    if ([1, 5, 7, 9].includes(jupMarsDiff)) {
      exceptions.push('குருவின் பார்வை/சேர்க்கை செவ்வாய் மீது விழுவதால் தோஷம் முழுமையாக நிவர்த்தி');
    }
  }

  // 3. House & Sign combinations:
  const fromLagnaDiff = ((marsSign - lagna.sign + 12) % 12) + 1;
  if (fromLagnaDiff === 2 && (marsSign === 2 || marsSign === 5)) {
    exceptions.push('மிதுனம் அல்லது கன்னியில் 2-ல் செவ்வாய் - தோஷ நிவர்த்தி');
  }
  if (fromLagnaDiff === 4 && (marsSign === 0 || marsSign === 7)) {
    exceptions.push('மேஷம் அல்லது விருச்சிகத்தில் 4-ல் செவ்வாய் - தோஷ நிவர்த்தி');
  }
  if (fromLagnaDiff === 7 && (marsSign === 3 || marsSign === 9)) {
    exceptions.push('கடகம் அல்லது மகரத்தில் 7-ல் செவ்வாய் - தோஷ நிவர்த்தி');
  }
  if (fromLagnaDiff === 8 && (marsSign === 8 || marsSign === 11)) {
    exceptions.push('தனுசு அல்லது மீனத்தில் 8-ல் செவ்வாய் - தோஷ நிவர்த்தி');
  }
  if (fromLagnaDiff === 12 && (marsSign === 1 || marsSign === 6)) {
    exceptions.push('ரிஷபம் அல்லது துலாமில் 12-ல் செவ்வாய் - தோஷ நிவர்த்தி');
  }

  const effectiveScore = exceptions.length > 0 ? Math.max(0, rawScore - exceptions.length * 0.75) : rawScore;
  const hasDosha = effectiveScore >= 0.75 && placements.length > 0;

  let balanceStatus = 'செவ்வாய் தோஷமில்லை';
  if (hasDosha) {
    balanceStatus = effectiveScore > 1.5 ? 'வலுவான செவ்வாய் தோஷம் உண்டு' : 'மிதமான செவ்வாய் தோஷம் உண்டு';
  } else if (exceptions.length > 0 && placements.length > 0) {
    balanceStatus = 'செவ்வாய் தோஷம் நிவர்த்தியாகியுள்ளது (தோஷமில்லை)';
  }

  return {
    hasDosha,
    score: Math.round(effectiveScore * 10) / 10,
    placements,
    exceptions,
    balanceStatus
  };
}

// ==========================================
// 4. PAPA SAMYAM (பாப சாம்யம்) BALANCE ENGINE
// ==========================================

export function calculatePapaSamyam(chart?: HoroscopeData): PapaSamyamDetail {
  if (!chart || !chart.planetaryDegrees) {
    return {
      fromLagna: 0,
      fromMoon: 0,
      fromVenus: 0,
      total: 0,
      breakdown: []
    };
  }

  const pMap: Record<string, PlanetPosition> = {};
  for (const p of chart.planetaryDegrees) {
    const pName = p.planet;
    let clean = pName;
    if (clean.includes('லக்னம்')) clean = 'லக்னம்';
    else if (clean.includes('சூரியன்')) clean = 'சூரியன்';
    else if (clean.includes('சந்திரன்')) clean = 'சந்திரன்';
    else if (clean.includes('செவ்வாய்')) clean = 'செவ்வாய்';
    else if (clean.includes('சனி')) clean = 'சனி';
    else if (clean.includes('ராகு')) clean = 'ராகு';
    else if (clean.includes('கேது')) clean = 'கேது';
    else if (clean.includes('சுக்கிரன்')) clean = 'சுக்கிரன்';

    const signIdx = p.rasiIndex !== undefined
      ? p.rasiIndex
      : (p.rasi ? RASI_NAMES_TAMIL.indexOf(p.rasi) : 0);
    const degNum = parseFloat(p.degree) || 0;

    pMap[clean] = {
      name: clean,
      sign: signIdx >= 0 ? signIdx : 0,
      degree: degNum,
      rawLon: p.rawLongitude ?? ((signIdx >= 0 ? signIdx : 0) * 30 + degNum)
    };
  }

  const lagna = pMap['லக்னம்'];
  const moon = pMap['சந்திரன்'];
  const venus = pMap['சுக்கிரன்'];

  if (!lagna) {
    return { fromLagna: 0, fromMoon: 0, fromVenus: 0, total: 0, breakdown: [] };
  }

  const malefics = ['சூரியன்', 'செவ்வாய்', 'சனி', 'ராகு', 'கேது'];
  const maleficHouseScores: Record<number, number> = {
    1: 1.0,
    2: 0.5,
    4: 0.5,
    7: 1.0,
    8: 1.0,
    12: 0.5
  };

  const breakdown: string[] = [];

  const evaluateFromReference = (refSign: number, refName: string, refWeight: number): number => {
    let subTotal = 0;
    for (const mName of malefics) {
      const mObj = pMap[mName];
      if (mObj) {
        const diff = ((mObj.sign - refSign + 12) % 12) + 1;
        if (maleficHouseScores[diff]) {
          const pts = maleficHouseScores[diff] * refWeight;
          subTotal += pts;
          breakdown.push(`${refName}-லிருந்து ${diff}-ல் ${mName} (${pts} புள்ளிகள்)`);
        }
      }
    }
    return subTotal;
  };

  const fromLagna = evaluateFromReference(lagna.sign, 'லக்னம்', 1.0);
  const fromMoon = moon ? evaluateFromReference(moon.sign, 'சந்திரன்', 0.75) : 0;
  const fromVenus = venus ? evaluateFromReference(venus.sign, 'சுக்கிரன்', 0.5) : 0;
  const total = Math.round((fromLagna + fromMoon + fromVenus) * 10) / 10;

  return {
    fromLagna,
    fromMoon,
    fromVenus,
    total,
    breakdown
  };
}

export function comparePapaSamyam(boyChart?: HoroscopeData, girlChart?: HoroscopeData): PapaSamyamAnalysis {
  const boyDetails = calculatePapaSamyam(boyChart);
  const girlDetails = calculatePapaSamyam(girlChart);

  const diff = Math.round((boyDetails.total - girlDetails.total) * 10) / 10;
  
  // Rule: Boy points >= Girl points is ideal. If girl has slightly higher within 1.0, it is still workable.
  let isBalanced = false;
  let verdictTamil = '';
  let verdictDescription = '';

  if (boyDetails.total === 0 && girlDetails.total === 0) {
    isBalanced = true;
    verdictTamil = 'பாப சாம்ய சமநிலை';
    verdictDescription = 'இருவர் ஜாதகத்திலும் பாப கிரக தோஷப் புள்ளிகள் சமநிலையில் உள்ளன.';
  } else if (diff >= 0) {
    isBalanced = true;
    verdictTamil = 'பாப சாம்யம் உத்தமம் (ஆண் பாபம் அதிகம்)';
    verdictDescription = `ஆணின் பாபப் புள்ளிகள் (${boyDetails.total}) பெண்ணின் பாபப் புள்ளிகளைவிட (${girlDetails.total}) சமமாகவோ அதிகமாகவோ இருப்பதால் தாம்பத்திய ஆயுளுக்கும் ஆரோக்கியத்திற்கும் உத்தமம்.`;
  } else if (Math.abs(diff) <= 1.0) {
    isBalanced = true;
    verdictTamil = 'பாப சாம்யம் மத்திமம் (சுமூக சமநிலை)';
    verdictDescription = `இருவரின் பாபப் புள்ளிகளுக்கு இடையே மிகச் சிறிய வேறுபாடே (${Math.abs(diff)}) உள்ளதால் பொருத்தம் ஏற்கத்தக்கது.`;
  } else {
    isBalanced = false;
    verdictTamil = 'பாப சாம்ய தோஷம் (பெண் பாபம் அதிகம்)';
    verdictDescription = `பெண்ணின் பாபப் புள்ளிகள் (${girlDetails.total}) ஆணின் புள்ளிகளைவிட (${boyDetails.total}) கூடுதலாக உள்ளதால், முறையான பரிகாரம் அல்லது வரன் பொருத்தம் காண்பது நலம்.`;
  }

  return {
    boyPoints: boyDetails.total,
    girlPoints: girlDetails.total,
    boyDetails,
    girlDetails,
    difference: diff,
    isBalanced,
    verdictTamil,
    verdictDescription
  };
}

// ==========================================
// 5. DASA SANDHI (தசா சந்தி) SCANNER
// ==========================================

export function scanDasaSandhi(boyChart?: HoroscopeData, girlChart?: HoroscopeData): DasaSandhiAnalysis {
  if (!boyChart?.dasaTimelines || !girlChart?.dasaTimelines) {
    return {
      hasSandhiAlert: false,
      alerts: [],
      details: 'தசா சந்தி கணிக்க இருவரின் தசா விவரங்கள் தேவை.'
    };
  }

  const boyTransitions: { dasaEnding: string; dasaStarting: string; date: Date; dateStr: string }[] = [];
  const girlTransitions: { dasaEnding: string; dasaStarting: string; date: Date; dateStr: string }[] = [];

  const extractTransitions = (timelines: any[], targetArr: typeof boyTransitions) => {
    for (let i = 0; i < timelines.length - 1; i++) {
      const curr = timelines[i];
      const next = timelines[i + 1];
      if (curr.endDate && next.startDate) {
        const transDate = new Date(curr.endDate);
        targetArr.push({
          dasaEnding: curr.dasaLord,
          dasaStarting: next.dasaLord,
          date: transDate,
          dateStr: curr.endDate
        });
      }
    }
  };

  extractTransitions(boyChart.dasaTimelines, boyTransitions);
  extractTransitions(girlChart.dasaTimelines, girlTransitions);

  const alerts: DasaSandhiAlert[] = [];

  for (const bt of boyTransitions) {
    for (const gt of girlTransitions) {
      const diffMs = Math.abs(bt.date.getTime() - gt.date.getTime());
      const diffMonths = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.4375));

      // Dasa Sandhi threshold: within 12 months of each other
      if (diffMonths <= 12) {
        alerts.push({
          boyTransition: {
            person: 'boy',
            dasaEnding: bt.dasaEnding,
            dasaStarting: bt.dasaStarting,
            transitionDate: bt.dateStr,
            formattedDate: new Date(bt.dateStr).toLocaleDateString('ta-IN', { year: 'numeric', month: 'short' }),
            age: 0
          },
          girlTransition: {
            person: 'girl',
            dasaEnding: gt.dasaEnding,
            dasaStarting: gt.dasaStarting,
            transitionDate: gt.dateStr,
            formattedDate: new Date(gt.dateStr).toLocaleDateString('ta-IN', { year: 'numeric', month: 'short' }),
            age: 0
          },
          gapMonths: diffMonths,
          description: `ஆணுக்கு ${bt.dasaEnding} முடிந்து ${bt.dasaStarting} தசை தொடங்கும் காலமும், பெண்ணுக்கு ${gt.dasaEnding} முடிந்து ${gt.dasaStarting} தசை தொடங்கும் காலமும் ${diffMonths} மாத இடைவெளியில் அருகருகே அமைகின்றன.`
        });
      }
    }
  }

  const hasSandhiAlert = alerts.length > 0;
  let details = 'இருவருக்கும் ஒரே சமயத்தில் அல்லது 12 மாத இடைவெளியில் தசா சந்தி மாற்றம் இல்லை. தசா சந்தி தோஷமில்லை.';
  if (hasSandhiAlert) {
    details = `எச்சரிக்கை: தம்பதியர் இருவருக்கும் ஒரே காலகட்டத்தில் (${alerts[0].gapMonths} மாத இடைவெளியில்) மகா தசா மாற்றம் ஏற்படுவதால் தசா சந்தி தோஷம் உண்டாகிறது. அக்காலகட்டத்தில் குலதெய்வ வழிபாடு மற்றும் நவகிரக சாந்தி வழிபாடு அவசியம்.`;
  }

  return {
    hasSandhiAlert,
    alerts,
    details
  };
}

// ==========================================
// 6. MASTER COMPATIBILITY CALCULATION FACADE
// ==========================================

export interface PersonMatchInput {
  name: string;
  gender: 'ஆண்' | 'பெண்';
  nakshatraIndex: number;
  pada: number;
  rasiIndex?: number;
  chartData?: HoroscopeData;
}

export function calculateMarriageCompatibility(
  boyInput: PersonMatchInput,
  girlInput: PersonMatchInput
): MarriageCompatibilityResult {
  const boyStar = NAKSHATRA_DATABASE[boyInput.nakshatraIndex] || NAKSHATRA_DATABASE[0];
  const girlStar = NAKSHATRA_DATABASE[girlInput.nakshatraIndex] || NAKSHATRA_DATABASE[0];

  const boyPada = Math.min(4, Math.max(1, boyInput.pada || 1));
  const girlPada = Math.min(4, Math.max(1, girlInput.pada || 1));

  // Determine Rasi Index from Pada if not provided
  const boyRasi = boyInput.rasiIndex !== undefined && boyInput.rasiIndex >= 0
    ? boyInput.rasiIndex
    : boyStar.padaRasiMap[boyPada - 1];

  const girlRasi = girlInput.rasiIndex !== undefined && girlInput.rasiIndex >= 0
    ? girlInput.rasiIndex
    : girlStar.padaRasiMap[girlPada - 1];

  // 1. Evaluate 10 Poruthams
  const poruthams = evaluate10Poruthams(
    girlStar.index,
    girlPada,
    girlRasi,
    boyStar.index,
    boyPada,
    boyRasi
  );

  const totalScore = poruthams.reduce((acc, p) => acc + p.score, 0);
  const maxScore = poruthams.reduce((acc, p) => acc + p.maxScore, 0);
  const matchCount = poruthams.filter(p => p.status === 'good' || p.status === 'average').length;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const rajjuItem = poruthams.find(p => p.id === 'rajju');
  const vedhaItem = poruthams.find(p => p.id === 'vedhai');
  const isRajjuMatch = rajjuItem?.status === 'good';
  const isVedhaMatch = vedhaItem?.status === 'good';

  // 2. Kuja Dosha Evaluation
  const boyKuja = evaluateKujaDosha(boyInput.chartData);
  const girlKuja = evaluateKujaDosha(girlInput.chartData);
  
  let isKujaBalanced = true;
  let kujaBalanceVerdict = 'செவ்வாய் தோஷம் சமநிலையில் உள்ளது';

  if (boyKuja.hasDosha && !girlKuja.hasDosha) {
    isKujaBalanced = false;
    kujaBalanceVerdict = 'ஆணுக்கு செவ்வாய் தோஷம் உண்டு, பெண்ணுக்கு இல்லை - தோஷ சமநிலையின்மை';
  } else if (!boyKuja.hasDosha && girlKuja.hasDosha) {
    isKujaBalanced = false;
    kujaBalanceVerdict = 'பெண்ணுக்கு செவ்வாய் தோஷம் உண்டு, ஆணுக்கு இல்லை - தோஷ சமநிலையின்மை';
  } else if (boyKuja.hasDosha && girlKuja.hasDosha) {
    isKujaBalanced = true;
    kujaBalanceVerdict = 'இருவருக்கும் செவ்வாய் தோஷம் இருப்பதால் தோஷம் பரஸ்பரம் நிவர்த்தியாகி சமநிலைப் பெறுகிறது';
  } else {
    isKujaBalanced = true;
    kujaBalanceVerdict = 'இருவருக்கும் செவ்வாய் தோஷமில்லை (சுப நிலை)';
  }

  // 3. Papa Samyam Evaluation
  const papaSamyam = comparePapaSamyam(boyInput.chartData, girlInput.chartData);

  // 4. Dasa Sandhi Evaluation
  const dasaSandhi = scanDasaSandhi(boyInput.chartData, girlInput.chartData);

  // 5. Final Verdict Construction
  let finalVerdict: 'excellent' | 'moderate' | 'not_recommended' = 'moderate';
  let verdictTitleTamil = '';
  let verdictSubtitleTamil = '';
  let summaryTamil = '';
  const recommendationsTamil: string[] = [];

  if (!isRajjuMatch) {
    finalVerdict = 'not_recommended';
    verdictTitleTamil = 'பொருத்தம் பொருந்தாது (ரஜ்ஜு தோஷம்)';
    verdictSubtitleTamil = 'ரஜ்ஜு பொருத்தம் அமையாததால் இத்திருமணம் சாஸ்திரப்படி பரிந்துரைக்கப்படவில்லை';
    summaryTamil = `10 பொருத்தங்களில் ${totalScore}/${maxScore} மதிப்பெண்கள் இருப்பினும், திருமண பொருத்தத்தின் ஆணிவேரான ரஜ்ஜு பொருத்தம் (${girlStar.rajju} ரஜ்ஜு) அமையாததால் இது கடுமையான தோஷமாக கருதப்படுகிறது.`;
    recommendationsTamil.push('ரஜ்ஜு தோஷம் இருப்பதால் இந்த வரனைத் தவிர்ப்பது அல்லது தீவிர பரிகார ஆலோசனை பெறுவது நலம்.');
  } else if (!isVedhaMatch) {
    finalVerdict = 'not_recommended';
    verdictTitleTamil = 'வேதை தோஷம் - பொருத்தம் பொருந்தாது';
    verdictSubtitleTamil = 'நட்சத்திர வேதை தாக்கம் இருப்பதால் மன அமைதி குறையலாம்';
    summaryTamil = `நட்சத்திர வேதை தோஷம் காரணமாக தம்பதியரிடையே பரஸ்பர தாக்குதலும் துன்பங்களும் நேரலாம் என்பதால் வரன் சேர்ப்பதில் கூடுதல் கவனம் தேவை.`;
    recommendationsTamil.push('வேதை தோஷம் உள்ளதால் பிற கிரக அமைப்புகளை ஆராய்ந்து முடிவெடுக்கவும்.');
  } else if (totalScore >= 7 && isKujaBalanced && papaSamyam.isBalanced && !dasaSandhi.hasSandhiAlert) {
    finalVerdict = 'excellent';
    verdictTitleTamil = 'மிக உத்தமமான பொருத்தம் (Excellent Match)';
    verdictSubtitleTamil = 'அனைத்து முக்கிய பொருத்தங்களும் முழுமையாக பொருந்தியுள்ளன';
    summaryTamil = `10 பொருத்தங்களில் ${totalScore}/${maxScore} மதிப்பெண்கள் பெற்று, ரஜ்ஜு மற்றும் வேதை தோஷங்கள் இன்றி, செவ்வாய் மற்றும் பாப சாம்ய சமநிலையும் கூடி வந்துள்ளதால் இத்திருமணம் தம்பதியருக்கு தீர்க்காயுள், மகிழ்ச்சி மற்றும் சந்தான சௌபாக்கியங்களை வாரி வழங்கும்.`;
    recommendationsTamil.push('மங்களகரமான சுப முகூர்த்த நாளில் திருமணம் நடத்தலாம்.');
    recommendationsTamil.push('குலதெய்வ வழிபாடு செய்து சுப காரியங்களைத் துவங்கவும்.');
  } else if (totalScore >= 5) {
    finalVerdict = 'moderate';
    verdictTitleTamil = 'மத்திமப் பொருத்தம் (Acceptable Match)';
    verdictSubtitleTamil = 'முக்கிய பொருத்தங்கள் உள்ளதால் திருமணம் செய்யலாம்';
    summaryTamil = `10 பொருத்தங்களில் ${totalScore}/${maxScore} மதிப்பெண்கள் பெற்றுள்ளன. ரஜ்ஜு பொருத்தம் சுபமாக உள்ளது. தம்பதியர் பரஸ்பர புரிதலுடன் இனிமையான இல்லறத்தை நடத்தலாம்.`;
    if (!isKujaBalanced) {
      recommendationsTamil.push('செவ்வாய் தோஷ நிவர்த்தி பரிகாரங்களை (வைத்தீஸ்வரன் கோவில் வழிபாடு) மேற்கொள்வது நலம்.');
    }
    if (dasaSandhi.hasSandhiAlert) {
      recommendationsTamil.push('தசா சந்தி காலத்தில் நவகிரக ஹோமம் மற்றும் திருக்கடையூர் வழிபாடு செய்வது சிறப்பு.');
    }
  } else {
    finalVerdict = 'not_recommended';
    verdictTitleTamil = 'பொருத்தம் குறைவு (Not Recommended)';
    verdictSubtitleTamil = 'பொருத்த மதிப்பெண்கள் குறைவாக இருப்பதால் வரன் முடிவு செய்வதைத் தவிர்க்கலாம்';
    summaryTamil = `10 பொருத்தங்களில் ${totalScore}/${maxScore} மதிப்பெண்கள் மட்டுமே பெற்றுள்ளதால் இணக்கமான தாம்பத்தியம் அமைய வாய்ப்பு குறைவு.`;
    recommendationsTamil.push('குடும்ப பெரியவர்கள் மற்றும் ஜோதிட நிபுணருடன் ஆலோசித்து முடிவு செய்யவும்.');
  }

  const boySummary: PersonMatchingSummary = {
    name: boyInput.name || 'மணமகன்',
    gender: 'ஆண்',
    nakshatra: boyStar.nameTamil,
    nakshatraIndex: boyStar.index,
    pada: boyPada,
    rasi: RASI_NAMES_TAMIL[boyRasi],
    rasiIndex: boyRasi,
    rasiLord: SIGN_LORDS[boyRasi],
    gana: boyStar.gana,
    yoni: { animal: boyStar.yoniAnimal, gender: boyStar.yoniGender },
    rajju: boyStar.rajju,
    hasFullChart: !!boyInput.chartData,
    chartData: boyInput.chartData
  };

  const girlSummary: PersonMatchingSummary = {
    name: girlInput.name || 'மணமகள்',
    gender: 'பெண்',
    nakshatra: girlStar.nameTamil,
    nakshatraIndex: girlStar.index,
    pada: girlPada,
    rasi: RASI_NAMES_TAMIL[girlRasi],
    rasiIndex: girlRasi,
    rasiLord: SIGN_LORDS[girlRasi],
    gana: girlStar.gana,
    yoni: { animal: girlStar.yoniAnimal, gender: girlStar.yoniGender },
    rajju: girlStar.rajju,
    hasFullChart: !!girlInput.chartData,
    chartData: girlInput.chartData
  };

  return {
    boy: boySummary,
    girl: girlSummary,
    totalScore,
    maxScore,
    percentage,
    matchCount,
    isRajjuMatch,
    isVedhaMatch,
    finalVerdict,
    verdictTitleTamil,
    verdictSubtitleTamil,
    summaryTamil,
    poruthams,
    kujaDosha: {
      boy: boyKuja,
      girl: girlKuja,
      isBalanced: isKujaBalanced,
      balanceVerdict: kujaBalanceVerdict
    },
    papaSamyam,
    dasaSandhi,
    recommendationsTamil
  };
}
