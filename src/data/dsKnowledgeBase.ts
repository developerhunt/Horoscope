/**
 * D.S. ASTRO SYSTEM - KNOWLEDGE MEMORY DATABASE & DETERMINISTIC RULE ENGINE
 * 
 * Source: "D.S.Astro System: தசாநாதன் இருக்கும் இடத்தை லக்கினமாக பாவித்து பலன் எடுக்கும் முறை"
 * Author: T. Jayashankar, Ayyan Astro Academy, Madurai
 * Pages: 1 - 131 Complete Coverage
 */

import {
  DSPredictionItem,
  DSPredictionTiming,
  DSPredictionRuleMatch,
  DasaTimeline,
  CurrentDasaBhuktiInfo
} from '../types';

export interface DSPlanetPosition {
  name: string;
  sign: number; // 0 to 11 (0: Mesham ... 11: Meenam)
  degree: number; // 0 to 30 within sign
  rawLon: number; // 0 to 360
  nakshatra?: string;
  pada?: number;
  starLord?: string;
  isRetrograde?: boolean;
  isCombust?: boolean;
}

export interface DSRuleDefinition {
  ruleId: string;
  category: string;
  subcategory: string;
  sourcePage: number;
  sourceSection: string;
  titleTamil: string;
  titleEnglish: string;
  conditionDescription: string;
  predictionTextTamil: string;
  predictionTextEnglish: string;
  severity: 'favorable' | 'strong_indication' | 'moderate_indication' | 'caution';
  targetTimingTrigger?: 'marriage' | 'career' | 'foreign' | 'debt_clear' | 'progeny' | 'property' | 'general';
}

export const SIGN_NAMES_TAMIL = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்',
  'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்',
  'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'
];

export const SIGN_LORDS: Record<number, string> = {
  0: 'செவ்வாய்', 1: 'சுக்கிரன்', 2: 'புதன்', 3: 'சந்திரன்',
  4: 'சூரியன்', 5: 'புதன்', 6: 'சுக்கிரன்', 7: 'செவ்வாய்',
  8: 'குரு', 9: 'சனி', 10: 'சனி', 11: 'குரு'
};

// Ubaya / Dual signs (Double nature)
export const UBAYA_SIGNS = [2, 5, 8, 11]; // Mithunam, Kanni, Dhanusu, Meenam
export const MALE_SIGNS = [0, 2, 4, 6, 8, 10]; // Mesham, Mithunam, Simmam, Thulam, Dhanusu, Kumbam
export const FEMALE_SIGNS = [1, 3, 5, 7, 9, 11]; // Rishabam, Kadagam, Kanni, Vrischikam, Magaram, Meenam

// Soil Types mapped to Rasis (Book Page 15-16, 20-22)
export const RASI_SOIL_MAP: Record<number, { soil: string; nature: string; landType: string; crop: string }> = {
  0: { soil: 'முழு பலம் (Fertile)', nature: 'ஊர்வன / 2 கால்கள்', landType: 'நீர்க்கரை / விளைநிலம்', crop: 'கரும்பு' },
  1: { soil: 'மலடு (Barren)', nature: 'நடை / 4 கால்கள்', landType: 'காடு / வறண்ட பூமி', crop: 'நெல்' },
  2: { soil: 'பாதி பலம் (Semi-fertile)', nature: 'நடை / 4 கால்கள்', landType: 'விளைநிலம்', crop: 'கொடி' },
  3: { soil: 'வறண்ட (Arid)', nature: 'நடை / 2 கால்கள்', landType: 'ஊர் / குளம்', crop: 'செடி' },
  4: { soil: 'வறண்ட (Arid)', nature: 'ஜடம் / 3 கால்கள்', landType: 'குளம் / கிணறு', crop: 'முள்' },
  5: { soil: 'முழு பலம் (Fertile)', nature: 'தவழும் / 6 கால்கள்', landType: 'வாய்க்கால்', crop: 'கொடி' },
  6: { soil: 'பாதி பலம் (Semi-fertile)', nature: 'பறக்கும் / 1 கால்', landType: 'நீர்க்கரை', crop: 'செடி' },
  7: { soil: 'மலடு (Barren)', nature: 'நடை / 4 கால்கள்', landType: 'மலை / புதர்', crop: 'மரம்' },
  8: { soil: 'மலடு (Barren)', nature: 'நடை / 2 கால்கள்', landType: 'மைதானம்', crop: 'மரம்' },
  9: { soil: 'முழு பலம் (Fertile)', nature: 'தவழும் / 8 கால்கள்', landType: 'கிணறு', crop: 'நெல்' },
  10: { soil: 'வறண்ட (Arid)', nature: 'ஜடம் / 1 கால்', landType: 'ஆற்றங்கரை', crop: 'கொடி' },
  11: { soil: 'பாதி பலம் (Semi-fertile)', nature: 'நடை / 2 கால்கள்', landType: 'ஊர் / நீர்நிலை', crop: 'செடி' }
};

// 12 Rasis Body Anatomy Map & Gender-Aware Anatomy Resolver (Book Page 12, 114-124)
export interface RasiAnatomyInfo {
  organ: string;
  organEnglish: string;
  secretSignificance: string;
}

export function getRasiAnatomy(sign: number, gender: string = 'ஆண்'): RasiAnatomyInfo {
  const isFemale = gender === 'பெண்' || gender?.toLowerCase() === 'female' || gender === 'f';

  switch (sign) {
    case 0: // மேஷம் (Aries)
      return { organ: 'தலை, முகம்', organEnglish: 'Head & Face', secretSignificance: 'ஆன்ம காரகம், மூளை இயக்கம், தலைமை குணம்' };
    case 1: // ரிஷபம் (Taurus)
      return { organ: 'கழுத்து, தொண்டை', organEnglish: 'Neck & Throat', secretSignificance: 'குரல் வளம், தைராய்டு, உணவுப்பாதை' };
    case 2: // மிதுனம் (Gemini)
      return { organ: 'தோள்பட்டை, கைகள், சுவாசப்பை', organEnglish: 'Shoulders, Arms & Respiratory tract', secretSignificance: 'நரம்பு இயக்கம், செயல் திறன், இளமை' };
    case 3: // கடகம் (Cancer)
      return isFemale
        ? { organ: 'மார்பகம், இதயம், கர்ப்பப்பை', organEnglish: 'Breast, Heart & Uterus', secretSignificance: 'தாய்ப்பால் சுரப்பு (சந்திரன்), மார்பக ஆரோக்கியம்' }
        : { organ: 'மார்புப் பகுதி, இதயம், நுரையீரல்', organEnglish: 'Chest, Heart & Lungs', secretSignificance: 'உடல் சோர்வு, நெஞ்சு சளி, சுவாச பலம்' };
    case 4: // சிம்மம் (Leo)
      return { organ: 'இதயம், முதுகுத்தண்டு', organEnglish: 'Heart & Spine', secretSignificance: 'ரத்த ஓட்டம், தண்டுவடம், பிடிவாதம்' };
    case 5: // கன்னி (Virgo)
      return { organ: 'வயிறு, இடுப்பு மேல் பகுதி, குடல்', organEnglish: 'Upper Abdomen, Intestines & Waist', secretSignificance: 'செரிமானம், இடுப்பு மச்சம் (கேது), கன்னி தன்மை' };
    case 6: // துலாம் (Libra)
      return isFemale
        ? { organ: 'சிறுநீரகம், மாதவிடாய்/கர்ப்பப்பை, மர்ம உறுப்பு', organEnglish: 'Kidneys, Private & Female Reproductive Organs', secretSignificance: 'காம உறைவிடம் (சுக்கிரன்), கர்ப்பப்பை நலம், ஹார்மோன் சமநிலை' }
        : { organ: 'சிறுநீரகம், ஆண்மை உறுப்புகள், மர்ம உறுப்பு', organEnglish: 'Kidneys, Private & Male Reproductive Organs', secretSignificance: 'காம உறைவிடம் (சுக்கிரன்), ராகு/கேது சேர்க்கை பலன், சுக்கில வீரியம்' };
    case 7: // விருச்சிகம் (Scorpio)
      return isFemale
        ? { organ: 'ஆசனவாய், கழிவு உறுப்பு, இடுப்பெலும்பு', organEnglish: 'Rectum, Excretory & Pelvic Organs', secretSignificance: 'மூலம்/பவுத்திரம் (சனி/செவ்வாய்), இடுப்பு மற்றும் ரகசிய மறைவிட உறுப்புகள்' }
        : { organ: 'ஆசனவாய், கழிவு உறுப்பு, புரோஸ்டேட்', organEnglish: 'Rectum, Excretory & Pelvic Organs', secretSignificance: 'மூலம்/பவுத்திரம் (சனி/செவ்வாய்), ரகசிய மறைவிட உறுப்புகள்' };
    case 8: // தனுசு (Sagittarius)
      return { organ: 'தொடைகள், இடுப்பு மூட்டு', organEnglish: 'Thighs & Hip Joints', secretSignificance: 'குருவின் தசைப்பிடிப்பு, எலும்பு பலம்' };
    case 9: // மகரம் (Capricorn)
      return { organ: 'முழங்கால்கள்', organEnglish: 'Knees', secretSignificance: 'சனி காரகம், மூட்டு இயக்கம், உடல் உழைப்பு' };
    case 10: // கும்பம் (Aquarius)
      return { organ: 'கணுக்கால், கால்கள்', organEnglish: 'Ankles & Lower Legs', secretSignificance: 'கால் நரம்புகள், ரத்த ஓட்டம், ஊனம்/வலி' };
    case 11: // மீனம் (Pisces)
      return { organ: 'பாதங்கள்', organEnglish: 'Feet', secretSignificance: 'மோட்ச ஸ்தானம், அயன சயன சுகம், தூக்கம்' };
    default:
      return { organ: 'பொதுவான உடல் உறுப்பு', organEnglish: 'General Anatomy', secretSignificance: 'ஆரோக்கிய பராமரிப்பு' };
  }
}

export const RASI_ANATOMY_MAP: Record<number, RasiAnatomyInfo> = {
  0: getRasiAnatomy(0, 'ஆண்'),
  1: getRasiAnatomy(1, 'ஆண்'),
  2: getRasiAnatomy(2, 'ஆண்'),
  3: getRasiAnatomy(3, 'ஆண்'),
  4: getRasiAnatomy(4, 'ஆண்'),
  5: getRasiAnatomy(5, 'ஆண்'),
  6: getRasiAnatomy(6, 'ஆண்'),
  7: getRasiAnatomy(7, 'ஆண்'),
  8: getRasiAnatomy(8, 'ஆண்'),
  9: getRasiAnatomy(9, 'ஆண்'),
  10: getRasiAnatomy(10, 'ஆண்'),
  11: getRasiAnatomy(11, 'ஆண்')
};

// Directional Rules for Travel & Spouse Place (Book Page 13)
export const RASI_DIRECTION_MAP: Record<number, { direction: string; streetType: string }> = {
  0: { direction: 'வடக்கு (North)', streetType: 'முட்டு சந்து (Cul-de-sac / Dead-end)' },
  1: { direction: 'கிழக்கு (East)', streetType: 'தெரு (Street)' },
  2: { direction: 'தெற்கு (South)', streetType: 'மெயின் வீதி (Main Road)' },
  3: { direction: 'மேற்கு (West)', streetType: 'முட்டு சந்து (Cul-de-sac)' },
  4: { direction: 'மேற்கு (West)', streetType: 'மெயின் வீதி (Main Road)' },
  5: { direction: 'வடக்கு (North)', streetType: 'தெரு (Street)' },
  6: { direction: 'கிழக்கு (East)', streetType: 'மெயின் வீதி (Main Road)' },
  7: { direction: 'தெற்கு (South)', streetType: 'தெரு (Street)' },
  8: { direction: 'கிழக்கு (East)', streetType: 'முட்டு சந்து (Cul-de-sac)' },
  9: { direction: 'வடக்கு (North)', streetType: 'மெயின் வீதி (Main Road)' },
  10: { direction: 'மேற்கு (West)', streetType: 'தெரு (Street)' },
  11: { direction: 'தெற்கு (South)', streetType: 'முட்டு சந்து (Cul-de-sac)' }
};

// Planetary aspects helper
export function checkPlanetaryAspect(fromSign: number, toSign: number, planetName: string): boolean {
  const diff = (toSign - fromSign + 12) % 12;
  // All planets have 7th aspect (diff == 6)
  if (diff === 6) return true;
  if (planetName.includes('செவ்வாய்') && (diff === 3 || diff === 7)) return true; // 4th & 8th aspect
  if (planetName.includes('குரு') && (diff === 4 || diff === 8)) return true; // 5th & 9th aspect
  if (planetName.includes('சனி') && (diff === 2 || diff === 9)) return true; // 3rd & 10th aspect
  return false;
}

export function isTrine(sign1: number, sign2: number): boolean {
  const diff = Math.abs(sign1 - sign2) % 12;
  return diff === 4 || diff === 8 || diff === 0;
}

export function isKendra(sign1: number, sign2: number): boolean {
  const diff = (sign2 - sign1 + 12) % 12;
  return diff === 0 || diff === 3 || diff === 6 || diff === 9;
}

export function isDusthana(fromSign: number, toSign: number): boolean {
  const diff = (toSign - fromSign + 12) % 12;
  return diff === 5 || diff === 7 || diff === 11; // 6, 8, 12 houses
}

/**
 * DETERMINISTIC TIMING CORRELATOR (LIFE-STAGE & HISTORICAL AWARE)
 * Scans user's Dasa-Bhukti timeline and pins the exact month/year when a rule activates.
 * If userDob and [targetAgeStart, targetAgeEnd] are provided, it first checks the historical
 * or designated age window to locate when the event historically took place or will take place.
 */
export function correlateTiming(
  dasaTimelines: DasaTimeline[] | undefined,
  targetPlanets: string[],
  currentDasaLord: string,
  currentBhuktiLord: string,
  userDob?: string,
  targetAgeStart?: number,
  targetAgeEnd?: number
): DSPredictionTiming {
  if (!dasaTimelines || dasaTimelines.length === 0) {
    return {
      dasa: currentDasaLord,
      bhukti: currentBhuktiLord,
      window: `${currentDasaLord} திசை - ${currentBhuktiLord} புக்தி நடப்பு காலம்`
    };
  }

  const now = new Date();

  // Helper to calculate user's age at a specific date
  let birthDate: Date | null = null;
  if (userDob) {
    const parts = userDob.includes('-') ? userDob.split('-') : userDob.split('/');
    if (parts.length >= 3) {
      birthDate = parts[0].length === 4
        ? new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
        : new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
  }

  // 1. AGE WINDOW SEARCH (Historical or Future window scan e.g., marriage between 23 and 36)
  if (birthDate && targetAgeStart !== undefined && targetAgeEnd !== undefined) {
    for (const dasa of dasaTimelines) {
      if (dasa.bhuktis && dasa.bhuktis.length > 0) {
        for (const bhukti of dasa.bhuktis) {
          const bStart = new Date(bhukti.startDate);
          const bEnd = new Date(bhukti.endDate);

          // Age during bhukti
          const ageAtStart = (bStart.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
          const ageAtEnd = (bEnd.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

          // Check if bhukti overlaps target age window
          const ageOverlaps = ageAtEnd >= targetAgeStart && ageAtStart <= targetAgeEnd;

          if (ageOverlaps) {
            const matches = targetPlanets.some(
              p => bhukti.bhuktiLord.includes(p) || p.includes(bhukti.bhuktiLord) || dasa.dasaLord.includes(p)
            );
            if (matches) {
              const startStr = formatDateTamilMonthYear(bhukti.startDate);
              const endStr = formatDateTamilMonthYear(bhukti.endDate);
              return {
                dasa: dasa.dasaLord,
                bhukti: bhukti.bhuktiLord,
                startDate: bhukti.startDate,
                endDate: bhukti.endDate,
                window: `${startStr} முதல் ${endStr} வரை (${dasa.dasaLord} தசையில் ${bhukti.bhuktiLord} புக்தி)`
              };
            }
          }
        }
      }
    }
  }

  // 2. FORWARD SEARCH (From current or upcoming bhuktis)
  for (const dasa of dasaTimelines) {
    if (dasa.bhuktis && dasa.bhuktis.length > 0) {
      for (const bhukti of dasa.bhuktis) {
        const endD = new Date(bhukti.endDate);
        if (endD >= now) {
          const matches = targetPlanets.some(
            p => bhukti.bhuktiLord.includes(p) || p.includes(bhukti.bhuktiLord) || dasa.dasaLord.includes(p)
          );
          if (matches) {
            const startStr = formatDateTamilMonthYear(bhukti.startDate);
            const endStr = formatDateTamilMonthYear(bhukti.endDate);
            return {
              dasa: dasa.dasaLord,
              bhukti: bhukti.bhuktiLord,
              startDate: bhukti.startDate,
              endDate: bhukti.endDate,
              window: `${startStr} முதல் ${endStr} வரை (${dasa.dasaLord} தசையில் ${bhukti.bhuktiLord} புக்தி)`
            };
          }
        }
      }
    }
  }

  return {
    dasa: currentDasaLord,
    bhukti: currentBhuktiLord,
    window: `${currentDasaLord} தசையில் சாதகமான புக்தி காலம்`
  };
}

function formatDateTamilMonthYear(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்',
      'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'
    ];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

/**
 * MASTER EVALUATION FUNCTION
 * Performs full scan across all 10 chapters of the D.S. Astro System.
 */
export function evaluatePremiumChart(
  positions: DSPlanetPosition[],
  dasaInfo: CurrentDasaBhuktiInfo | { dasaLord: string; bhuktiLord?: string },
  lagnaIndex: number,
  dasaTimelines?: DasaTimeline[],
  gender: string = 'ஆண்',
  mode: 'dasa' | 'bhukti' = 'dasa',
  age: number = 30,
  userDob?: string
): Record<string, DSPredictionItem> {
  const getP = (name: string): DSPlanetPosition | undefined =>
    positions.find(p => p.name === name || p.name.includes(name));

  const sun = getP('சூரியன்');
  const moon = getP('சந்திரன்');
  const mars = getP('செவ்வாய்');
  const mercury = getP('புதன்');
  const jupiter = getP('குரு');
  const venus = getP('சுக்கிரன்');
  const saturn = getP('சனி');
  const rahu = getP('ராகு');
  const ketu = getP('கேது');

  const currentDasaLord = dasaInfo.dasaLord || 'குரு';
  const currentBhuktiLord = (dasaInfo as CurrentDasaBhuktiInfo).bhuktiLord || dasaInfo.bhuktiLord || currentDasaLord;

  const activePivotPlanet = mode === 'bhukti' ? currentBhuktiLord : currentDasaLord;
  const pivotObj = getP(activePivotPlanet);
  const activeLagna = pivotObj ? pivotObj.sign : lagnaIndex;
  const activeLagnaName = SIGN_NAMES_TAMIL[activeLagna];
  const activeDispositorName = SIGN_LORDS[activeLagna];
  const activeDispositorObj = getP(activeDispositorName);

  const results: Record<string, DSPredictionItem> = {};

  // ----------------------------------------------------------------------------------------
  // 1. AGRICULTURE & SOIL (விவசாயம் & மண் வளம் - Pages 15-16, 20-22)
  // ----------------------------------------------------------------------------------------
  const soilData = RASI_SOIL_MAP[activeLagna];
  const hasMoonVenusWater = (moon && [3, 7, 11].includes(moon.sign)) || (venus && [1, 6, 11].includes(venus.sign));
  const agrTiming = correlateTiming(dasaTimelines, ['சந்திரன்', 'சுக்கிரன்', 'சனி'], currentDasaLord, currentBhuktiLord);

  results['agriculture'] = {
    category: 'agriculture',
    title: 'விவசாயம், நில வகை & மண் வளம் (Agriculture & Soil Mapping)',
    status: 'favorable',
    summary: `D.S.Astro System தத்துவப்படி, ${activeLagnaName} லக்னத்திற்கு நிலத்தின் மண் வளம் '${soilData.soil}' பண்புடையதாகும். ராசியின் கால் இயல்பு '${soilData.nature}' என்பதால், நிலத்தில் '${soilData.crop}' சாகுபடியும், '${soilData.landType}' அமைப்பும் மிகச் சிறந்த பலனைத் தரும்.`,
    signals: [
      `மண் வளத் தன்மை: ${soilData.soil}`,
      `பொருத்தமான பயிர் சாகுபடி: ${soilData.crop} மற்றும் காய்கனித் தோட்டங்கள்`,
      `நிலத்தின் இயல்பு: ${soilData.landType} (${soilData.nature})`,
      hasMoonVenusWater ? 'சந்திரன்/சுக்கிரன் பலத்தால் நிலத்தடி நீர் மற்றும் ஆழ்குழாய் கிணறு வசதி சிறக்கும்' : 'முறையான பாசன மேலாண்மை லாபத்தை பெருக்கும்'
    ],
    obstructions: (saturn && isDusthana(activeLagna, saturn.sign)) ? ['சனி மறைவு பெற்ற காலங்களில் பண்ணை வேலைகளில் ஆட்கள் பற்றாக்குறை கவனிக்கப்பட வேண்டும்'] : [],
    timing: agrTiming,
    matchedRules: [
      { ruleId: 'DS-AGR-001', title: 'விவசாயத்திற்கு உதவும் காரணிகள் & பயிர் வகைகள்', sourcePage: 15, section: 'விவசாய காரணிகள்' },
      { ruleId: 'DS-AGR-002', title: 'ஆண்மை & நிலத்தின் மண் வளம் அறியும் கட்டம்', sourcePage: 16, section: 'மண் வளம்' },
      { ruleId: 'DS-AGR-003', title: 'ராசிகளின் கால்களும் பிரயாணமும்', sourcePage: 14, section: 'ராசி கால்கள்' }
    ],
    reasoning: `நூலின் 14-16 பக்கங்களின்படி, 12 ராசிகளின் 4 நிலை மண் பலம் (முழு பலம், மலடு, பாதி பலம், வறண்ட) மற்றும் கால்களின் எண்ணிக்கை கொண்டு விவசாய பலன் நிர்ணயிக்கப்பட்டுள்ளது.`
  };

  // ----------------------------------------------------------------------------------------
  // 2. TRAVEL & FOREIGN (பயணம் & வெளிநாடு, வரன் திசை - Pages 13, 49-51)
  // ----------------------------------------------------------------------------------------
  const dirData = RASI_DIRECTION_MAP[activeLagna];
  const house12Sign = (activeLagna + 11) % 12;
  const house8Sign = (activeLagna + 7) % 12;
  const house6Sign = (activeLagna + 5) % 12;
  const house4Sign = (activeLagna + 3) % 12;
  const house3Sign = (activeLagna + 2) % 12;

  const isDispositorHidden = activeDispositorObj && [house3Sign, house6Sign, house8Sign, house12Sign].includes(activeDispositorObj.sign);
  const isRahuContact = rahu && (activeDispositorObj?.sign === rahu.sign || isTrine(activeLagna, rahu.sign));
  const isKetuContact = ketu && (activeDispositorObj?.sign === ketu.sign || isTrine(activeLagna, ketu.sign));

  let foreignDistanceText = 'பிறந்த ஊரிலேயே தொழில் மற்றும் பணிகள் சிறப்புறும்';
  if (activeDispositorObj?.sign === house12Sign) {
    foreignDistanceText = 'வெகு தொலைவில் உள்ள வெளிநாடுகளில் நீண்டகால உத்தியோகம் மற்றும் நிரந்தர குடியுரிமை (PR) யோகம்';
  } else if (activeDispositorObj?.sign === house8Sign) {
    foreignDistanceText = 'அருகில் உள்ள வெளிநாடுகளில் (Gulf / SE Asia) உத்தியோக பயணம் மற்றும் குறுகிய கால பணி';
  } else if (activeDispositorObj?.sign === house6Sign) {
    foreignDistanceText = 'வெளி மாநிலத்தில் உத்தியோகம் மற்றும் பணி வாய்ப்பு';
  } else if (activeDispositorObj?.sign === house3Sign) {
    foreignDistanceText = 'வெளியூர் மாற்றங்கள் மற்றும் அடிக்கடி தொழில் பயணங்கள்';
  }

  const travelTiming = correlateTiming(dasaTimelines, ['ராகு', SIGN_LORDS[house12Sign], 'சனி', 'புதன்'], currentDasaLord, currentBhuktiLord);

  results['travel'] = {
    category: 'travel',
    title: 'பிரயாணம், வெளிநாடு & வரன் அமையும் திசை (Travel & Direction)',
    status: isDispositorHidden ? 'strong_indication' : 'favorable',
    summary: `D.S.Astro System விதிப்படி ${activeLagnaName} லக்னாதிபதி ${activeDispositorName} நிலைப்படி: "${foreignDistanceText}". வரன் அல்லது பிரதான வாய்ப்புகள் '${dirData.direction}' திசையிலும், '${dirData.streetType}' வீதி அமைப்பிலும் கைகூடும்.`,
    signals: [
      `பயண நிலை: ${foreignDistanceText}`,
      `வரன் / வாய்ப்பு திசை: ${dirData.direction}`,
      `வீதி அடையாளம்: ${dirData.streetType}`,
      isRahuContact ? 'ராகு தொடர்பு இருப்பதால் மேற்கத்திய / கல்ப் நாடுகள் அனுகூலம்' : isKetuContact ? 'கேது தொடர்பு இருப்பதால் ஆன்மீக தேசங்கள் / தீவுகள் அனுகூலம்' : 'சுப கிரக பார்வைகள் மூலம் அமைதியான பயணம்'
    ],
    obstructions: [],
    timing: travelTiming,
    matchedRules: [
      { ruleId: 'DS-TRV-001', title: 'வரன் அமையும் இடம், திசை மற்றும் வீதி அமைப்பு', sourcePage: 13, section: 'வரன் திசை' },
      { ruleId: 'DS-TRV-002', title: 'வெளிநாட்டில் வேலை & தூர நிர்ணயம் (3, 6, 8, 12)', sourcePage: 50, section: 'வெளிநாட்டு வேலை' },
      { ruleId: 'DS-TRV-003', title: 'வெளிநாட்டில் நிரந்தர குடியுரிமை (PR) சூத்திரம்', sourcePage: 51, section: 'குடியுரிமை' }
    ],
    reasoning: `நூலின் 13 மற்றும் 50-51 பக்கங்களின்படி, லக்னாதிபதி 3 (வெளியூர்), 6 (வெளி மாநிலம்), 8 (அருகில் உள்ள நாடு), 12 (வெகு தொலைவு நாடு) மறைவு அமைப்புகளின் அடிப்படையில் துல்லியமாக கணிக்கப்பட்டது.`
  };

  // ----------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------
  // 3. ANATOMY & BODY HEALTH (உடல் உறுப்புகள் & நோய்கள் - Pages 12, 52-54, 114-128)
  // ----------------------------------------------------------------------------------------
  const isFemale = gender === 'பெண்' || gender?.toLowerCase() === 'female' || gender === 'f';
  const isMale = !isFemale;

  const anatomyData = getRasiAnatomy(activeLagna, isFemale ? 'பெண்' : 'ஆண்');
  const lord6Name = SIGN_LORDS[house6Sign];
  const lord6Obj = getP(lord6Name);

  let diseaseSpecific = 'பொதுவான சீரான உடல் நலம்';
  if (lord6Name === 'சூரியன்') {
    diseaseSpecific = isMale
      ? 'தலைவலி, முடி உதிர்வு, வலது கண் பார்வை, ஆண்மை/வீரிய குறைபாடு அல்லது தண்டுவடம்'
      : 'தலைவலி, முடி உதிர்வு, வலது கண் பார்வை, முதுகு எலும்பு அல்லது தண்டுவடம்';
  } else if (lord6Name === 'சந்திரன்') {
    diseaseSpecific = 'சளி, சைனஸ், இடது கண் பார்வை, மன அழுத்தம் அல்லது நீர் உபாதைகள்';
  } else if (lord6Name === 'செவ்வாய்') {
    diseaseSpecific = isFemale
      ? 'மாதவிடாய் உதிரப்போக்கு, ரத்த சோகை, எலும்பு மஜ்ஜை, பற்கள் அல்லது உஷ்ண உபாதைகள்'
      : 'ரத்த அழுத்தம், எலும்பு மஜ்ஜை, விபத்து காயங்கள், பற்கள் அல்லது ஈறுகளில் ரத்தக்கசிவு';
  } else if (lord6Name === 'புதன்') {
    diseaseSpecific = 'தோல் அலர்ஜி, நரம்பு பலவீனம் அல்லது ENT காது-மூக்கு-தொண்டை உபாதைகள்';
  } else if (lord6Name === 'குரு') {
    diseaseSpecific = 'கொழுப்பு கட்டி, சர்க்கரை நோய் (நீரிழிவு), கல்லீரல் அல்லது மூளை வளர்ச்சி/நரம்பு கவனம்';
  } else if (lord6Name === 'சுக்கிரன்') {
    diseaseSpecific = isFemale
      ? 'கர்ப்பப்பை கோளாறு, மாதவிடாய் பிரச்சனை, ஹார்மோன் சமநிலை அல்லது சர்க்கரை உபாதைகள்'
      : 'சிறுநீரகக் கற்கள் (Kidney Stones), நீர் அடைப்பு, விந்தணு/சுக்கில பலவீனம் அல்லது சர்க்கரை நோய்';
  } else if (lord6Name === 'சனி') {
    diseaseSpecific = 'கால்கள் வலி, மூட்டு வாதம், நரம்பு தளர்ச்சி அல்லது எலும்பு பலவீனம்';
  }

  // Gender-specific special health warnings from Book
  const healthSignals: string[] = [
    `பிரதான உடல் உறுப்பு: ${anatomyData.organ} (${anatomyData.organEnglish})`,
    `காரக உறுப்பு ரகசியம்: ${anatomyData.secretSignificance}`,
    `கவனிக்க வேண்டிய பகுதி: ${diseaseSpecific}`
  ];

  const healthObstructions: string[] = [];

  // Female-specific Breast Health Rule (Page 60, 119-120)
  if (isFemale) {
    const isBreastAffliction = (moon && mars && (rahu || ketu) && (
      (rahu && moon.sign === rahu.sign) || (ketu && moon.sign === ketu.sign) ||
      (mars && saturn && (house4Sign === 3 || moon.sign === 3))
    ));
    if (isBreastAffliction) {
      healthSignals.push('பெண்கள் நலம் (பக்கம் 119): மார்பகப் பகுதியில் தாய்ப்பால்/ஹார்மோன் சீரான பராமரிப்பு அவசியம்');
      healthObstructions.push('தாய்ப்பால் புகட்டுதல் மற்றும் மார்பக ஆரோக்கியத்தில் மருத்துவரின் வழக்கமான பரிசோதனை நலம்');
    }
  }

  // Male-specific Semen/Vitality Rule (Page 16, 42, 109)
  if (isMale) {
    const isVitalityAffliction = venus && saturn && ketu && (
      venus.sign === saturn.sign || isTrine(venus.sign, ketu.sign)
    );
    if (isVitalityAffliction) {
      healthSignals.push('ஆண்கள் நலம் (பக்கம் 16, 109): விந்து வீரியம் மற்றும் சுக்கில பலம் காக்க முறையான உணவுப் பழக்கம் அவசியம்');
      healthObstructions.push('இளமைக்கால வீரிய விரயங்களைத் தவிர்த்து யோகா மற்றும் ஊட்டச்சத்து உணவுகள் பழகுவது நலம்');
    }
  }

  if (ketu && ketu.sign === house6Sign) {
    healthObstructions.push('6-ல் கேது இருப்பதால் ஒவ்வாமை மற்றும் மருந்து விவகாரங்களில் தகுந்த மருத்துவ ஆலோசனை அவசியம்');
  }

  const healthTiming = correlateTiming(dasaTimelines, [lord6Name, 'சனி', 'கேது'], currentDasaLord, currentBhuktiLord);

  results['health'] = {
    category: 'health',
    title: 'உடல் உறுப்புகள் & ஆரோக்கிய பாதுகாப்பு (Anatomy & Health)',
    status: (lord6Obj && saturn && isDusthana(activeLagna, saturn.sign)) || healthObstructions.length > 0 ? 'caution' : 'favorable',
    summary: `${activeLagnaName} லக்னம் உடலின் '${anatomyData.organ}' பகுதியைக் குறிக்கிறது (${anatomyData.secretSignificance}). பாலினம்: ${isFemale ? 'பெண்' : 'ஆண்'} ஜாதக 6-ஆம் அதிபதி ${lord6Name} நிலைப்படி: "${diseaseSpecific}". நோய்த் தீர்வு/குணமாகும் காலம்: ${healthTiming.window}.`,
    signals: healthSignals,
    obstructions: healthObstructions,
    timing: healthTiming,
    matchedRules: [
      { ruleId: 'DS-BOD-001', title: 'ராசிகள் மற்றும் உடல் உறுப்புகள் தொடர்பு', sourcePage: 12, section: 'உடல் உறுப்புகள்' },
      { ruleId: 'DS-BOD-002', title: '6-ஆம் அதிபதி யார்? அவரால் ஏற்படும் நோய்கள்', sourcePage: 53, section: 'நோய் விவரம்' },
      { ruleId: 'DS-BOD-003', title: 'நோய் எப்போது குணமாகும் சூத்திரம்', sourcePage: 52, section: 'நோய் நிவர்த்தி' }
    ],
    reasoning: `நூலின் 12 மற்றும் 52-54 பக்கங்களின்படி, 6-ஆம் அதிபதியின் கிரக காரகம், பாலின வேறுபாடு (${isFemale ? 'பெண்' : 'ஆண்'}) மற்றும் தசா லக்னத்திற்குரிய உடல் உறுப்புப் பகுதிகள் இணைத்து பகுப்பாய்வு செய்யப்பட்டது.`
  };

  // ----------------------------------------------------------------------------------------
  // 4. EDUCATION & MEDICAL/PILOT YOGAS (கல்வி, மருத்துவம் & விமானப் படிப்பு - Pages 17-21, 23-27)
  // ----------------------------------------------------------------------------------------
  const isBudhaditya = sun && mercury && Math.abs(sun.rawLon - mercury.rawLon) <= 15.0;
  const isMedicalYoga = (mercury && saturn && moon && (
    mercury.sign === 5 || // Kanni
    isTrine(mercury.sign, saturn.sign) ||
    checkPlanetaryAspect(saturn.sign, mercury.sign, 'சனி')
  ));
  const isPilotYoga = mercury && rahu && [2, 6, 10].includes(mercury.sign); // Air signs: Gemini, Libra, Aquarius

  let eduSummary = 'வித்யாகாரகன் புதனின் பலத்தால் முறையான பட்டப்படிப்பு, மேலாண்மை மற்றும் எழுத்து/தகவல் துறை கல்வி அமையும்.';
  let eduSignals: string[] = ['கல்விக்குரிய காரகன் புதன் நற்பலன் தருகிறார்'];

  if (isBudhaditya) {
    eduSummary = 'சூரியன் + புதன் 15° பாகைக்குள் இணைந்து புதாதித்ய யோகம் தருவதால், கூர்மையான அறிவுத்திறன், கணிதம் மற்றும் உயர் கல்வித் தேர்ச்சி உறுதிப்படுகிறது.';
    eduSignals.push('புதாதித்ய யோகம்: 15° பாகைக்குள் சூரியன்-புதன் சேர்க்கை பலம்');
  }
  if (isMedicalYoga) {
    eduSignals.push('M.B.B.S. மருத்துவக் கல்வி யோகம்: புதன் + சனி + சந்திரன் தொடர்பு 6-ஆம் பாவகத்துடன் இணைகிறது');
  }
  if (isPilotYoga) {
    eduSignals.push('விமான ஓட்டுநர் (Pilot) படிப்பு யோகம்: காற்று ராசியில் புதன் + ராகு சேர்க்கை வலுப்பெற்றுள்ளது');
  }

  const eduTiming = correlateTiming(dasaTimelines, ['புதன்', 'சூரியன்', 'குரு'], currentDasaLord, currentBhuktiLord);

  results['education'] = {
    category: 'education',
    title: 'கல்வி, புதாதித்ய யோகம் & உயர் ஆராய்ச்சி (Education & Acumen)',
    status: 'favorable',
    summary: eduSummary,
    signals: eduSignals,
    obstructions: [],
    timing: eduTiming,
    matchedRules: [
      { ruleId: 'DS-EDU-001', title: 'புதன் என்னும் வித்யாகாரகன் & கல்வி விதிகள்', sourcePage: 17, section: 'கல்வி' },
      { ruleId: 'DS-EDU-002', title: 'புதாதித்ய யோகம் 15°-டிகிரிக்குள் இணையும் ரகசியம்', sourcePage: 18, section: 'கல்வி விதிகள்' },
      { ruleId: 'DS-EDU-006', title: 'M.B.B.S. மருத்துவம் யார் படிப்பார்கள்?', sourcePage: 20, section: 'மருத்துவம்' }
    ],
    reasoning: `நூலின் 17-20 பக்கங்களின்படி கல்வி ஒரு 'பொருள் காரகத்துவம்' என்பதால் பாப கிரகங்களால் தடைபடாது; புதன்-சூரியன் பாகை இடைவெளி மற்றும் 6-ஆம் இட கன்னித் தொடர்பால் மருத்துவ/உயர்கல்வி முடிவுகள் எடுக்கப்படுகின்றன.`
  };

  // ----------------------------------------------------------------------------------------
  // 5. MARRIAGE, TIMING & MARITAL HARMONY (100% CHART & TIMELINE DRIVEN - Pages 21-35)
  // ----------------------------------------------------------------------------------------
  if (age >= 16) {
    const lord7Sign = (activeLagna + 6) % 12;
    const lord2Sign = (activeLagna + 1) % 12;
    const lord6Sign = (activeLagna + 5) % 12;
    const lord8Sign = (activeLagna + 7) % 12;
    const lord7Name = SIGN_LORDS[lord7Sign];
    const lord2Name = SIGN_LORDS[lord2Sign];
    const lord6Name = SIGN_LORDS[lord6Sign];
    const lord8Name = SIGN_LORDS[lord8Sign];
    const lord12Name = SIGN_LORDS[house12Sign];

    const lord7Obj = getP(lord7Name);
    const lord2Obj = getP(lord2Name);
    const lord6Obj = getP(lord6Name);
    const lord8Obj = getP(lord8Name);

    // Rule A: DENIAL (திருமணமே இல்லை / கடுமையான தடை - Pages 21-25)
    // Check if Mars is in Paapakarthari Yoga (trapped between Saturn and Ketu), AND Venus is debilitated (Virgo/Kanni = 5) or heavily afflicted.
    let isMarsInPaapakarthari = false;
    if (mars && saturn && ketu) {
      const marsSign = mars.sign;
      const prevSign = (marsSign + 11) % 12;
      const nextSign = (marsSign + 1) % 12;
      const isSurrounded = (saturn.sign === prevSign && ketu.sign === nextSign) ||
                           (ketu.sign === prevSign && saturn.sign === nextSign) ||
                           (saturn.sign === marsSign && ketu.sign === marsSign);
      if (isSurrounded) isMarsInPaapakarthari = true;
    }
    const isVenusDebilitated = venus ? venus.sign === 5 : false; // Virgo (கன்னி)
    const isVenusDusthana = venus ? isDusthana(activeLagna, venus.sign) : false;
    const isMarriageDenial = (isMarsInPaapakarthari && isVenusDebilitated) ||
                             (isMarsInPaapakarthari && isVenusDusthana && lord7Obj && isDusthana(activeLagna, lord7Obj.sign));

    // Rule B: DELAY (திருமண தாமதம் - 30 முதல் 35+ வயதிற்கு மேல் - Pages 22-26)
    // Check if Saturn aspects Mars, or Mars is conjunct Ketu / Mandi (8th/12th contact).
    const isSaturnAspectingMars = (saturn && mars) ? checkPlanetaryAspect(saturn.sign, mars.sign, 'சனி') : false;
    const isMarsConjunctKetu = (mars && ketu) ? mars.sign === ketu.sign : false;
    const isMarsInDusthana = mars ? isDusthana(activeLagna, mars.sign) : false;
    const isMarriageDelayed = (isSaturnAspectingMars || isMarsConjunctKetu || isMarsInDusthana) && !isMarriageDenial;

    // Rule C: SEPARATION / DIVORCE (குடும்ப பிரிவினை / மனஸ்தாபம் - Pages 27-31)
    // Check if 2nd Lord is conjunct 6th/8th Lord AND Ketu
    let isSeparationIndicated = false;
    if (lord2Obj && ketu && lord2Obj.sign === ketu.sign) {
      if ((lord6Obj && lord2Obj.sign === lord6Obj.sign) || (lord8Obj && lord2Obj.sign === lord8Obj.sign)) {
        isSeparationIndicated = true;
      }
    }
    // Also check 7th lord in 6/8 with Ketu
    if (lord7Obj && ketu && lord7Obj.sign === ketu.sign && [lord6Sign, lord8Sign].includes(lord7Obj.sign)) {
      isSeparationIndicated = true;
    }

    // Rule D: LOVE & INTER-COMMUNITY (காதல் மற்றும் கலப்பு மணம் - Pages 28-30)
    const isLoveMarriage = mercury && (mercury.sign === lord7Sign || mercury.sign === (activeLagna + 4) % 12);
    const isInterCaste = (rahu && [lord2Sign, lord7Sign].includes(rahu.sign)) || (ketu && [lord2Sign, lord7Sign].includes(ketu.sign));

    // Rule E: LIFE-STAGE AWARE HISTORICAL & FUTURE TIMELINE SCAN
    // Target planets that trigger marriage: 7th lord, Venus, Mars (Mangalakaraka), 2nd lord, 12th lord, Rahu, Jupiter
    const marriageTriggerPlanets = ['செவ்வாய்', lord7Name, lord2Name, lord12Name, 'சுக்கிரன்', 'குரு', 'ராகு'];
    const now = new Date();

    // Standard Vedic marriage age window (24 to 35 years)
    const targetAgeStart = 24;
    const targetAgeEnd = 35;

    // Use life-stage aware correlateTiming with historical age window
    const marTiming = correlateTiming(
      dasaTimelines,
      marriageTriggerPlanets,
      currentDasaLord,
      currentBhuktiLord,
      userDob,
      targetAgeStart,
      targetAgeEnd
    );

    // Evaluate whether the identified marriage window is in the past or future
    const isHistoricalMarriage = marTiming.endDate ? new Date(marTiming.endDate) < now : false;

    let marTitle = 'திருமணம், தாம்பத்திய பந்தம் & கால நிர்ணயம் (Marriage & Timing)';
    let marStatus: DSPredictionItem['status'] = 'strong_indication';
    let marSummary = '';
    const marSignals: string[] = [];
    const marObstructions: string[] = [];
    const matchedRules: DSPredictionRuleMatch[] = [];

    // Construct Prediction based on exact Chart Combinations & Life-Stage Timeline
    if (isMarriageDenial) {
      marTitle = 'திருமண அமைப்பு & கிரக தோஷ ஆய்வு (Marriage Denial / Severe Affliction)';
      marStatus = 'caution';
      marSummary = 'மங்களகாரகன் செவ்வாய் சனி-கேது பாபகர்த்தாரி யோகத்தில் சிக்கி, சுக்கிரனும் பலவீனமடைந்துள்ளதால் திருமண அமைப்பில் கடுமையான தோஷம் உள்ளது. பெரும்பாலும் திருமணம் அமைவது கடினம் அல்லது ஆன்மீக நாட்டம் அதிகம் இருக்கும்.';
      marSignals.push('செவ்வாய் பாபகர்த்தாரி யோகம்: சனி மற்றும் கேதுவின் பிடியில் செவ்வாய்');
      marSignals.push(`சுக்கிரன் நிலை: ${venus ? (isVenusDebilitated ? 'கன்னியில் நீசம்' : 'மறைவு ஸ்தானம்') : 'பலவீனம்'}`);
      marObstructions.push('களத்திர தோஷ நிவர்த்தி பரிகாரங்கள் மற்றும் குலதெய்வ வழிபாடு இன்றி அவசரப்பட்டு வரன் முடிவு செய்வதைத் தவிர்க்கவும்');
      matchedRules.push(
        { ruleId: 'DS-MAR-009', title: 'திருமணமே அமையாத பாபகர்த்தாரி யோக ரகசியம்', sourcePage: 25, section: 'திருமணத் தடை' },
        { ruleId: 'DS-MAR-001', title: 'செவ்வாய் மங்களகாரகனை வைத்தே திருமணம் அறிதல்', sourcePage: 22, section: 'மங்களகாரகன்' }
      );
    } else if (isSeparationIndicated) {
      marTitle = 'குடும்ப ஒற்றுமை & தம்பதியர் பந்தம் (Marital Harmony & Caution)';
      marStatus = 'caution';
      marSummary = `குடும்ப ஸ்தானாதிபதி ${lord2Name} உடன் கேது மற்றும் 6/8-ஆம் அதிபதிகள் தொடர்பால் குடும்பப் பிரிவினை, கருத்து வேறுபாடு அல்லது சட்ட ரீதியான சிக்கல்கள் ஏற்படலாம். பரஸ்பர விட்டுக்கொடுத்தல் மிக அவசியம்.`;
      marSignals.push(`2-ஆம் குடும்ப ஸ்தானாதிபதி: ${lord2Name} + கேது + துஸ்தான தொடர்பு`);
      marSignals.push('மனஸ்தாபங்களை வளர்க்காமல் குடும்பப் பெரியவர்களின் ஆலோசனையைப் பெறுவது நலம்');
      marObstructions.push('கோபமான பேச்சு மற்றும் ஈகோ மோதல்களைத் தவிர்ப்பது இல்லற அமைதியைக் காக்கும்');
      matchedRules.push(
        { ruleId: 'DS-MAR-008', title: 'குடும்பப் பிரிவினை & விவாகரத்து சூத்திரங்கள்', sourcePage: 27, section: 'பிரிவினை' },
        { ruleId: 'DS-MAR-003', title: 'எந்த தசா புத்தியில் குடும்ப அமைதி பாதிக்கும்', sourcePage: 24, section: 'புத்தி காலங்கள்' }
      );
    } else if (isMarriageDelayed && !isHistoricalMarriage) {
      marTitle = 'திருமண தாமத யோகம் & வரன் காலம் (Delayed Marriage & Timing)';
      marStatus = 'caution';
      marSummary = `செவ்வாய் மீது சனி பார்வை அல்லது கேது/மறைவு தொடர்பு உள்ளதால் திருமணம் தாமதத்திற்குப் பிறகே (30 முதல் 35+ வயதிற்கு மேல்) நன்முறையில் நடக்கும். உங்களுக்கு திருமணம் நடைபெறும் உத்தேச காலம்: ${marTiming.window}.`;
      marSignals.push('செவ்வாய்-சனி பார்வை அல்லது கேது தொடர்பு: திருமணம் தாமத அமைப்பு');
      marSignals.push(`7-ஆம் களத்திர ஸ்தானாதிபதி: ${lord7Name} (${SIGN_NAMES_TAMIL[lord7Sign]})`);
      if (isLoveMarriage) marSignals.push('காதல் திருமண யோகம்: புதன் + 5, 7 அதிபதிகள் தொடர்பு');
      if (isInterCaste) marSignals.push('மாற்று மதம்/வகுப்பு தொடர்பு: 2/7-ல் ராகு/கேது சேர்க்கை');
      marObstructions.push('திருமணத்தில் அவசரம் தவிர்த்து 30 வயதிற்குப் பின் தகுந்த ஜாதகப் பொருத்தம் பார்த்து வரன் முடிப்பது நலம்');
      matchedRules.push(
        { ruleId: 'DS-MAR-005', title: 'செவ்வாய் மீது சனி பார்வை - திருமண தாமத ரகசியம்', sourcePage: 23, section: 'தாமத திருமணம்' },
        { ruleId: 'DS-MAR-002', title: 'திருமணம் எப்போது நடக்கும் சூத்திரம் (12-ஆம் அதிபதி)', sourcePage: 23, section: 'சூத்திரம்' }
      );
    } else if (isHistoricalMarriage) {
      // Historical Marriage in Past
      marTitle = 'தாம்பத்திய வாழ்க்கை & குடும்ப ஒற்றுமை (Marital Harmony & Spousal Bond)';
      marStatus = 'favorable';
      marSummary = `உங்கள் ஜாதகப்படி, கடந்த ${marTiming.window} காலகட்டத்தில் திருமணம் நடந்திருக்க வாய்ப்புள்ளது. தற்போது தாம்பத்திய மற்றும் குடும்ப உறவுகள் பற்றிய பலன்கள்: களத்திர ஸ்தானாதிபதி ${lord7Name} மற்றும் மங்களகாரகன் செவ்வாய் சுப பலம் பெற்றுள்ளதால் இல்லற வாழ்க்கையும் தம்பதியர் ஒற்றுமையும் நீடிக்கும்.`;
      marSignals.push(`திருமணம் நடந்த உத்தேச காலம்: ${marTiming.window}`);
      marSignals.push(`7-ஆம் களத்திர அதிபதி: ${lord7Name} (${SIGN_NAMES_TAMIL[lord7Sign]})`);
      marSignals.push(`மங்களகாரகன் செவ்வாய்: ${mars ? SIGN_NAMES_TAMIL[mars.sign] : 'சுப பலம்'}`);
      if (isMarriageDelayed) marSignals.push('கிரக நிலைகளின்படி திருமண தாமத யோகம் கடந்து சுப வாழ்க்கை அமைந்த அமைப்பு');
      marSignals.push('குடும்ப வளர்ச்சி மற்றும் சுப காரியங்கள் தடையின்றி நடக்கும்');
      matchedRules.push(
        { ruleId: 'DS-MAR-001', title: 'செவ்வாய் மங்களகாரகனை வைத்தே திருமணம் அறிதல்', sourcePage: 22, section: 'திருமணம்' },
        { ruleId: 'DS-MAR-004', title: 'தாம்பத்திய சுகமும் குடும்ப ஸ்தான வலிமையும்', sourcePage: 26, section: 'குடும்ப சுகம்' }
      );
    } else {
      // Future Unmarried Prospects
      marTitle = 'திருமணம் & வரன் அமையும் காலம் (Marriage Prospects & Timing)';
      marStatus = 'strong_indication';
      marSummary = `மங்களகாரகன் செவ்வாய் மற்றும் 7-ஆம் அதிபதி ${lord7Name} சுப பலம் பெற்றுள்ளதால், குடும்ப வாழ்க்கையும் தாம்பத்திய பந்தமும் நன்முறையில் அமையும். உங்களுக்கு திருமணம் நடைபெறும் உத்தேச காலம்: ${marTiming.window}.`;
      marSignals.push(`7-ஆம் களத்திர அதிபதி: ${lord7Name} (${SIGN_NAMES_TAMIL[lord7Sign]})`);
      marSignals.push(`மங்களகாரகன் செவ்வாய்: ${mars ? SIGN_NAMES_TAMIL[mars.sign] : 'சுப பலம்'}`);
      if (isLoveMarriage) marSignals.push('காதல் திருமண யோகம்: புதன் + 5, 7 அதிபதிகள் தொடர்பு');
      else marSignals.push('பெற்றோர் சம்மதத்துடன் கூடிய சுப விவாக யோகம்');
      if (isInterCaste) marSignals.push('மாற்று மதம்/வகுப்பு தொடர்பு யோகம்: 2/7-ல் ராகு/கேது சேர்க்கை');
      matchedRules.push(
        { ruleId: 'DS-MAR-001', title: 'செவ்வாய் மங்களகாரகனை வைத்தே திருமணம் அறிதல்', sourcePage: 22, section: 'திருமணம்' },
        { ruleId: 'DS-MAR-002', title: 'திருமணம் எப்போது நடக்கும் சூத்திரம் (12-ஆம் அதிபதி)', sourcePage: 23, section: 'சூத்திரம்' },
        { ruleId: 'DS-MAR-003', title: 'எந்த தசா புத்தியில் திருமணம் நடக்கும் எளிய வழி', sourcePage: 24, section: 'புத்தி காலங்கள்' }
      );
    }

    results['marriage'] = {
      category: 'marriage',
      title: marTitle,
      status: marStatus,
      summary: marSummary,
      signals: marSignals,
      obstructions: marObstructions,
      timing: marTiming,
      matchedRules: matchedRules,
      reasoning: `நூலின் 21-35 பக்கங்களின்படி மங்களகாரகன் செவ்வாய் மீதான சனி/கேது சேர்க்கை பார்வைகள், 2/7-ஆம் பாவக தொடர்புகள் மற்றும் தசா-புத்தி கால வரிசை அடிப்படையில் திருமண பலன்கள் மற்றும் நிலை துல்லியமாக பகுப்பாய்வு செய்யப்பட்டது.`
    };
  }

  // ----------------------------------------------------------------------------------------
  // 6. CAREER & BUSINESS (தொழில், சொந்த வியாபாரம் & உத்தியோகம் - Pages 43-47, 50-53)
  // ----------------------------------------------------------------------------------------
  if (age >= 15) {
    const lord10Sign = (activeLagna + 9) % 12;
    const lord10Name = SIGN_LORDS[lord10Sign];
    const isGovtJob = (sun && mars && saturn && (
      sun.sign === lord10Sign ||
      checkPlanetaryAspect(saturn.sign, sun.sign, 'சனி') ||
      checkPlanetaryAspect(mars.sign, sun.sign, 'செவ்வாய்')
    ));

    let carSummary = '10-ஆம் அதிபதி மற்றும் தொழில் காரகன் சனியின் நற்பலன்களால் உத்தியோகத்தில் நிர்வாக மேன்மை மற்றும் நிலையான வருமானம் கிட்டும்.';
    let carSignals = [`10-ஆம் தொழில் ஸ்தானாதிபதி: ${lord10Name}`];

    if (isGovtJob) {
      carSummary = 'சூரியன் + செவ்வாய் அரசு கிரகங்களுடன் தொழில் காரகன் சனி தொடர்பு பெறுவதால் அரசுத் துறை அல்லது பொதுத்துறை நிறுவனங்களில் உயர் பதவி யோகம் உண்டு.';
      carSignals.push('மத்திய/மாநில அரசு வேலைக்குரிய கிரக சேர்க்கை பலம்');
    } else {
      carSignals.push('தனியார் துறை தலைமை நிர்வாகம் அல்லது சொந்த தொழில் மேன்மை');
    }

    if (age >= 60) {
      carSummary = 'தொழில் ஸ்தான பலத்தின்படி ஆலோசகர் பதவி, சொந்த தொழில் வழிநடத்துதல் மற்றும் அனுபவ ரீதியான கௌரவம் நிலைக்கும்.';
    }

    const carTiming = correlateTiming(dasaTimelines, ['சனி', 'சூரியன்', lord10Name, 'புதன்'], currentDasaLord, currentBhuktiLord);

    results['career'] = {
      category: 'career',
      title: 'தொழில், சொந்த வியாபாரம் & அரசு உத்தியோகம் (Career & Enterprise)',
      status: 'strong_indication',
      summary: `${carSummary} தொழில் ஏற்றம் மற்றும் சாதக காலகட்டம்: ${carTiming.window}.`,
      signals: carSignals,
      obstructions: [],
      timing: carTiming,
      matchedRules: [
        { ruleId: 'DS-CAR-001', title: 'யார் உத்தியோகத்திற்கு செல்வார்கள்? (6 vs 10-ஆம் அதிபதி)', sourcePage: 43, section: 'உத்தியோகம்' },
        { ruleId: 'DS-CAR-002', title: 'மத்திய & மாநில அரசு வேலை யாருக்கு?', sourcePage: 44, section: 'அரசு வேலை' },
        { ruleId: 'DS-CAR-004', title: 'சொந்தத் தொழில் & தந்தை வழித் தொழில்', sourcePage: 46, section: 'சொந்தத் தொழில்' }
      ],
      reasoning: `நூலின் 43-47 பக்கங்களின்படி லக்னாதிபதி பலம், 10-ஆம் அதிபதி மற்றும் தொழில் காரகன் சனி மீது விழும் சூரியன்/செவ்வாய் பார்வைகள் கொண்டு தொழில் துறை நிர்ணயிக்கப்பட்டுள்ளது.`
    };
  }

  // ----------------------------------------------------------------------------------------
  // 7. PROGENY & 15 GENDER RULES (குழந்தை பாக்கியம், பாலினம் & இரட்டை குழந்தை - Pages 36-48, 60)
  // ----------------------------------------------------------------------------------------
  if (age >= 18) {
    const lord5Sign = (activeLagna + 4) % 12;
    const lord5Name = SIGN_LORDS[lord5Sign];

    const isMaleSign5 = MALE_SIGNS.includes(lord5Sign);
    const isKetuWithGuru = jupiter && ketu && (jupiter.sign === ketu.sign || isTrine(jupiter.sign, ketu.sign));
    const isRahuWithGuru = jupiter && rahu && (jupiter.sign === rahu.sign || isTrine(jupiter.sign, rahu.sign));
    const isTwins = UBAYA_SIGNS.includes(activeLagna) && UBAYA_SIGNS.includes(lord5Sign);

    let genderPrediction = isMaleSign5 ? 'ஆண் குழந்தை யோகம் அதிகம் (5-ஆம் பாவக ஆண் ராசி விதி)' : 'பெண் குழந்தை யோகம் அதிகம் (5-ஆம் பாவக பெண் ராசி விதி)';
    if (isKetuWithGuru) genderPrediction = 'குருவுடன் கேது தொடர்பு இருப்பதால் முதல் குழந்தை ஆண் குழந்தையாக அமைய வாய்ப்பு';
    else if (isRahuWithGuru) genderPrediction = 'குருவுடன் ராகு தொடர்பு இருப்பதால் முதல் குழந்தை பெண் குழந்தையாக அமைய வாய்ப்பு';

    const progenyTiming = correlateTiming(dasaTimelines, ['குரு', lord5Name, 'சூரியன்'], currentDasaLord, currentBhuktiLord);

    const isSenior = age >= 55;
    results['children'] = {
      category: 'children',
      title: isSenior ? 'வம்சாவழி விருத்தி & பேரன்-பேத்தி யோகம் (Lineage & Prosperity)' : 'புத்திர பாக்கியம் & 15 பாலின விதிகள் (Progeny & Gender Rules)',
      status: 'strong_indication',
      summary: isSenior
        ? `புத்திரகாரகன் குரு மற்றும் 5-ஆம் அதிபதி ${lord5Name} நற்பலனால் வம்ச விருத்தியும், பிள்ளைகளின் நல்வாழ்வும், பேரன்-பேத்தி சுகமும் சிறக்கும்.`
        : `புத்திரகாரகன் குரு மற்றும் 5-ஆம் அதிபதி ${lord5Name} சுப பலம் பெற்றுள்ளனர். D.S.Astro 15 விதிகளின்படி: "${genderPrediction}".`,
      signals: [
        `புத்திர ஸ்தானம் (5-ஆம் வீடு): ${SIGN_NAMES_TAMIL[lord5Sign]} (${isMaleSign5 ? 'ஆண் ராசி' : 'பெண் ராசி'})`,
        `பாலின விதி முடிவு: ${genderPrediction}`,
        isTwins ? 'இரட்டை குழந்தை யோகம்: லக்னம் மற்றும் 5-ஆம் அதிபதி உபய ராசிகளில் (Gemini/Virgo/Sagittarius/Pisces) அமர்ந்துள்ளனர்' : 'சீரான புத்திர பாக்கிய வளர்ச்சி'
      ],
      obstructions: (saturn && jupiter && checkPlanetaryAspect(saturn.sign, jupiter.sign, 'சனி')) ? ['குரு மீது சனி பார்வை உள்ளதால் குழந்தை பாக்கியத்தில் சிறு தாமதம் ஏற்படலாம்; சுப வழிபாடுகள் நலம்'] : [],
      timing: progenyTiming,
      matchedRules: [
        { ruleId: 'DS-CHD-001', title: 'புத்திர தோஷம் & புத்திர சோகம் வேறுபாடு', sourcePage: 37, section: 'புத்திர பாக்கியம்' },
        { ruleId: 'DS-CHD-002', title: 'குழந்தைகள் ஆணா? பெண்ணா? 15 விதிகள்', sourcePage: 40, section: 'பாலின விதிகள்' },
        { ruleId: 'DS-CHD-003', title: 'இரட்டை குழந்தை யாருக்கு பிறக்கும்? (உபய ராசிகள்)', sourcePage: 60, section: 'இரட்டை குழந்தை' }
      ],
      reasoning: `நூலின் 36-42 மற்றும் 60-ஆம் பக்கங்களின்படி குருவின் சாரம், 5-ஆம் வீட்டு ஆண்/பெண் பண்பு மற்றும் ராகு-கேது நிழல் கிரகங்களின் கருப்பிரிப்பு ஆற்றல் கொண்டு துல்லியமாக கணிக்கப்பட்டது.`
    };
  }

  // ----------------------------------------------------------------------------------------
  // PARENTAL CARE & SIBLINGS (DS-PAR for young ages < 20)
  // ----------------------------------------------------------------------------------------
  if (age < 20) {
    const lord9Sign = (activeLagna + 8) % 12;
    const lord9Name = SIGN_LORDS[lord9Sign];
    const lord4Name = SIGN_LORDS[house4Sign];

    results['parents'] = {
      category: 'parents',
      title: 'பெற்றோர் நலம் & குழந்தை வளர்ப்பு (Parental Care & Upbringing)',
      status: 'favorable',
      summary: `தாய் ஸ்தானாதிபதி ${lord4Name} மற்றும் பிதுர்காரகன் சூரியன் பலத்தால் தாயன்பும் தந்தை வழி வழிகாட்டுதலும் நன்முறையில் கிட்டும். சிறுவயது கல்வி மற்றும் நற்பண்பு வளர்ச்சிக்கு பெற்றோரின் கவனம் துணைநிற்கும்.`,
      signals: [
        `தாய்/குடும்ப சுக ஸ்தானாதிபதி: ${lord4Name}`,
        `தந்தை/பாக்கிய ஸ்தானாதிபதி: ${lord9Name}`,
        'பெற்றோரின் ஆசியும் வழிகாட்டுதலும் கல்வி மேன்மைக்கு உதவும்'
      ],
      obstructions: [],
      timing: {
        dasa: currentDasaLord,
        bhukti: currentBhuktiLord,
        window: 'இளமைக் காலம் முழுவதும்'
      },
      matchedRules: [
        { ruleId: 'DS-PAR-001', title: 'தாய் & தந்தை வழி நற்பலன்கள் அறிதல்', sourcePage: 14, section: 'பெற்றோர் காரகம்' },
        { ruleId: 'DS-PAR-002', title: 'குழந்தை வளர்ப்பு & ஆரம்பக்கல்வி நல்வழி', sourcePage: 17, section: 'வளர்ப்பு முறை' }
      ],
      reasoning: `நூலின் 14 மற்றும் 17-ஆம் பக்கங்களின்படி இளம் வயதினருக்கு 4-ஆம் மற்றும் 9-ஆம் பாவகங்கள் வழியே பெற்றோர் சுகமும் கல்வி வழிகாட்டலும் நிர்ணயிக்கப்படுகின்றன.`
    };
  }

  // ----------------------------------------------------------------------------------------
  // 8. FINANCE & DEBT (தனம், கோடீஸ்வர யோகம் & கடன் நிவர்த்தி - Pages 47-49, 51)
  // ----------------------------------------------------------------------------------------
  if (age >= 15) {
    const lord2Sign = (activeLagna + 1) % 12;
    const lord11Sign = (activeLagna + 10) % 12;
    const isKoteeswara = isKendra(lord2Sign, lord11Sign) || isTrine(lord2Sign, lord11Sign);
    const isKetuIn6 = ketu && ketu.sign === house6Sign;

    const finTiming = correlateTiming(dasaTimelines, [SIGN_LORDS[lord2Sign], SIGN_LORDS[lord11Sign], 'குரு'], currentDasaLord, currentBhuktiLord);

    results['finance'] = {
      category: 'finance',
      title: 'தன ஸ்தானம், கோடீஸ்வர யோகம் & கடன் தீர்வு (Wealth & Finance)',
      status: isKetuIn6 ? 'caution' : 'strong_indication',
      summary: isKoteeswara
        ? `2, 11-ஆம் அதிபதிகள் தங்களுக்குள் கேந்திர-திரிகோண சுப தொடர்பு பெற்றுள்ளதால் பெரும் தன சேர்க்கை, கோடீஸ்வர யோகம் மற்றும் நிலையான சொத்துக்கள் அமையும்.`
        : `படிப்படியான பொருளாதார முன்னேற்றமும் உழைப்பிற்கேற்ற சேமிப்பும் உண்டாகும்.`,
      signals: [
        `தன ஸ்தானாதிபதி (2-ஆம் இடம்): ${SIGN_NAMES_TAMIL[lord2Sign]}`,
        `லாப ஸ்தானாதிபதி (11-ஆம் இடம்): ${SIGN_NAMES_TAMIL[lord11Sign]}`,
        isKetuIn6 ? '6-ல் கேது அமர்ந்துள்ளதால் கடன் விவகாரங்களில் கவனமும், ஜாமீன் போடுவதைத் தவிர்ப்பதும் அவசியம்' : 'பழைய பாக்கிகள் வசூலாகி கடன் சுமை படிப்படியாக குறையும்'
      ],
      obstructions: isKetuIn6 ? ['அநாவசிய கடன் வாங்குவதைத் தவிர்க்கவும்'] : [],
      timing: finTiming,
      matchedRules: [
        { ruleId: 'DS-FIN-001', title: 'பணக்கஷ்டம், பொருளாதார நெருக்கடி காரணங்கள்', sourcePage: 47, section: 'பொருளாதாரம்' },
        { ruleId: 'DS-FIN-002', title: 'யார் கோடீஸ்வரன்? (2, 11 அதிபதிகள் சேர்க்கை)', sourcePage: 48, section: 'கோடீஸ்வரன்' },
        { ruleId: 'DS-FIN-003', title: 'கடன் எப்போது தீரும்? (6-ஆம் அதிபதி & கேது)', sourcePage: 51, section: 'கடன் தீர்வு' }
      ],
      reasoning: `நூலின் 47-51 பக்கங்களின்படி 2 மற்றும் 11-ஆம் அதிபதிகள் 6, 8, 12-ல் மறையாமல் இருப்பதும், தசா லக்னத்திற்கு 6-ஆம் இடத்து கேதுவின் நிலையும் பொருளாதார பலத்தை நிர்ணயிக்கின்றன.`
    };
  }

  // ----------------------------------------------------------------------------------------
  // 9. PROPERTY & VEHICLES (சொந்த வீடு, மனை & சொகுசு வாகனம் - Pages 54-56)
  // ----------------------------------------------------------------------------------------
  if (age >= 15) {
    const lord4Sign = (activeLagna + 3) % 12;
    const isVenusRahuVehicle = venus && rahu && (venus.sign === rahu.sign || isTrine(venus.sign, rahu.sign));
    const isMoonStrongHouse = moon && [1, 3].includes(moon.sign); // Taurus (exalted), Cancer (own)

    const propTiming = correlateTiming(dasaTimelines, ['சந்திரன்', 'சுக்கிரன்', 'செவ்வாய்', SIGN_LORDS[lord4Sign]], currentDasaLord, currentBhuktiLord);

    results['property'] = {
      category: 'property',
      title: 'சொந்த வீடு கட்டும் யோகம் & சொகுசு வாகனம் (Property & Vehicle)',
      status: 'strong_indication',
      summary: `தாய் கிரகமான சந்திரன் மற்றும் சுக்கிரனின் பலத்தால் சொந்த வீடு கட்டும் மன அமைதி யோகமும், வாகனம் வாங்கும் நல்வாய்ப்பும் கைகூடும். யோக காலம்: ${propTiming.window}.`,
      signals: [
        `சுக/வீட்டு ஸ்தானம் (4-ஆம் இடம்): ${SIGN_NAMES_TAMIL[lord4Sign]}`,
        isMoonStrongHouse ? 'சந்திரன் உச்சம்/ஆட்சியில் உள்ளதால் அமைதியான சொந்த இல்லம் அமையும்' : 'சொந்த வீடு கட்டும் முயற்சி படிப்படியாக முழுமையடையும்',
        isVenusRahuVehicle ? 'சுக்கிரன் + ராகு தொடர்பால் புத்தம் புதிய நவீன சொகுசு வாகனம் யோகம் உண்டு' : 'குடும்பத் தேவைக்கான பயன்பாட்டு வாகனம் அமையும்'
      ],
      obstructions: [],
      timing: propTiming,
      matchedRules: [
        { ruleId: 'DS-PRP-001', title: 'சொந்த வீடு கட்டும் யோகம் எப்போது? (சந்திரன் காரகம்)', sourcePage: 54, section: 'சொந்த வீடு' },
        { ruleId: 'DS-VEH-001', title: 'வாகனம் வாங்கும் யோகம் (சுக்கிரன் + ராகு சேர்க்கை)', sourcePage: 55, section: 'வாகனம்' },
        { ruleId: 'DS-VEH-002', title: 'பழைய வாகனம் & பழுது ஏற்படும் கிரக நிலைகள்', sourcePage: 56, section: 'வாகன பழுது' }
      ],
      reasoning: `நூலின் 54-56 பக்கங்களின்படி சந்திரன் தாயின் கருவறை போன்ற நிம்மதியான வீட்டையும், சுக்கிரன் வீட்டின் பிரம்மாண்டத்தையும், சுக்கிரன்+ராகு புதிய சொகுசு வாகனத்தையும் குறிக்கின்றன.`
    };
  }

  // ----------------------------------------------------------------------------------------
  // 10. RAHU-KETU AXIS & PARIVARTHANAI (மிட்பாய்ண்ட் மையப்புள்ளி & பரிவர்த்தனை - Pages 28-29, 76-88)
  // ----------------------------------------------------------------------------------------
  // Check Midpoint hits (4th house to the right and left of Rahu-Ketu)
  const midpointSign1 = rahu ? (rahu.sign + 3) % 12 : 3;
  const midpointSign2 = ketu ? (ketu.sign + 3) % 12 : 9;
  const trappedPlanets = positions.filter(p => p.sign === midpointSign1 || p.sign === midpointSign2).map(p => p.name);

  // Check Parivarthanai (Mutual exchange)
  const exchanges: string[] = [];
  for (let i = 0; i < 12; i++) {
    const p1 = getP(SIGN_LORDS[i]);
    if (p1 && p1.sign !== i) {
      const targetLord = SIGN_LORDS[p1.sign];
      const p2 = getP(targetLord);
      if (p2 && p2.sign === i && !exchanges.includes(`${p1.name} ⮂ ${p2.name}`)) {
        exchanges.push(`${p1.name} ⮂ ${p2.name}`);
      }
    }
  }

  results['rahu-ketu'] = {
    category: 'rahu-ketu',
    title: 'ராகு-கேது கர்ம அச்சு & பரிவர்த்தனை ரகசியங்கள் (Karma & Exchanges)',
    status: trappedPlanets.length > 0 ? 'caution' : 'strong_indication',
    summary: trappedPlanets.length > 0
      ? `ராகு-கேது மையப்புள்ளி (Midpoint) கட்டங்களில் [${trappedPlanets.join(', ')}] கிரகங்கள் அமைந்துள்ளதால், அப்பொருட்களில் பெரும் வளர்ச்சியும், சம்பந்தப்பட்ட உயிர் உறவுகளில் பக்குவமான அணுகுமுறையும் தேவை.`
      : `ராகு பெருக்கும், கேது மோட்சப் பாதையை சுட்டிக்காட்டும் நற்பலன்களைத் தருகின்றனர்.`,
    signals: [
      `ராகு-கேது மையப்புள்ளி ராசிகள்: ${SIGN_NAMES_TAMIL[midpointSign1]} & ${SIGN_NAMES_TAMIL[midpointSign2]}`,
      trappedPlanets.length > 0 ? `மையப்புள்ளியில் உள்ள கிரகங்கள்: ${trappedPlanets.join(', ')}` : 'மையப்புள்ளி தோஷ பாதிப்புகள் இன்றி கிரகங்கள் சுதந்திரமாக இயங்குகின்றன',
      exchanges.length > 0 ? `பரிவர்த்தனை பெற்ற கிரகங்கள்: ${exchanges.join(', ')} (நூல் கருத்துப்படி ஆரம்பத்தில் ஏமாற்றமும் பின் யோகமும் உண்டாகும்)` : 'பரிவர்த்தனை சிக்கல்கள் ஏதுமில்லை'
    ],
    obstructions: trappedPlanets.length > 0 ? ['உயிர் காரகத்துவ உறவுகளில் விட்டுக் கொடுத்துச் செல்லவும்'] : [],
    timing: {
      dasa: currentDasaLord,
      bhukti: currentBhuktiLord,
      window: 'ஆயுள் முழுமைக்கும் உரிய கர்ம வழிகாட்டி'
    },
    matchedRules: [
      { ruleId: 'DS-RAK-001', title: 'ராகு பெருக்கும், கேது தடுக்கும் & தசாபுத்தி ரகசியங்கள்', sourcePage: 77, section: 'ராகு கேது' },
      { ruleId: 'DS-RAK-003', title: 'ராகு, கேது (மிட்பாய்ண்ட்) மையப் புள்ளிகள்', sourcePage: 87, section: 'மையப்புள்ளி' },
      { ruleId: 'DS-EXC-001', title: 'பரிவர்த்தனை யோகம் ஏமாற்றத்தை தரும் ரகசியம்', sourcePage: 28, section: 'பரிவர்த்தனை' }
    ],
    reasoning: `நூலின் 28-29 மற்றும் 76-88 பக்கங்களின்படி, பரிவர்த்தனை ஆரம்பத்தில் ஏமாற்றத்தையும், ராகு-கேது மிட்பாய்ண்ட் பொருள் வளர்ச்சியைத் தந்து உயிர் உறவுகளில் கர்ம சோதனைகளையும் தரும்.`
  };

  // ----------------------------------------------------------------------------------------
  // 11. INTIMACY & SECRET LIFE (அந்தரங்க ஜோதிட ரகசியங்கள் - Pages 97-124)
  // ----------------------------------------------------------------------------------------
  if (age >= 18 && age < 65) {
    const lord4Name = SIGN_LORDS[house4Sign];
    const lord8Name = SIGN_LORDS[house8Sign];

    // Extra-marital affair combination (Pages 34-35, 41, 107): 4, 8, 12 lords + Moon/Venus/Mercury during Dasa without Mars moral protection
    const isAffairTrigger = (moon && venus && mercury && (
      [house4Sign, house8Sign, house12Sign].includes(moon.sign) ||
      [house4Sign, house8Sign, house12Sign].includes(venus.sign) ||
      [house4Sign, house8Sign, house12Sign].includes(mercury.sign)
    ) && (!mars || !checkPlanetaryAspect(mars.sign, venus.sign, 'செவ்வாய்')));

    // Prostitution yoga / Boundary violation (Page 30-31, 117): Mercury + Ketu in Venus star/house or Moon house
    const isProstitutionYoga = mercury && ketu && (
      mercury.sign === ketu.sign ||
      (mercury.sign === 1 || mercury.sign === 6 || mercury.sign === 3) // Taurus, Libra, Cancer
    ) && (moon && venus && isTrine(mercury.sign, venus.sign));

    // Same-sex intimacy combinations explicitly from Book Pages 120-121:
    // Male Homo-sex (Page 120): Venus, Moon, Mercury in Male signs with Male stars + Saturn/Ketu contact in male chart
    const isHomoInMale = isMale && venus && moon && mercury &&
      MALE_SIGNS.includes(venus.sign) && MALE_SIGNS.includes(moon.sign) && MALE_SIGNS.includes(mercury.sign) &&
      ((saturn && isTrine(venus.sign, saturn.sign)) || (ketu && isTrine(venus.sign, ketu.sign)));

    // Female Lesbian-sex (Page 121): Venus, Moon, Mercury in Female signs with Female stars + Saturn/Rahu contact in female chart
    const isLesbianInFemale = isFemale && venus && moon && mercury &&
      FEMALE_SIGNS.includes(venus.sign) && FEMALE_SIGNS.includes(moon.sign) && FEMALE_SIGNS.includes(mercury.sign) &&
      ((saturn && isTrine(venus.sign, saturn.sign)) || (rahu && isTrine(venus.sign, rahu.sign)));

    // Strict Loyalty by Mars (Pages 35, 108): Mars aspecting Venus or Lagna enforces strict loyalty to spouse
    const isStrictLoyalty = mars && venus && (checkPlanetaryAspect(mars.sign, venus.sign, 'செவ்வாய்') || mars.sign === venus.sign);

    // Venus + Mars Bed-Life Dynamics (Page 123)
    const isVenusMarsConjunction = venus && mars && (venus.sign === mars.sign || isTrine(venus.sign, mars.sign));

    let intimacySummary = 'சுக்கிரன் மற்றும் 12-ஆம் பாவக அயன சயன சுப பலத்தால் இல்லற தாம்பத்திய சுகமும் நேர்மையான வாழ்க்கை நெறியும் அமையும்.';
    let intimacySignals = ['தாம்பத்திய சுக காரகன் சுக்கிரன் சுப பலம்'];

    if (isStrictLoyalty) {
      intimacySummary = 'மங்களகாரகன் செவ்வாய் சுக்கிரனுடன் நல் தொடர்பு கொண்டுள்ளதால், திருமணத்திற்குப் பின் தனது துணையிடம் மட்டுமே உண்மையான அன்பு, ஒழுக்கம் மற்றும் கற்பு நெறி காக்கும் உன்னத ஜாதகம்.';
      intimacySignals.push('செவ்வாயின் ஒழுக்கக் கட்டுப்பாடு: திருமணத்திற்குப் பின் வாழ்க்கைத் துணையிடம் மட்டுமே தாம்பத்திய ஈடுபாடு (கற்பு நெறி பலம்)');
    } else if (isAffairTrigger) {
      intimacySummary = '4, 8, 12 மறைவு ஸ்தானங்களுடன் சந்திரன், புதன், சுக்கிரன் தொடர்பு பெறுவதால் அந்தரங்க ஈர்ப்புகளில் எல்லை மீறாமல் மனக்கட்டுப்பாடு மற்றும் விவேகம் தேவை.';
      intimacySignals.push('அந்தரங்க விழிப்புணர்வு: சபல புத்தி மற்றும் எல்லை மீறிய ஈர்ப்புகளை தவிர்க்க மனக்கட்டுப்பாடு அவசியம்');
    }

    // Gender-specific bed-life nuances from Page 123
    if (isVenusMarsConjunction) {
      if (isMale) {
        intimacySignals.push('ஆண்கள் தாம்பத்திய யோகம் (பக்கம் 123): சுக்கிரன் + செவ்வாய் சேர்க்கையால் மனைவியை மகிழ்விக்கும் வீரியமும் பாசமும் கொண்டவர்');
      } else {
        intimacySignals.push('பெண்கள் தாம்பத்திய யோகம் (பக்கம் 123): சுக்கிரன் + செவ்வாய் தொடர்பால் கணவரிடம் கூச்சமின்றி தாம்பத்திய சுகத்தில் முழுமை காணும் நிலை');
      }
    }

    if (isHomoInMale) {
      intimacySignals.push('நூல் பக்கம் 120 விதி: சுக்கிரன், சந்திரன், புதன் ஆண் ராசிகளில் சனி/கேது தொடர்பால் மாறுபட்ட அந்தரங்க நட்பு ஈர்ப்பு');
    } else if (isLesbianInFemale) {
      intimacySignals.push('நூல் பக்கம் 121 விதி: சுக்கிரன், சந்திரன், புதன் பெண் ராசிகளில் சனி/ராகு தொடர்பால் தோழிகள் மீதான அதீத அந்தரங்க பந்தம்');
    }

    const intimacyTiming = correlateTiming(
      dasaTimelines,
      ['சுக்கிரன்', 'செவ்வாய்', SIGN_LORDS[house12Sign], 'ராகு'],
      currentDasaLord,
      currentBhuktiLord
    );

    results['intimacy'] = {
      category: 'intimacy',
      title: 'அந்தரங்க ஜோதிட ரகசியங்கள் & தாம்பத்திய ஒழுக்கம் (Intimacy & Secrets)',
      status: isStrictLoyalty ? 'favorable' : isAffairTrigger ? 'caution' : 'strong_indication',
      summary: intimacySummary,
      signals: intimacySignals,
      obstructions: isAffairTrigger ? ['தவறான நட்புகள் மற்றும் எல்லை மீறிய விவகாரங்களைத் தவிர்க்கவும்'] : [],
      timing: intimacyTiming,
      matchedRules: [
        { ruleId: 'DS-INT-001', title: 'எல்லை மீறிய செயல்கள் & அந்தரங்க ரகசியங்கள்', sourcePage: 97, section: 'அந்தரங்க ரகசியங்கள்' },
        { ruleId: 'DS-INT-002', title: 'கள்ளத்தொடர்பு காரண கிரகங்கள் (சந்திரன், சுக்கிரன், புதன்)', sourcePage: 35, section: 'கள்ளத்தொடர்பு' },
        { ruleId: 'DS-INT-003', title: 'விபச்சார யோகம் & மாற்று ஈர்ப்பு ரகசியங்கள்', sourcePage: 30, section: 'விபச்சார யோகம்' },
        { ruleId: 'DS-INT-004', title: 'செவ்வாய் தரும் ஒழுக்கமும் கற்பு நெறியும்', sourcePage: 35, section: 'ஒழுக்க நெறி' },
        { ruleId: 'DS-INT-005', title: 'சுக்கிரனுடன் தொடர்பு வரும் கிரகங்கள் & தாம்பத்திய சுகம்', sourcePage: 122, section: 'தாம்பத்திய சுகம்' }
      ],
      reasoning: `நூலின் 97-124 பக்கங்களில் மிக விளக்கமாக கூறப்பட்டுள்ள 12 பாவக அந்தரங்க ரகசியங்கள், பாலின வேறுபாடு (${isFemale ? 'பெண்' : 'ஆண்'}), சுக்கிரன்-செவ்வாய் சேர்க்கை ஒழுக்கம் மற்றும் சந்திரன்-புதன்-சுக்கிரன் மறைவு நிலைகள் அடிப்படையில் தொகுக்கப்பட்டது.`
    };
  }

  return results;
}
