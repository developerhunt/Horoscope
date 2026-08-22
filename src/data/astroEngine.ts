import {
  HoroscopeData,
  CurrentDasaBhuktiInfo
} from '../types';

// ==========================================
// 1. CONSTANTS & METADATA
// ==========================================

export const NAKSHATRAS = [
  'அஸ்வினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிஷம்', 'திருவாதிரை',
  'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்',
  'அஸ்தம்', 'சித்திரை', 'சுவாதி', 'விசாகம்', 'அனுஷம்', 'கேட்டை',
  'மூலம்', 'பூராடம்', 'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்',
  'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி'
];

export const RASI_NAMES_TAMIL = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்',
  'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்',
  'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'
];

export const RASI_NAMES_ENGLISH = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const SIGN_LORDS = [
  'செவ்வாய்',   // 0: Mesham
  'சுக்கிரன்',  // 1: Rishabham
  'புதன்',      // 2: Mithunam
  'சந்திரன்',    // 3: Katakam
  'சூரியன்',    // 4: Simham
  'புதன்',      // 5: Kanni
  'சுக்கிரன்',  // 6: Thulam
  'செவ்வாய்',   // 7: Viruchigam
  'குரு',       // 8: Dhanusu
  'சனி',        // 9: Makaram
  'சனி',        // 10: Kumbam
  'குரு'        // 11: Meenam
];

export interface PlanetPosition {
  name: string;
  sign: number;
  degree: number;
  rawLon: number;
}

export const DASA_LORDS_ORDER = [
  { name: 'கேது', english: 'Ketu', years: 7, abbr: 'கேது' },
  { name: 'சுக்கிரன்', english: 'Venus', years: 20, abbr: 'சுக்' },
  { name: 'சூரியன்', english: 'Sun', years: 6, abbr: 'சூரி' },
  { name: 'சந்திரன்', english: 'Moon', years: 10, abbr: 'சந்' },
  { name: 'செவ்வாய்', english: 'Mars', years: 7, abbr: 'செவ்' },
  { name: 'ராகு', english: 'Rahu', years: 18, abbr: 'ராகு' },
  { name: 'குரு', english: 'Jupiter', years: 16, abbr: 'குரு' },
  { name: 'சனி', english: 'Saturn', years: 19, abbr: 'சனி' },
  { name: 'புதன்', english: 'Mercury', years: 17, abbr: 'புதன்' }
];

// ==========================================
// 2. D.S. ASTRO SYSTEM RULES ENGINE
// ==========================================

export function generateDSSystemPredictions(
  positions: PlanetPosition[],
  dasaInfo: CurrentDasaBhuktiInfo | { dasaLord: string },
  lagnaRasiIndex: number
): string[] {
  const predictions: string[] = [];

  const getPlanet = (nameOrPart: string) =>
    positions.find(p => p.name === nameOrPart || p.name.includes(nameOrPart));

  const isConjunct = (p1?: { sign: number }, p2?: { sign: number }) =>
    p1 !== undefined && p2 !== undefined && p1.sign === p2.sign;

  // ----------------------------------------------------
  // 1. THE DASA LAGNA SHIFT (தசாநாதன் லக்னம்) - THE CORE
  // ----------------------------------------------------
  const currentDasaLord = dasaInfo.dasaLord || 'குரு';
  const dasaLordObj = getPlanet(currentDasaLord);
  const dasaLagnaIndex = dasaLordObj ? dasaLordObj.sign : 0;

  const ketuObj = getPlanet('கேது');
  const saturnObj = getPlanet('சனி');
  const marsObj = getPlanet('செவ்வாய்');
  const rahuObj = getPlanet('ராகு');
  const mercuryObj = getPlanet('புதன்');
  const sunObj = getPlanet('சூரியன்');
  const moonObj = getPlanet('சந்திரன்');
  const jupiterObj = getPlanet('குரு');

  // ----------------------------------------------------
  // 2. RULE: DEBT & DISEASE (கடன், நோய் - 6th House from Dasa Lagna)
  // ----------------------------------------------------
  const house6FromDasaLagna = (dasaLagnaIndex + 5) % 12;

  if (ketuObj && ketuObj.sign === house6FromDasaLagna) {
    predictions.push(
      "கடன் / எதிரி: நடப்பு தசாநாதனுக்கு 6-ஆம் இடத்தில் கேது உள்ளதால், இக்காலகட்டத்தில் தேவையற்ற விரையங்கள், கடன் சுமைகள் அல்லது எதிரிகளால் தொல்லை ஏற்படலாம்."
    );
  }

  if (saturnObj && saturnObj.sign === house6FromDasaLagna) {
    predictions.push(
      "நோய் / உடல்நலம்: நடப்பு தசாநாதனுக்கு 6-ஆம் இடத்தில் சனி உள்ளதால், இக்காலகட்டத்தில் உடல் நலக்குறைபாடுகள் அல்லது மருத்துவ செலவுகள் ஏற்பட வாய்ப்புள்ளது."
    );
  }

  // ----------------------------------------------------
  // 3. RULE: DANGER & ACCIDENTS (கண்டம் & அவமானம் - 8th House from Dasa Lagna)
  // ----------------------------------------------------
  const house8FromDasaLagna = (dasaLagnaIndex + 7) % 12;
  const isMarsIn8 = marsObj?.sign === house8FromDasaLagna;
  const isRahuIn8 = rahuObj?.sign === house8FromDasaLagna;

  if (isMarsIn8 || isRahuIn8) {
    predictions.push(
      "எச்சரிக்கை (8-ஆம் பாவகம்): நடப்பு தசாநாதனுக்கு 8-ஆம் இடத்தில் பாப கிரகங்கள் (செவ்வாய்/ராகு) உள்ளதால், வாகனப் பயணங்களில் மிகுந்த கவனம் தேவை. எதிர்பாராத அவமானங்கள் அல்லது விபத்துகளை தவிர்க்க விழிப்புணர்வு அவசியம்."
    );
  }

  // ----------------------------------------------------
  // 4. RULE: FOREIGN TRAVEL / JOB (வெளிநாட்டு வேலை - Dispositor in 3, 6, 8, 12)
  // ----------------------------------------------------
  const dasaLordDispositorName = SIGN_LORDS[dasaLagnaIndex];
  const dasaLordDispositorObj = getPlanet(dasaLordDispositorName);

  if (dasaLordDispositorObj) {
    const houseFromDasaLagna = (dasaLordDispositorObj.sign - dasaLagnaIndex + 12) % 12 + 1;
    if ([3, 6, 8, 12].includes(houseFromDasaLagna)) {
      predictions.push(
        "இடமாற்றம் / வெளிநாடு: நடப்பு தசாநாதனுக்கு வீடு கொடுத்த கிரகம் மறைவு ஸ்தானங்களில் (3, 6, 8, 12) உள்ளதால், இக்காலகட்டத்தில் சொந்த ஊரை விட்டு வெளியூர் அல்லது வெளிநாடு சென்று பணிபுரியும் யோகம் உண்டு."
      );
    }
  }

  // ----------------------------------------------------
  // 5. RULE: EDUCATION (கல்வி & புதன் - Sun + Mercury Conjunct)
  // ----------------------------------------------------
  if (isConjunct(mercuryObj, sunObj)) {
    predictions.push(
      "கல்வி யோகம்: வித்யாகாரகன் புதன், சூரியனுடன் இணைந்துள்ளதால் கல்வியில் நல்ல தேர்ச்சியும், புத்திசாலித்தனமும் உண்டு."
    );
  }

  // ----------------------------------------------------
  // 6. RULE: PROGENY / CHILDBIRTH (புத்திர பாக்கியம், பாலினம், இரட்டை, தத்து)
  // ----------------------------------------------------
  const isJupiterAfflicted =
    isConjunct(jupiterObj, saturnObj) ||
    isConjunct(jupiterObj, rahuObj) ||
    isConjunct(jupiterObj, ketuObj);

  if (isJupiterAfflicted) {
    predictions.push(
      "புத்திர தாமதம்: புத்திர காரகன் குரு பகவான், பாப கிரகங்களின் (சனி/ராகு/கேது) சேர்க்கை பெற்றுள்ளதால், குழந்தை பாக்கியம் சற்று தாமதமாக வாய்ப்புள்ளது அல்லது மருத்துவ ஆலோசனை தேவைப்படலாம்."
    );
  }

  // Child Gender (ஆண் / பெண் குழந்தை யோகம்)
  if (isConjunct(jupiterObj, ketuObj)) {
    predictions.push(
      "ஆண் குழந்தை யோகம்: புத்திர காரகன் குருவுடன் கேது பகவான் சேர்ந்துள்ளதால், ஆண் குழந்தை பிறக்க அதிக வாய்ப்புகள் உள்ளன."
    );
  }

  if (isConjunct(jupiterObj, rahuObj)) {
    predictions.push(
      "பெண் குழந்தை யோகம்: புத்திர காரகன் குருவுடன் ராகு பகவான் சேர்ந்துள்ளதால், பெண் குழந்தை பிறக்க அதிக வாய்ப்புகள் உள்ளன."
    );
  }

  // Twins (இரட்டை குழந்தை யோகம் - லக்னம் & 5-ஆம் அதிபதி உபய ராசிகளில்)
  const ubayaRasis = [2, 5, 8, 11]; // Gemini(2), Virgo(5), Sagittarius(8), Pisces(11)
  const lord5Sign = (lagnaRasiIndex + 4) % 12;
  const lord5PlanetName = SIGN_LORDS[lord5Sign];
  const lord5PlanetObj = getPlanet(lord5PlanetName);

  if (
    ubayaRasis.includes(lagnaRasiIndex) &&
    lord5PlanetObj !== undefined &&
    ubayaRasis.includes(lord5PlanetObj.sign)
  ) {
    predictions.push(
      "இரட்டை குழந்தை யோகம்: லக்னம் மற்றும் 5-ஆம் அதிபதி உபய ராசிகளில் (இரட்டை தன்மை கொண்ட ராசிகள்) உள்ளதால், இரட்டை குழந்தை பிறக்க வாய்ப்புள்ளது."
    );
  }

  // Adoption (தத்து புத்திர யோகம் - 9, 10-ஆம் அதிபதிகள் சேர்க்கை)
  const lord9PlanetName = SIGN_LORDS[(lagnaRasiIndex + 8) % 12];
  const lord10PlanetName = SIGN_LORDS[(lagnaRasiIndex + 9) % 12];
  const lord9PlanetObj = getPlanet(lord9PlanetName);
  const lord10PlanetObj = getPlanet(lord10PlanetName);

  if (isConjunct(lord9PlanetObj, lord10PlanetObj)) {
    predictions.push(
      "தத்து புத்திர யோகம்: 9, 10-ஆம் அதிபதிகள் (தர்ம கர்மாதிபதிகள்) இணைந்துள்ளதால், வாழ்க்கையில் தத்துப்பிள்ளை எடுக்கும் அமைப்பு அல்லது சுவீகாரம் செய்யும் யோகம் உண்டு."
    );
  }

  // ----------------------------------------------------
  // 6b. RULE: CAREER - OWN BUSINESS VS JOB (சொந்தத் தொழில் யோகம்)
  // ----------------------------------------------------
  const OWN_HOUSES_MAP: Record<string, number[]> = {
    'சூரியன்': [4],
    'சந்திரன்': [3],
    'செவ்வாய்': [0, 7],
    'புதன்': [2, 5],
    'குரு': [8, 11],
    'சுக்கிரன்': [1, 6],
    'சனி': [9, 10]
  };

  const EXALTED_HOUSES_MAP: Record<string, number> = {
    'சூரியன்': 0,
    'சந்திரன்': 1,
    'செவ்வாய்': 9,
    'புதன்': 5,
    'குரு': 3,
    'சுக்கிரன்': 11,
    'சனி': 6
  };

  if (lord10PlanetObj) {
    const isOwnHouse = OWN_HOUSES_MAP[lord10PlanetName]?.includes(lord10PlanetObj.sign);
    const isExaltedHouse = EXALTED_HOUSES_MAP[lord10PlanetName] === lord10PlanetObj.sign;

    if (isOwnHouse || isExaltedHouse) {
      predictions.push(
        "சொந்தத் தொழில் யோகம்: 10-ஆம் அதிபதி பலமாக ஆட்சி அல்லது உச்சம் பெற்றுள்ளதால், பிற்காலத்தில் சொந்த தொழில் செய்து வாழ்க்கையிலும் பொருளாதாரத்திலும் பெரிய வெற்றி பெறுவீர்கள்."
      );
    }
  }

  // ----------------------------------------------------
  // 7. RULE: RAHU-KETU MIDPOINT (ராகு-கேது மையப் புள்ளி)
  // ----------------------------------------------------
  if (rahuObj && ketuObj) {
    const rahuDeg = rahuObj.rawLon;
    const ketuDeg = ketuObj.rawLon;
    const midpoint1 = (rahuDeg + ((ketuDeg - rahuDeg + 360) % 360) / 2) % 360;
    const midpoint2 = (midpoint1 + 180) % 360;

    const angularDist = (degA: number, degB: number) => {
      const diff = Math.abs(degA - degB) % 360;
      return diff > 180 ? 360 - diff : diff;
    };

    if (sunObj) {
      const minSunDist = Math.min(angularDist(sunObj.rawLon, midpoint1), angularDist(sunObj.rawLon, midpoint2));
      if (minSunDist <= 3.0) {
        predictions.push(
          "மையப்புள்ளி விதி: பித்ருகாரகன் சூரிய பகவான் ராகு-கேது மையப்புள்ளியில் சிக்கியுள்ளதால், தந்தையின் உடல்நலத்தில் அல்லது தந்தை வழி உறவுகளில் மிகுந்த கவனம் தேவை."
        );
      }
    }

    if (moonObj) {
      const minMoonDist = Math.min(angularDist(moonObj.rawLon, midpoint1), angularDist(moonObj.rawLon, midpoint2));
      if (minMoonDist <= 3.0) {
        predictions.push(
          "மையப்புள்ளி விதி: மாத்ருகாரகன் சந்திரன் ராகு-கேது மையப்புள்ளியில் சிக்கியுள்ளதால், தாயாரின் உடல்நலத்திலும், மன அமைதியிலும் கவனம் தேவை."
        );
      }
    }
  }

  // ----------------------------------------------------
  // 8. RULE: PARIVARTHANAI (பரிவர்த்தனை ஏமாற்றம்)
  // ----------------------------------------------------
  const classicalPlanets = ['சூரியன்', 'சந்திரன்', 'செவ்வாய்', 'புதன்', 'குரு', 'சுக்கிரன்', 'சனி'];
  let hasParivarthanai = false;

  for (let i = 0; i < classicalPlanets.length; i++) {
    for (let j = i + 1; j < classicalPlanets.length; j++) {
      const p1Name = classicalPlanets[i];
      const p2Name = classicalPlanets[j];

      const p1Obj = getPlanet(p1Name);
      const p2Obj = getPlanet(p2Name);

      if (p1Obj && p2Obj && p1Obj.sign !== p2Obj.sign) {
        const lordOfP1Sign = SIGN_LORDS[p1Obj.sign];
        const lordOfP2Sign = SIGN_LORDS[p2Obj.sign];

        if (lordOfP1Sign === p2Name && lordOfP2Sign === p1Name) {
          hasParivarthanai = true;
          break;
        }
      }
    }
    if (hasParivarthanai) break;
  }

  if (hasParivarthanai) {
    predictions.push(
      "பரிவர்த்தனை ஏமாற்றம்: ஜாதகத்தில் கிரக பரிவர்த்தனை உள்ளதால், ஆரம்பத்தில் ஒரு செயலில் அதிக எதிர்பார்ப்பை தூண்டி, இறுதியில் ஏமாற்றத்தை தரக்கூடும். எந்தவொரு முக்கிய முடிவுகளையும் தகுந்த ஆலோசனைக்குப் பிறகே எடுக்கவும்."
    );
  }

  // ----------------------------------------------------
  // 9. RULE: MARRIAGE (திருமண தாமதம் & காதல்/நிச்சயதார்த்தம்)
  // ----------------------------------------------------
  if (marsObj && saturnObj) {
    const diffSaturnFromMars = (saturnObj.sign - marsObj.sign + 12) % 12;
    // 1st (diff 0), 4th (diff 3), 7th (diff 6), 8th (diff 7)
    const saturnAspectHits = [0, 3, 6, 7].includes(diffSaturnFromMars);

    let ketuIn12thFromMars = false;
    if (ketuObj) {
      const diffKetuFromMars = (ketuObj.sign - marsObj.sign + 12) % 12;
      ketuIn12thFromMars = (diffKetuFromMars === 11);
    }

    if (saturnAspectHits || ketuIn12thFromMars) {
      predictions.push(
        "திருமண தாமதம்: களத்திர காரகன் செவ்வாய் பகவானை சனி அல்லது கேது தொடர்பு கொள்வதால், திருமணம் சற்று தாமதமாக நடைபெறும் அமைப்பைக் காட்டுகிறது."
      );
    }
  }

  const lord2Name = SIGN_LORDS[(lagnaRasiIndex + 1) % 12];
  const lord5Name = SIGN_LORDS[(lagnaRasiIndex + 4) % 12];
  const lord7Name = SIGN_LORDS[(lagnaRasiIndex + 6) % 12];
  const lord11Name = SIGN_LORDS[(lagnaRasiIndex + 10) % 12];

  const lord2Obj = getPlanet(lord2Name);
  const lord5Obj = getPlanet(lord5Name);
  const lord7Obj = getPlanet(lord7Name);
  const lord11Obj = getPlanet(lord11Name);

  // 2nd or 7th lord conjunct 5th or 11th lord
  const is2or7With5or11 =
    isConjunct(lord2Obj, lord5Obj) ||
    isConjunct(lord2Obj, lord11Obj) ||
    isConjunct(lord7Obj, lord5Obj) ||
    isConjunct(lord7Obj, lord11Obj);

  // Mercury conjunct with 2nd, 7th, 5th, or 11th lord
  const isMercuryWithAny =
    isConjunct(mercuryObj, lord2Obj) ||
    isConjunct(mercuryObj, lord7Obj) ||
    isConjunct(mercuryObj, lord5Obj) ||
    isConjunct(mercuryObj, lord11Obj);

  const loveMatched = is2or7With5or11 || isMercuryWithAny;
  const isKetuWithMercury = isConjunct(ketuObj, mercuryObj);

  if (loveMatched && !isKetuWithMercury) {
    predictions.push(
      "காதல் திருமணம்: 2, 7-ஆம் அதிபதிகளுடன் 5, 11-ஆம் அதிபதிகள் மற்றும் காதல் கிரகமான புதன் தொடர்பில் உள்ளதால், காதல் திருமணம் நடைபெறும் யோகம் உண்டு."
    );
  } else if (loveMatched && isKetuWithMercury) {
    predictions.push(
      "காதல் தோல்வி / நிச்சயித்த திருமணம்: காதல் கிரகமான புதனுடன் கேது தொடர்பில் உள்ளதால், காதல் வயப்பட்டாலும் அது கைகூடாமல் ஏமாற்றத்தில் முடிய வாய்ப்புள்ளது. எனவே பெரியோர்கள் நிச்சயித்த திருமணமே நன்மையைத் தரும்."
    );
  } else {
    predictions.push(
      "திருமண அமைப்பு: கிரக நிலைகளின்படி, பெரியோர்கள் பார்த்து நிச்சயிக்கும் திருமணமே (Arranged Marriage) உங்களுக்கு சிறப்பான, சுமுகமான வாழ்க்கையைத் தரும்."
    );
  }

  return predictions;
}

// ==========================================
// 3. ENRICHMENT HELPER FOR BACKEND DATA
// ==========================================

export function enrichBackendDataWithPredictions(backendData: any): HoroscopeData {
  // Extract or adapt positions from backend payload (supporting positions, planetaryDegrees, or charts)
  let positions: PlanetPosition[] = [];

  if (Array.isArray(backendData.positions)) {
    positions = backendData.positions;
  } else if (Array.isArray(backendData.planetaryDegrees)) {
    positions = backendData.planetaryDegrees.map((pd: any) => {
      const rawLon = typeof pd.rawLongitude === 'number' ? pd.rawLongitude : 0;
      const sign = Math.floor(rawLon / 30);
      const degree = rawLon % 30;
      return {
        name: pd.planet,
        sign,
        degree,
        rawLon
      };
    });
  } else if (Array.isArray(backendData.rasiChart)) {
    backendData.rasiChart.forEach((box: any) => {
      if (Array.isArray(box.planets)) {
        box.planets.forEach((pName: string) => {
          positions.push({
            name: pName,
            sign: box.id,
            degree: 15,
            rawLon: box.id * 30 + 15
          });
        });
      }
    });
  }

  // Determine Dasa info
  const dasaInfo = backendData.currentDasaBhukti || backendData.dasaInfo || { dasaLord: 'குரு' };

  // Determine Lagna Rasi Index
  let lagnaRasiIndex = 0;
  if (typeof backendData.lagnaRasiIndex === 'number') {
    lagnaRasiIndex = backendData.lagnaRasiIndex;
  } else if (backendData.basicDetails?.lagna) {
    const lagnaStr = backendData.basicDetails.lagna;
    const matchIdx = RASI_NAMES_TAMIL.findIndex(r => lagnaStr.includes(r));
    if (matchIdx !== -1) {
      lagnaRasiIndex = matchIdx;
    }
  } else if (Array.isArray(backendData.rasiChart)) {
    const lagnaBox = backendData.rasiChart.find((box: any) => box.isLagna || box.planets?.includes('லக்னம்') || box.planets?.includes('லக்'));
    if (lagnaBox) {
      lagnaRasiIndex = lagnaBox.id;
    }
  }

  // Generate D.S. System Special Predictions
  const specialInsights = generateDSSystemPredictions(positions, dasaInfo, lagnaRasiIndex);

  return {
    ...backendData,
    specialPredictions: specialInsights
  };
}
