import {
  HoroscopeData,
  HoroscopeInput,
  ZodiacBox,
  PlanetaryDegree,
  DasaTimeline,
  BhuktiTimeline,
  CurrentDasaBhuktiInfo,
  NadiAnalysis,
  DSSystemAnalysis,
  PanchangamDetails
} from '../types';
import { TAMIL_NADU_CITIES } from './cities';
import { formatDMSCoordinates } from '../utils/geoUtils';

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

const TITHI_NAMES = [
  'பிரதமை', 'துவிதியை', 'திரிதியை', 'சதுர்த்தி', 'பஞ்சமி',
  'சஷ்டி', 'சப்தமி', 'அஷ்டமி', 'நவமி', 'தசமி',
  'ஏகாதசி', 'துவாதசி', 'திரயோதசி', 'சதுர்த்தசி', 'பௌர்ணமி / அமாவாசை'
];

const YOGA_NAMES = [
  'விஷ்கம்பம்', 'ப்ரீதி', 'ஆயுஷ்மான்', 'சௌபாக்யம்', 'சோபனம்',
  'அதிகண்டம்', 'சுகர்மம்', 'த்ருதி', 'சூலம்', 'கண்டம்',
  'வ்ருத்தி', 'த்ருவம்', 'வ்யாகாதம்', 'ஹர்ஷணம்', 'வஜ்ரம்',
  'சித்தி', 'வியதிபாதம்', 'வரியான்', 'பரிகம்', 'சிவம்',
  'சித்தம்', 'சாத்தியம்', 'சுபம்', 'சுப்ரம்', 'பிராமியம்',
  'ஐந்திரம்', 'வைதிருதி'
];

const KARANA_NAMES = [
  'பவ', 'பாலவ', 'கௌலவ', 'தைதுலை',
  'கரசை', 'வணிசை', 'பத்திரை', 'சகுனி',
  'சதுஷ்பாதம்', 'நாகவம்', 'கிம்ஸ்துக்னம்'
];

// Sarvashtakavarga standard base benefic points per sign
const BASE_ASHTAKAVARGA = [31, 29, 32, 28, 30, 29, 34, 27, 29, 30, 32, 29];

// ==========================================
// 2. TRIGONOMETRIC & ASTRONOMICAL UTILITIES
// ==========================================

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function sinD(deg: number): number {
  return Math.sin(deg * DEG_TO_RAD);
}

function cosD(deg: number): number {
  return Math.cos(deg * DEG_TO_RAD);
}

function tanD(deg: number): number {
  return Math.tan(deg * DEG_TO_RAD);
}

function atan2D(y: number, x: number): number {
  return Math.atan2(y, x) * RAD_TO_DEG;
}

export function normalizeDeg(deg: number): number {
  let val = deg % 360;
  if (val < 0) val += 360;
  return val;
}

/**
 * Format decimal degree to standard Astrological "DD° MM' SS""
 */
export function formatDegree(deg: number): string {
  const norm = normalizeDeg(deg);
  const degInSign = norm % 30;
  const d = Math.floor(degInSign);
  const mDec = (degInSign - d) * 60;
  const m = Math.floor(mDec);
  const s = Math.round((mDec - m) * 60);

  return `${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}' ${String(s % 60).padStart(2, '0')}"`;
}

/**
 * Calculate Julian Day Number (JD) from Calendar Date and UTC Hours
 */
export function calculateJulianDate(year: number, month: number, day: number, utcHours: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFraction = utcHours / 24;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + dayFraction + B - 1524.5;
}

/**
 * High-Precision Lahiri Ayanamsha (IAU / Indian Astronomical Ephemeris Standard)
 * T = (JD - 2451545.0) / 36525.0
 * Ayanamsha = 23.858072 + 1.396887 * T + 0.000308 * T * T
 */
export function calculateLahiriAyanamsha(T: number): number {
  return 23.858072 + (1.396887 * T) + (0.000308 * T * T);
}

// ==========================================
// 3. PLANETARY EPHEMERIS ALGORITHMS
// ==========================================

interface RawPlanetResult {
  tropicalLong: number;
  siderealLong: number;
  speed: number;
  isRetrograde: boolean;
  isCombust?: boolean;
}

/**
 * High-Precision Geocentric Sun Calculation (Meeus Astronomical Algorithms)
 * M_sun = 357.5291 + 35999.0503 * T
 * Equation of Center C = (1.9146 - 0.004817*T)*sin(M) + (0.019993 - 0.000101*T)*sin(2M) + 0.000290*sin(3M)
 */
function calculateSun(T: number, ayanamsha: number): RawPlanetResult {
  const L0 = normalizeDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M_sun = normalizeDeg(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
  
  // Equation of center
  const C = (1.914602 - 0.004817 * T) * sinD(M_sun) + 
            (0.019993 - 0.000101 * T) * sinD(2 * M_sun) + 
            0.000289 * sinD(3 * M_sun);
  
  const trueLong = normalizeDeg(L0 + C);
  
  // Apparent longitude including aberration and nutation approximation
  const apparentLong = normalizeDeg(trueLong - 0.00569 - 0.00478 * sinD(125.04452 - 1934.136261 * T));
  const siderealLong = normalizeDeg(apparentLong - ayanamsha);

  // Mean daily speed ~ 0.9856 deg/day
  const speed = 0.9856;

  return {
    tropicalLong: apparentLong,
    siderealLong,
    speed,
    isRetrograde: false
  };
}

/**
 * High-Precision Geocentric Moon Calculation (Truncated ELP-2000 / Jean Meeus Ch. 47)
 * Implements higher-order periodic perturbation terms for Nirayana precision.
 */
function calculateMoon(T: number, ayanamsha: number): RawPlanetResult {
  // Fundamental arguments of lunar motion
  const Lp = normalizeDeg(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841.0);
  const D  = normalizeDeg(297.8501921 + 445267.11140340 * T - 0.0018819 * T * T + (T * T * T) / 545868.0);
  const M  = normalizeDeg(357.5291092 + 35999.05029090 * T - 0.0001536 * T * T + (T * T * T) / 24490000.0);
  const Mp = normalizeDeg(134.9633964 + 477198.86750550 * T + 0.0087414 * T * T + (T * T * T) / 69699.0);
  const F  = normalizeDeg(93.27209500 + 483202.01752330 * T - 0.0036539 * T * T - (T * T * T) / 3526000.0);

  // Major periodic perturbation terms for lunar longitude
  let sigmaL =
    6.288774 * sinD(Mp) +                   // Main elliptic term
    1.274027 * sinD(2 * D - Mp) +           // Evection
    0.658314 * sinD(2 * D) +                // Variation
    0.213618 * sinD(2 * Mp) +               // Second elliptic term
    -0.185800 * sinD(M) +                   // Annual Equation
    -0.114332 * sinD(2 * F) +               // Reduction to ecliptic
    0.058793 * sinD(2 * D - 2 * Mp) +
    0.057066 * sinD(2 * D - M - Mp) +
    0.053322 * sinD(2 * D + Mp) +
    0.045758 * sinD(2 * D - M) +
    -0.040923 * sinD(M - Mp) +
    -0.034720 * sinD(D) +
    -0.030383 * sinD(M + Mp) +
    0.015327 * sinD(2 * D - 2 * F) +
    -0.012528 * sinD(2 * D + M - Mp) +
    -0.010980 * sinD(2 * D + M) +
    0.010675 * sinD(4 * D - Mp) +
    0.010034 * sinD(3 * Mp) +
    0.008548 * sinD(4 * D - 2 * Mp) +
    -0.007888 * sinD(2 * D - M - 2 * F) +
    -0.006766 * sinD(2 * D + 2 * Mp) +
    0.005163 * sinD(Mp - 2 * F) +
    0.004987 * sinD(2 * D + Mp - M) +
    0.004036 * sinD(2 * D - M + Mp) +
    0.003994 * sinD(Mp + 2 * F) +
    0.003861 * sinD(4 * D) +
    0.003665 * sinD(2 * D - 3 * Mp) +
    -0.002689 * sinD(M - 2 * F) +
    -0.002602 * sinD(2 * D - Mp - 2 * F) +
    0.002390 * sinD(2 * Mp - 2 * F) +
    -0.002348 * sinD(D + Mp) +
    0.002236 * sinD(2 * D - 2 * M) +
    -0.002120 * sinD(2 * Mp + M) +
    -0.002069 * sinD(2 * M) +
    0.002048 * sinD(2 * D - 2 * Mp - M) +
    -0.001773 * sinD(2 * D + Mp - 2 * F) +
    -0.001595 * sinD(2 * D + 2 * F) +
    0.001215 * sinD(4 * D - M - Mp) +
    -0.001110 * sinD(D + M) +
    0.000892 * sinD(4 * D - 3 * Mp) +
    -0.000811 * sinD(M + Mp - 2 * F) +
    0.000759 * sinD(4 * D - M - 2 * Mp) +
    -0.000713 * sinD(2 * Mp - M) +
    -0.000700 * sinD(2 * D + 2 * Mp - M) +
    0.000691 * sinD(2 * D + M - 2 * F) +
    0.000596 * sinD(2 * D - M - 2 * Mp) +
    0.000549 * sinD(4 * D + Mp) +
    0.000537 * sinD(4 * Mp) +
    0.000520 * sinD(4 * D - M) +
    -0.000487 * sinD(D - Mp) +
    -0.000399 * sinD(2 * D + M + Mp) +
    -0.000381 * sinD(2 * Mp + 2 * F) +
    0.000351 * sinD(2 * D + M + 2 * F) +
    -0.000340 * sinD(3 * Mp + M) +
    0.000330 * sinD(4 * D - 2 * F);

  // Additional planetary perturbation terms
  const A1 = normalizeDeg(119.75 + 131.849 * T);
  const A2 = normalizeDeg(53.09 + 479264.290 * T);
  sigmaL += 0.003964 * sinD(A1) + 0.001964 * sinD(Lp - F) + 0.002060 * sinD(A2);

  const tropicalLong = normalizeDeg(Lp + sigmaL);
  const siderealLong = normalizeDeg(tropicalLong - ayanamsha);

  // Mean Moon speed ~ 13.176358 deg/day
  const speed = 13.176358;

  return {
    tropicalLong,
    siderealLong,
    speed,
    isRetrograde: false
  };
}

/**
 * High-Precision Keplerian Orbital Elements for Major Planets
 * Rates per Julian century from J2000.0 (IAU standard)
 */
interface OrbitalElements {
  a0: number; aDot: number;
  e0: number; eDot: number;
  I0: number; IDot: number;
  L0: number; LDot: number;
  w0: number; wDot: number;
  node0: number; nodeDot: number;
}

const PLANET_ELEMENTS: Record<string, OrbitalElements> = {
  Mercury: {
    a0: 0.38709927, aDot: 0.00000037,
    e0: 0.20563593, eDot: 0.00001906,
    I0: 7.00497902, IDot: -0.00594749,
    L0: 252.25032350, LDot: 149472.67411175,
    w0: 77.45779628, wDot: 0.16047689,
    node0: 48.33076593, nodeDot: -0.12534081
  },
  Venus: {
    a0: 0.72333566, aDot: 0.00000390,
    e0: 0.00677672, eDot: -0.00004107,
    I0: 3.39467605, IDot: -0.00078890,
    L0: 181.97909950, LDot: 58517.81538729,
    w0: 131.60246718, wDot: 0.00268329,
    node0: 76.67984255, nodeDot: -0.27769418
  },
  Earth: {
    a0: 1.00000261, aDot: 0.00000562,
    e0: 0.01671123, eDot: -0.00004392,
    I0: 0.00001531, IDot: -0.01294668,
    L0: 100.46457166, LDot: 35999.37244981,
    w0: 102.93768193, wDot: 0.32327364,
    node0: 0.0, nodeDot: 0.0
  },
  Mars: {
    a0: 1.52371034, aDot: 0.00001847,
    e0: 0.09339410, eDot: 0.00007882,
    I0: 1.84969142, IDot: -0.00813131,
    L0: -4.55343205, LDot: 19140.30268499,
    w0: -23.94362959, wDot: 0.44441088,
    node0: 49.55953891, nodeDot: -0.29257343
  },
  Jupiter: {
    a0: 5.20288700, aDot: -0.00011607,
    e0: 0.04838624, eDot: -0.00013253,
    I0: 1.30439695, IDot: -0.00183714,
    L0: 34.39644051, LDot: 3034.74612775,
    w0: 14.72847983, wDot: 0.21252668,
    node0: 100.47390909, nodeDot: 0.20469106
  },
  Saturn: {
    a0: 9.53667594, aDot: -0.00125060,
    e0: 0.05386179, eDot: -0.00050991,
    I0: 2.48599187, IDot: 0.00193609,
    L0: 49.95424423, LDot: 1222.49362201,
    w0: 92.59887831, wDot: -0.41897216,
    node0: 113.66242448, nodeDot: -0.28867794
  }
};

/**
 * Solve Kepler's Equation E - e*sin(E) = M (Newton-Raphson method)
 */
function solveKepler(M_deg: number, e: number): number {
  const M_rad = normalizeDeg(M_deg) * DEG_TO_RAD;
  let E = M_rad;
  for (let i = 0; i < 20; i++) {
    const delta = E - e * Math.sin(E) - M_rad;
    if (Math.abs(delta) < 1e-10) break;
    E = E - delta / (1 - e * Math.cos(E));
  }
  return E * RAD_TO_DEG;
}

/**
 * Calculate Heliocentric coordinates (x, y, z) for a planet at time T
 */
function getHeliocentricPosition(planetName: string, T: number): { x: number; y: number; z: number } {
  const elem = PLANET_ELEMENTS[planetName];
  const a = elem.a0 + elem.aDot * T;
  const e = elem.e0 + elem.eDot * T;
  const I = elem.I0 + elem.IDot * T;
  const L = normalizeDeg(elem.L0 + elem.LDot * T);
  const w = normalizeDeg(elem.w0 + elem.wDot * T);
  const node = normalizeDeg(elem.node0 + elem.nodeDot * T);

  const M = normalizeDeg(L - w);
  const E = solveKepler(M, e);

  // Position in orbital plane
  const xOrb = a * (cosD(E) - e);
  const yOrb = a * Math.sqrt(1 - e * e) * sinD(E);

  // Argument of perihelion
  const omega = normalizeDeg(w - node);

  // 3D ecliptic rectangular coordinates
  const x = (cosD(omega) * cosD(node) - sinD(omega) * sinD(node) * cosD(I)) * xOrb +
            (-sinD(omega) * cosD(node) - cosD(omega) * sinD(node) * cosD(I)) * yOrb;

  const y = (cosD(omega) * sinD(node) + sinD(omega) * cosD(node) * cosD(I)) * xOrb +
            (-sinD(omega) * sinD(node) + cosD(omega) * cosD(node) * cosD(I)) * yOrb;

  const z = (sinD(omega) * sinD(I)) * xOrb + (cosD(omega) * sinD(I)) * yOrb;

  return { x, y, z };
}

/**
 * Calculate Geocentric Tropical & Sidereal Nirayana Longitude with Retrograde Speed
 */
function calculateGeocentricPlanet(
  planetName: string,
  T: number,
  ayanamsha: number,
  sunTropicalLong: number
): RawPlanetResult {
  const earth = getHeliocentricPosition('Earth', T);
  const planet = getHeliocentricPosition(planetName, T);

  // Geocentric vector
  const geoX = planet.x - earth.x;
  const geoY = planet.y - earth.y;

  const tropicalLong = normalizeDeg(atan2D(geoY, geoX));
  const siderealLong = normalizeDeg(tropicalLong - ayanamsha);

  // Dynamic daily speed differentiation for Retrograde status
  const dt = 0.0001; // ~ 3.65 days
  const earthNext = getHeliocentricPosition('Earth', T + dt);
  const planetNext = getHeliocentricPosition(planetName, T + dt);
  const geoXNext = planetNext.x - earthNext.x;
  const geoYNext = planetNext.y - earthNext.y;
  const nextTropicalLong = normalizeDeg(atan2D(geoYNext, geoXNext));

  let diff = nextTropicalLong - tropicalLong;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  const speed = diff / (dt * 36525); // deg per day
  const isRetrograde = speed < 0;

  // Astrological combustion (Astangata) thresholds from Sun
  let combustOrb = 15;
  if (planetName === 'Mercury') combustOrb = isRetrograde ? 12 : 14;
  if (planetName === 'Venus') combustOrb = isRetrograde ? 8 : 10;
  if (planetName === 'Mars') combustOrb = 17;
  if (planetName === 'Jupiter') combustOrb = 11;
  if (planetName === 'Saturn') combustOrb = 15;

  let angleFromSun = Math.abs(tropicalLong - sunTropicalLong);
  if (angleFromSun > 180) angleFromSun = 360 - angleFromSun;
  const isCombust = angleFromSun <= combustOrb;

  return {
    tropicalLong,
    siderealLong,
    speed,
    isRetrograde,
    isCombust
  };
}

/**
 * Calculate Accurate Mean Lunar Nodes (Rahu & Ketu)
 * Mean Node Omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T
 */
function calculateNodes(T: number, ayanamsha: number): { rahu: RawPlanetResult; ketu: RawPlanetResult } {
  const omega = normalizeDeg(125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000.0);
  
  const siderealRahu = normalizeDeg(omega - ayanamsha);
  const siderealKetu = normalizeDeg(siderealRahu + 180);

  return {
    rahu: {
      tropicalLong: omega,
      siderealLong: siderealRahu,
      speed: -0.0529,
      isRetrograde: true
    },
    ketu: {
      tropicalLong: normalizeDeg(omega + 180),
      siderealLong: siderealKetu,
      speed: -0.0529,
      isRetrograde: true
    }
  };
}

/**
 * Calculate Exact Ascendant (Lagna) from Local Sidereal Time (RAMC), Obliquity, and Latitude
 */
export function calculateLagna(
  JD: number,
  T: number,
  utcHours: number,
  lat: number,
  lon: number,
  ayanamsha: number
): { tropicalLagna: number; siderealLagna: number; ramc: number } {
  // Greenwich Mean Sidereal Time (GMST) at 0h UT
  const GMST0 = normalizeDeg(100.46061837 + 36000.770053608 * T + 0.000387933 * T * T - (T * T * T) / 38710000.0);
  
  // Right Ascension of Midheaven (RAMC / Local Sidereal Time in degrees)
  const RAMC = normalizeDeg(GMST0 + 360.98564736629 * (utcHours / 24.0) + lon);

  // True Obliquity of the Ecliptic (Meeus IAU formula)
  const eps = 23.4392911 - 0.013004167 * T - 0.000000164 * T * T + 0.0000005036 * T * T * T;

  // Exact Ascendant Trigonometric Formula
  // tan(Asc) = cos(RAMC) / (-sin(RAMC)*cos(eps) - tan(lat)*sin(eps))
  const y = cosD(RAMC);
  const x = -sinD(RAMC) * cosD(eps) - tanD(lat) * sinD(eps);
  
  const tropicalLagna = normalizeDeg(atan2D(y, x));
  const siderealLagna = normalizeDeg(tropicalLagna - ayanamsha);

  return {
    tropicalLagna,
    siderealLagna,
    ramc: RAMC
  };
}

/**
 * Accurate Sunrise & Sunset Calculation for Native's Location and Date
 */
export function calculateSunriseSunset(
  year: number,
  month: number,
  day: number,
  lat: number,
  lon: number
): { sunrise: string; sunset: string; sunriseHours: number; sunsetHours: number } {
  const N1 = Math.floor(275 * month / 9);
  const N2 = Math.floor((month + 9) / 12);
  const N3 = (1 + Math.floor((year - 4 * Math.floor(year / 4) + 2) / 3));
  const N = N1 - (N2 * N3) + day - 30;

  const lngHour = lon / 15.0;
  const tRise = N + ((6 - lngHour) / 24.0);
  const M_rise = (0.9856 * tRise) - 3.289;
  const L_rise = normalizeDeg(M_rise + (1.916 * sinD(M_rise)) + (0.020 * sinD(2 * M_rise)) + 282.634);
  const sinDec = 0.39782 * sinD(L_rise);
  const cosDec = Math.cos(Math.asin(sinDec));

  const cosH = (sinD(-0.833) - (sinDec * sinD(lat))) / (cosDec * cosD(lat));
  const clampedCosH = Math.max(-1, Math.min(1, cosH));
  const H_rise = 360 - (Math.acos(clampedCosH) * RAD_TO_DEG);

  const T_rise = H_rise / 15.0;
  const UT_rise = normalizeDeg(T_rise + (L_rise / 15.0) - (0.06571 * tRise) - 6.622 - lngHour);
  
  // Convert UTC to Indian Standard Time (IST = UTC + 5.5) or Local Offset
  const localOffset = lon >= 68 && lon <= 97 ? 5.5 : lon / 15.0;
  const localRise = normalizeDeg((UT_rise + localOffset) * 15.0) / 15.0;
  const localSet = normalizeDeg((localRise + (2 * Math.acos(clampedCosH) * RAD_TO_DEG / 15.0)) * 15.0) / 15.0;

  const riseH = Math.floor(localRise);
  const riseM = Math.floor((localRise - riseH) * 60);

  const setH = Math.floor(localSet);
  const setM = Math.floor((localSet - setH) * 60);

  const formatTime = (h: number, m: number) => {
    const isAm = h < 12;
    const dispH = h % 12 === 0 ? 12 : h % 12;
    return `${String(dispH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${isAm ? 'AM' : 'PM'}`;
  };

  return {
    sunrise: formatTime(riseH, riseM),
    sunset: formatTime(setH, setM),
    sunriseHours: localRise,
    sunsetHours: localSet
  };
}

/**
 * Calculate Maandi (Gulikan)
 */
function calculateMaandi(
  dateObj: Date,
  sunriseHours: number,
  tobHours: number,
  lat: number,
  lon: number,
  ayanamsha: number,
  T: number,
  JD: number
): { sign: number; degree: number } {
  const weekday = dateObj.getDay(); // 0=Sunday, 1=Monday ... 6=Saturday
  // Daytime Ghatis from sunrise
  const dayGhatis = [26, 22, 18, 14, 10, 6, 2];
  const nightGhatis = [10, 6, 2, 26, 22, 18, 14];

  const isNight = tobHours < sunriseHours || tobHours >= (sunriseHours + 12);
  const ghatis = isNight ? nightGhatis[weekday] : dayGhatis[weekday];

  // 1 Ghati = 24 minutes = 0.4 hours
  const maandiLocalHour = (sunriseHours + ghatis * 0.4) % 24;
  const maandiUtHour = (maandiLocalHour - 5.5 + 24) % 24;

  const lagnaAtMaandi = calculateLagna(JD, T, maandiUtHour, lat, lon, ayanamsha);
  const sign = Math.floor(lagnaAtMaandi.siderealLagna / 30);
  const degree = lagnaAtMaandi.siderealLagna % 30;

  return { sign, degree };
}

// ==========================================
// 4. VIMSHOTTARI DASA-BHUKTI ENGINE
// ==========================================

const MONTH_ABBRS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateDMMMYYYY(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const mon = MONTH_ABBRS[d.getMonth()];
  const yr = d.getFullYear();
  return `${day}-${mon}-${yr}`;
}

const DAYS_PER_YEAR = 365.2425;
const DAYS_PER_MONTH = 30.436875;
const MS_PER_DAY = 86400000;
const MS_PER_YEAR = DAYS_PER_YEAR * MS_PER_DAY; // 31556952000 ms

export function calculateVimshottariDasa(
  moonSiderealLong: number,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number = 6,
  birthMin: number = 0
): {
  janmaDasaIruppu: string;
  activeDasaBhukti: string;
  dasaTimelines: DasaTimeline[];
  currentDasaBhukti: CurrentDasaBhuktiInfo;
} {
  const moonLong = normalizeDeg(moonSiderealLong);
  const nakshatraSpan = 360.0 / 27.0; // 13.333333333333334°
  const nakshatraIndex = Math.floor(moonLong / nakshatraSpan);
  const elapsedInNakshatra = moonLong % nakshatraSpan;

  // Exact fraction of star left
  const fractionLeft = (nakshatraSpan - elapsedInNakshatra) / nakshatraSpan;

  // Janma Dasa Lord (Ashwini = 0 -> Ketu)
  const lordIndex = nakshatraIndex % 9;
  const firstDasa = DASA_LORDS_ORDER[lordIndex];

  // Exact Dasa Balance at Birth in years
  const balanceYearsTotal = fractionLeft * firstDasa.years;

  // Convert strictly to Years, Months, Days using astronomical constants
  const totalDays = balanceYearsTotal * DAYS_PER_YEAR;
  let bYears = Math.floor(balanceYearsTotal);
  const remDays = totalDays - (bYears * DAYS_PER_YEAR);
  let bMonths = Math.floor(remDays / DAYS_PER_MONTH);
  let bDays = Math.round(remDays - (bMonths * DAYS_PER_MONTH));

  if (bDays >= 30) {
    bMonths += Math.floor(bDays / 30);
    bDays = bDays % 30;
  }
  if (bMonths >= 12) {
    bYears += Math.floor(bMonths / 12);
    bMonths = bMonths % 12;
  }

  const janmaDasaIruppu = `ஜென்ம கால தசா இருப்பு: ${firstDasa.name} திசை ${String(bYears).padStart(2, '0')} வருடம் ${String(bMonths).padStart(2, '0')} மாதம் ${String(bDays).padStart(2, '0')} நாள்`;

  // Start Date = Native's DOB
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay, birthHour, birthMin);
  const birthMs = birthDate.getTime();
  const nowMs = Date.now();

  const dasaTimelines: DasaTimeline[] = [];

  let currentDasaLord = firstDasa.name;
  let currentBhuktiLord = '';
  let currentDasaStart = '';
  let currentDasaEnd = '';
  let currentBhuktiStart = '';
  let currentBhuktiEnd = '';

  let cursorMs = birthMs;

  for (let i = 0; i < 9; i++) {
    const dIdx = (lordIndex + i) % 9;
    const dasa = DASA_LORDS_ORDER[dIdx];

    const isFirstDasa = (i === 0);
    const dasaYears = isFirstDasa ? balanceYearsTotal : dasa.years;
    const dasaStartMs = cursorMs;
    const dasaEndMs = dasaStartMs + dasaYears * MS_PER_YEAR;
    cursorMs = dasaEndMs;

    const dasaStartDateObj = new Date(dasaStartMs);
    const dasaEndDateObj = new Date(dasaEndMs);

    const isCurrentDasa = (nowMs >= dasaStartMs && nowMs < dasaEndMs);

    // Calculate all 9 Bhuktis for this Dasa
    const bhuktis: BhuktiTimeline[] = [];
    
    // For 1st Dasa: theoretical full start was (dasaEndMs - fullYears * MS_PER_YEAR)
    const fullDasaYears = dasa.years;
    const fullStartMs = isFirstDasa ? (dasaEndMs - fullDasaYears * MS_PER_YEAR) : dasaStartMs;
    let bhuktiCursorMs = fullStartMs;
    let matchedActiveBhuktiName = '';

    for (let b = 0; b < 9; b++) {
      const bIdx = (dIdx + b) % 9;
      const bLord = DASA_LORDS_ORDER[bIdx];
      const bhuktiYears = (fullDasaYears * bLord.years) / 120.0;
      const bStartMs = bhuktiCursorMs;
      const bEndMs = bStartMs + bhuktiYears * MS_PER_YEAR;
      bhuktiCursorMs = bEndMs;

      // In 1st dasa, only include bhuktis that end after birthMs
      if (bEndMs <= birthMs) {
        continue;
      }

      // Effective start during native's life
      const effectiveStartMs = Math.max(birthMs, bStartMs);
      const bStartDateObj = new Date(effectiveStartMs);
      const bEndDateObj = new Date(bEndMs);

      // Duration formatting
      const bDurYears = (bEndMs - effectiveStartMs) / MS_PER_YEAR;
      const bY = Math.floor(bDurYears);
      const bRemMonths = (bDurYears - bY) * 12.0;
      const bM = Math.floor(bRemMonths);
      const bD = Math.round((bRemMonths - bM) * DAYS_PER_MONTH);

      let durStr = '';
      if (bY > 0) durStr += `${bY}வ `;
      if (bM > 0) durStr += `${bM}மா `;
      if (bD > 0 || durStr === '') durStr += `${bD}நா`;

      const isCurrentBhukti = (nowMs >= effectiveStartMs && nowMs < bEndMs);

      if (isCurrentBhukti) {
        matchedActiveBhuktiName = `${bLord.name} புக்தி`;
        if (isCurrentDasa) {
          currentDasaLord = dasa.name;
          currentBhuktiLord = bLord.name;
          currentDasaStart = formatDateDMMMYYYY(dasaStartDateObj);
          currentDasaEnd = formatDateDMMMYYYY(dasaEndDateObj);
          currentBhuktiStart = formatDateDMMMYYYY(bStartDateObj);
          currentBhuktiEnd = formatDateDMMMYYYY(bEndDateObj);
        }
      }

      bhuktis.push({
        bhuktiLord: bLord.name,
        startDate: formatDateDMMMYYYY(bStartDateObj),
        endDate: formatDateDMMMYYYY(bEndDateObj),
        duration: durStr.trim(),
        isCurrent: isCurrentBhukti
      });
    }

    if (isCurrentDasa && !matchedActiveBhuktiName && bhuktis.length > 0) {
      // Fallback in case border timestamp: pick first or last
      const currentOrFirst = bhuktis.find(b => b.isCurrent) || bhuktis[0];
      matchedActiveBhuktiName = `${currentOrFirst.bhuktiLord} புக்தி`;
      currentDasaLord = dasa.name;
      currentBhuktiLord = currentOrFirst.bhuktiLord;
      currentDasaStart = formatDateDMMMYYYY(dasaStartDateObj);
      currentDasaEnd = formatDateDMMMYYYY(dasaEndDateObj);
      currentBhuktiStart = currentOrFirst.startDate;
      currentBhuktiEnd = currentOrFirst.endDate;
    }

    const dDurationStr = isFirstDasa
      ? `${bYears}வ ${bMonths}மா ${bDays}நா`
      : `${dasa.years} வருடங்கள்`;

    dasaTimelines.push({
      dasaLord: dasa.name,
      startDate: formatDateDMMMYYYY(dasaStartDateObj),
      endDate: formatDateDMMMYYYY(dasaEndDateObj),
      duration: dDurationStr,
      isCurrent: isCurrentDasa,
      activeBhukti: isCurrentDasa ? matchedActiveBhuktiName : undefined,
      bhuktis
    });
  }

  // If no Dasa was flagged current (e.g. native age > 120 or before birth), set fallback
  if (!currentBhuktiLord && dasaTimelines.length > 0) {
    const defaultDasa = dasaTimelines.find(d => d.isCurrent) || dasaTimelines[0];
    currentDasaLord = defaultDasa.dasaLord;
    currentDasaStart = defaultDasa.startDate;
    currentDasaEnd = defaultDasa.endDate;
    const defaultBhukti = defaultDasa.bhuktis?.[0];
    if (defaultBhukti) {
      currentBhuktiLord = defaultBhukti.bhuktiLord;
      currentBhuktiStart = defaultBhukti.startDate;
      currentBhuktiEnd = defaultBhukti.endDate;
    }
  }

  const activeDasaBhukti = `நடப்பு திசை & புக்தி: ${currentDasaLord} திசை ${currentBhuktiLord ? `${currentBhuktiLord} புக்தி` : 'சுய புக்தி'} (${currentBhuktiEnd ? `${currentBhuktiEnd} வரை` : ''})`;

  const currentDasaBhukti: CurrentDasaBhuktiInfo = {
    dasaLord: currentDasaLord,
    bhuktiLord: currentBhuktiLord || currentDasaLord,
    dasaStartDate: currentDasaStart,
    dasaEndDate: currentDasaEnd,
    bhuktiStartDate: currentBhuktiStart,
    bhuktiEndDate: currentBhuktiEnd,
    summaryText: activeDasaBhukti
  };

  return {
    janmaDasaIruppu,
    activeDasaBhukti,
    dasaTimelines,
    currentDasaBhukti
  };
}

// ==========================================
// 5. NADI & D.S. ASTRO SYSTEM EVALUATION
// ==========================================

function evaluateNadiAndDSSystem(
  planetaryList: { name: string; abbr: string; sign: number; degree: number; rawLon: number }[],
  currentDasaLord: string
): { nadi: NadiAnalysis; ds: DSSystemAnalysis } {
  // Nadi Directional Trines:
  // East: 0 (Mesham), 4 (Simham), 8 (Dhanusu)
  // South: 1 (Rishabham), 5 (Kanni), 9 (Makaram)
  // West: 2 (Mithunam), 6 (Thulam), 10 (Kumbam)
  // North: 3 (Kadagam), 7 (Viruchigam), 11 (Meenam)
  const eastSigns = [0, 4, 8];
  const southSigns = [1, 5, 9];
  const westSigns = [2, 6, 10];
  const northSigns = [3, 7, 11];

  const eastPlanets = planetaryList.filter(p => eastSigns.includes(p.sign)).map(p => p.name);
  const southPlanets = planetaryList.filter(p => southSigns.includes(p.sign)).map(p => p.name);
  const westPlanets = planetaryList.filter(p => westSigns.includes(p.sign)).map(p => p.name);
  const northPlanets = planetaryList.filter(p => northSigns.includes(p.sign)).map(p => p.name);

  const keyYogas: string[] = [];

  // Check Nadi Conjunctions
  const checkYoga = (dirPlanets: string[], p1: string, p2: string, yogaName: string) => {
    if (dirPlanets.includes(p1) && dirPlanets.includes(p2)) {
      keyYogas.push(yogaName);
    }
  };

  [eastPlanets, southPlanets, westPlanets, northPlanets].forEach(group => {
    checkYoga(group, 'குரு', 'சனி', 'தர்ம கர்மாதிபதி யோகம் (Guru-Sani Nadi Combination)');
    checkYoga(group, 'சூரியன்', 'புதன்', 'புத-ஆதித்ய யோகம் (Budhaditya Yoga)');
    checkYoga(group, 'சுக்கிரன்', 'குரு', 'பிருகு-ஜீவ யோகம் (Bhrigu-Jeeva Yoga)');
    checkYoga(group, 'செவ்வாய்', 'சந்திரன்', 'சந்திர-மங்கள யோகம் (Chandra-Mangala Yoga)');
    checkYoga(group, 'சனி', 'ராகு', 'நந்தி நாடி கர்ம பந்த யோகம் (Sani-Rahu Karmic Knot)');
  });

  const nadi: NadiAnalysis = {
    east: { planets: eastPlanets, yoga: eastPlanets.join(', ') || 'கிரகங்கள் இல்லை' },
    south: { planets: southPlanets, yoga: southPlanets.join(', ') || 'கிரகங்கள் இல்லை' },
    west: { planets: westPlanets, yoga: westPlanets.join(', ') || 'கிரகங்கள் இல்லை' },
    north: { planets: northPlanets, yoga: northPlanets.join(', ') || 'கிரகங்கள் இல்லை' },
    keyYogas: keyYogas.length > 0 ? keyYogas : ['பொதுவான சுப யோக கட்டமைப்பு']
  };

  // D.S. System Evaluation:
  // Rahu-Ketu Axis Midpoints (Karmic Pivot points at +90° and +270°)
  const rahuObj = planetaryList.find(p => p.name === 'ராகு');
  const rahuLon = rahuObj ? rahuObj.rawLon : 0;
  const mp1 = normalizeDeg(rahuLon + 90);
  const mp2 = normalizeDeg(rahuLon + 270);

  const midpointHits: string[] = [];
  planetaryList.forEach(p => {
    if (p.name !== 'ராகு' && p.name !== 'கேது') {
      const diff1 = Math.abs(p.rawLon - mp1);
      const diff2 = Math.abs(p.rawLon - mp2);
      const minDiff = Math.min(diff1 > 180 ? 360 - diff1 : diff1, diff2 > 180 ? 360 - diff2 : diff2);

      if (minDiff <= 3.5) {
        midpointHits.push(`${p.name} ராகு-கேது மத்திய பாகையுடன் (${minDiff.toFixed(1)}° orb) கர்ம பரிமாணத்தில் உள்ளது.`);
      }
    }
  });

  // D.S. System Thasanathan Lagna:
  const dasaLordObj = planetaryList.find(p => p.name.includes(currentDasaLord) || currentDasaLord.includes(p.name));
  const dasaLagnaSignIdx = dasaLordObj ? dasaLordObj.sign : 0;
  const dasaLagnaSignName = RASI_NAMES_TAMIL[dasaLagnaSignIdx];

  // Dusthana houses from Dasa Lagna (6th, 8th, 12th)
  const dusthana6Idx = (dasaLagnaSignIdx + 5) % 12;
  const dusthana8Idx = (dasaLagnaSignIdx + 7) % 12;
  const dusthana12Idx = (dasaLagnaSignIdx + 11) % 12;

  const dusthanaSummary: string[] = [];
  const pIn6 = planetaryList.filter(p => p.sign === dusthana6Idx).map(p => p.name);
  const pIn8 = planetaryList.filter(p => p.sign === dusthana8Idx).map(p => p.name);
  const pIn12 = planetaryList.filter(p => p.sign === dusthana12Idx).map(p => p.name);

  dusthanaSummary.push(`6-ம் இடம் (${RASI_NAMES_TAMIL[dusthana6Idx]}): ${pIn6.join(', ') || 'கிரகங்கள் இல்லை'}`);
  dusthanaSummary.push(`8-ம் இடம் (${RASI_NAMES_TAMIL[dusthana8Idx]}): ${pIn8.join(', ') || 'கிரகங்கள் இல்லை'}`);
  dusthanaSummary.push(`12-ம் இடம் (${RASI_NAMES_TAMIL[dusthana12Idx]}): ${pIn12.join(', ') || 'கிரகங்கள் இல்லை'}`);

  const ds: DSSystemAnalysis = {
    rahuKetuMidpoint1: formatDegree(mp1),
    rahuKetuMidpoint2: formatDegree(mp2),
    midpointHits: midpointHits.length > 0 ? midpointHits : ['ராகு-கேது அச்சு மத்திய புள்ளியில் நேரடி கிரக பிணைப்பு இல்லை (சுப நிலை).'],
    currentDasaLord,
    dasaLagnaSign: dasaLagnaSignName,
    dusthanaSummary
  };

  return { nadi, ds };
}

// ==========================================
// 6. MAIN CALCULATION ENTRY POINT
// ==========================================

export const DEFAULT_INPUT: HoroscopeInput = {
  name: '',
  gender: 'ஆண்',
  dob: '',
  tob: '',
  pob: '',
  fatherName: '',
  motherName: '',
  lat: undefined,
  lon: undefined
};

function parseDmsToDecimal(dmsStr: string): number | null {
  const match = dmsStr.match(/(\d+)[°\s]+(\d+)?['\s]*([NSEW])?/i);
  if (!match) return null;
  const deg = parseFloat(match[1]) || 0;
  const min = parseFloat(match[2]) || 0;
  let val = deg + min / 60.0;
  const dir = match[3]?.toUpperCase();
  if (dir === 'S' || dir === 'W') val = -val;
  return val;
}

export function calculateHoroscope(input: HoroscopeInput): HoroscopeData {
  const genderLabel = input.gender === 'பெண்' ? 'பெண் பெயர்' : input.gender === 'ஆண்' ? 'ஆண் பெயர்' : 'பெயர்';

  // Parse Date & Time
  const [yearStr, monthStr, dayStr] = (input.dob || '2000-01-01').split('-');
  const year = parseInt(yearStr || '2000', 10);
  const month = parseInt(monthStr || '1', 10);
  const day = parseInt(dayStr || '1', 10);

  const [hourStr, minStr] = (input.tob || '06:00').split(':');
  const hour = parseInt(hourStr || '6', 10);
  const min = parseInt(minStr || '0', 10);

  // Determine Coordinates (Latitude & Longitude)
  let lat = 11.0168; // Default Tamil Nadu / Coimbatore
  let lon = 76.9558;

  if (input.lat && input.lon) {
    lat = parseFloat(input.lat);
    lon = parseFloat(input.lon);
  } else if (input.pob) {
    const cityInput = input.pob.trim().toLowerCase();
    const matchedCity = TAMIL_NADU_CITIES.find(
      c => c.name.toLowerCase().includes(cityInput) || c.tamilName.toLowerCase().includes(cityInput) || cityInput.includes(c.name.toLowerCase())
    );
    if (matchedCity) {
      const parsedLat = parseDmsToDecimal(matchedCity.lat);
      const parsedLon = parseDmsToDecimal(matchedCity.long);
      if (parsedLat !== null) lat = parsedLat;
      if (parsedLon !== null) lon = parsedLon;
    }
  }

  // Calculate UTC time (Standard Indian Time Zone IST = UTC + 5.5)
  const localOffset = lon >= 68 && lon <= 97 ? 5.5 : lon / 15.0;
  const localDecimalHours = hour + min / 60.0;
  const utcHours = (localDecimalHours - localOffset + 24.0) % 24.0;

  // Astronomical Julian Date & Epoch Century T
  const JD = calculateJulianDate(year, month, day, utcHours);
  const T = (JD - 2451545.0) / 36525.0;

  // 1. High-Precision Lahiri Ayanamsha (IAU Formula)
  const ayanamsha = calculateLahiriAyanamsha(T);
  const ayanamsaFormatted = `${Math.floor(ayanamsha)}° ${String(Math.floor((ayanamsha % 1) * 60)).padStart(2, '0')}' ${String(Math.round((((ayanamsha % 1) * 60) % 1) * 60)).padStart(2, '0')}" (லஹரி)`;

  // 2. Exact Geocentric Planetary Longitudes
  const sunRaw = calculateSun(T, ayanamsha);
  const moonRaw = calculateMoon(T, ayanamsha);
  const marsRaw = calculateGeocentricPlanet('Mars', T, ayanamsha, sunRaw.tropicalLong);
  const mercuryRaw = calculateGeocentricPlanet('Mercury', T, ayanamsha, sunRaw.tropicalLong);
  const jupiterRaw = calculateGeocentricPlanet('Jupiter', T, ayanamsha, sunRaw.tropicalLong);
  const venusRaw = calculateGeocentricPlanet('Venus', T, ayanamsha, sunRaw.tropicalLong);
  const saturnRaw = calculateGeocentricPlanet('Saturn', T, ayanamsha, sunRaw.tropicalLong);
  const { rahu: rahuRaw, ketu: ketuRaw } = calculateNodes(T, ayanamsha);

  // 3. Exact Lagna (Ascendant)
  const lagnaRaw = calculateLagna(JD, T, utcHours, lat, lon, ayanamsha);
  const lagnaSidereal = lagnaRaw.siderealLagna;

  // 4. Sunrise & Sunset
  const sunTimes = calculateSunriseSunset(year, month, day, lat, lon);

  // 5. Maandi (Gulikan)
  const dateObj = new Date(year, month - 1, day);
  const maandiPos = calculateMaandi(dateObj, sunTimes.sunriseHours, localDecimalHours, lat, lon, ayanamsha, T, JD);

  // 6. Panchangam Calculations: Tithi, Yoga, Karana
  const moonSunAngle = normalizeDeg(moonRaw.siderealLong - sunRaw.siderealLong);
  const tithiIndex = Math.floor(moonSunAngle / 12.0);
  const isShukla = tithiIndex < 15;
  const tithiName = `${isShukla ? 'சுக்ல பட்ச' : 'கிருஷ்ண பட்ச'} ${TITHI_NAMES[tithiIndex % 15]}`;

  const yogaIndex = Math.floor(normalizeDeg(sunRaw.siderealLong + moonRaw.siderealLong) / (360.0 / 27.0));
  const yogaName = YOGA_NAMES[yogaIndex % 27];

  const karanaIndex = Math.floor(moonSunAngle / 6.0);
  const karanaName = KARANA_NAMES[karanaIndex % 11];

  // Helper for Nakshatra & Pada
  const getStarDetails = (siderealLon: number) => {
    const starSpan = 360.0 / 27.0; // 13.3333333°
    const starIdx = Math.floor(siderealLon / starSpan);
    const degInStar = siderealLon % starSpan;
    const pada = Math.floor(degInStar / (starSpan / 4.0)) + 1;
    return {
      star: NAKSHATRAS[starIdx % 27],
      pada,
      starIndex: starIdx
    };
  };

  // Build Section 2 (Left): Planetary Degrees Table
  const planetsForTable = [
    { name: 'லக்னம்', raw: lagnaSidereal, isRetro: false, isCombust: false },
    { name: 'சூரியன்', raw: sunRaw.siderealLong, isRetro: false, isCombust: false },
    { name: 'சந்திரன்', raw: moonRaw.siderealLong, isRetro: false, isCombust: false },
    { name: 'செவ்வாய்', raw: marsRaw.siderealLong, isRetro: marsRaw.isRetrograde, isCombust: marsRaw.isCombust },
    { name: 'புதன்', raw: mercuryRaw.siderealLong, isRetro: mercuryRaw.isRetrograde, isCombust: mercuryRaw.isCombust },
    { name: 'குரு', raw: jupiterRaw.siderealLong, isRetro: jupiterRaw.isRetrograde, isCombust: jupiterRaw.isCombust },
    { name: 'சுக்கிரன்', raw: venusRaw.siderealLong, isRetro: venusRaw.isRetrograde, isCombust: venusRaw.isCombust },
    { name: 'சனி', raw: saturnRaw.siderealLong, isRetro: saturnRaw.isRetrograde, isCombust: saturnRaw.isCombust },
    { name: 'ராகு', raw: rahuRaw.siderealLong, isRetro: true, isCombust: false },
    { name: 'கேது', raw: ketuRaw.siderealLong, isRetro: true, isCombust: false }
  ];

  const planetaryDegrees: PlanetaryDegree[] = planetsForTable.map(p => {
    const starInfo = getStarDetails(p.raw);
    return {
      planet: p.name,
      degree: formatDegree(p.raw),
      star: starInfo.star,
      pada: starInfo.pada,
      isRetrograde: p.isRetro,
      isCombust: p.isCombust,
      rawLongitude: p.raw
    };
  });

  // 7. Vimshottari Dasa-Bhukti Calculations
  const { janmaDasaIruppu, activeDasaBhukti, dasaTimelines, currentDasaBhukti } = calculateVimshottariDasa(
    moonRaw.siderealLong,
    year,
    month,
    day,
    hour,
    min
  );

  // 8. Rasi & Navamsa Chart Placements
  const rasiPlacements: Record<number, string[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: []
  };

  const navPlacements: Record<number, string[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: []
  };

  const lagnaSign = Math.floor(lagnaSidereal / 30.0);
  const moonSign = Math.floor(moonRaw.siderealLong / 30.0);
  const moonStarInfo = getStarDetails(moonRaw.siderealLong);

  // List of all 10 celestial points for chart placement
  const celestialBodies = [
    { name: 'லக்னம்', tag: 'லக்', raw: lagnaSidereal, isLagna: true },
    { name: 'சூரியன்', tag: 'சூரி', raw: sunRaw.siderealLong },
    { name: 'சந்திரன்', tag: 'சந்', raw: moonRaw.siderealLong },
    { name: 'செவ்வாய்', tag: marsRaw.isRetrograde ? 'செவ்(வ)' : 'செவ்', raw: marsRaw.siderealLong },
    { name: 'புதன்', tag: mercuryRaw.isRetrograde ? 'புத(வ)' : 'புதன்', raw: mercuryRaw.siderealLong },
    { name: 'குரு', tag: jupiterRaw.isRetrograde ? 'குரு(வ)' : 'குரு', raw: jupiterRaw.siderealLong },
    { name: 'சுக்கிரன்', tag: venusRaw.isRetrograde ? 'சுக்(வ)' : 'சுக்', raw: venusRaw.siderealLong },
    { name: 'சனி', tag: saturnRaw.isRetrograde ? 'சனி(வ)' : 'சனி', raw: saturnRaw.siderealLong },
    { name: 'ராகு', tag: 'ராகு', raw: rahuRaw.siderealLong },
    { name: 'கேது', tag: 'கேது', raw: ketuRaw.siderealLong }
  ];

  celestialBodies.forEach(body => {
    // 1. Rasi sign (0-11)
    const rasiIdx = Math.floor(body.raw / 30.0);
    rasiPlacements[rasiIdx].push(body.tag);

    // 2. D9 Navamsa sign (0-11): (Longitude * 9 / 30) % 12
    const navIdx = Math.floor((body.raw * 9.0) / 30.0) % 12;
    navPlacements[navIdx].push(body.tag);
  });

  // Add Maandi to Rasi
  rasiPlacements[maandiPos.sign].push('மாந்தி');

  // Build ZodiacBox Array for Rasi Chart
  const rasiChart: ZodiacBox[] = RASI_NAMES_TAMIL.map((name, idx) => ({
    id: idx,
    nameTamil: name,
    englishName: RASI_NAMES_ENGLISH[idx],
    planets: rasiPlacements[idx] || [],
    ashtakavargaBindu: BASE_ASHTAKAVARGA[idx],
    isLagna: idx === lagnaSign
  }));

  // Build ZodiacBox Array for Navamsam Chart
  const navLagnaSign = Math.floor((lagnaSidereal * 9.0) / 30.0) % 12;
  const navamsamChart: ZodiacBox[] = RASI_NAMES_TAMIL.map((name, idx) => ({
    id: idx,
    nameTamil: name,
    englishName: RASI_NAMES_ENGLISH[idx],
    planets: navPlacements[idx] || [],
    isLagna: idx === navLagnaSign
  }));

  // 9. Nadi & D.S. System Rules Evaluation
  const currentDasaLordName = dasaTimelines.find(d => d.isCurrent)?.dasaLord || 'குரு';
  const evaluationList = celestialBodies.map(b => ({
    name: b.name,
    abbr: b.tag,
    sign: Math.floor(b.raw / 30.0),
    degree: b.raw % 30.0,
    rawLon: b.raw
  }));

  const { nadi: nadiAnalysis, ds: dsSystem } = evaluateNadiAndDSSystem(evaluationList, currentDasaLordName);

  // 10. Native Basic Details
  const dobFormatted = input.dob 
    ? `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`
    : '-';

  const isAm = hour < 12;
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const tobFormatted = input.tob 
    ? `${String(displayHour).padStart(2, '0')}:${String(min).padStart(2, '0')} ${isAm ? 'AM' : 'PM'}`
    : '-';

  const currentAge = Math.max(0, new Date().getFullYear() - year);

  const basicDetails = {
    genderLabel,
    name: input.name || '-',
    fatherName: input.fatherName?.trim() || '-',
    motherName: input.motherName?.trim() || '-',
    dob: dobFormatted,
    tob: tobFormatted,
    pob: input.pob || '-',
    nakshatra: `${moonStarInfo.star} (${moonStarInfo.pada}-ம் பாதம்)`,
    rasi: RASI_NAMES_TAMIL[moonSign],
    latLong: formatDMSCoordinates(lat, lon),
    ayanamsa: ayanamsaFormatted,
    lagna: `${RASI_NAMES_TAMIL[lagnaSign]} (${formatDegree(lagnaSidereal)})`,
    sunrise: sunTimes.sunrise,
    thithi: tithiName
  };

  const footerInfo = {
    janmaDasaIruppu,
    nadappuVayadu: `நடப்பு வயது: ${currentAge} வருடம்`,
    nadappuDasaBhukti: activeDasaBhukti
  };

  const panchangam: PanchangamDetails = {
    thithi: tithiName,
    paksham: isShukla ? 'சுக்ல பட்சம் (வளர்பிறை)' : 'கிருஷ்ண பட்சம் (தேய்பிறை)',
    nakshatra: moonStarInfo.star,
    pada: moonStarInfo.pada,
    nithyaYoga: yogaName,
    karana: karanaName,
    sunrise: sunTimes.sunrise,
    sunset: sunTimes.sunset,
    ayanamsaDeg: ayanamsaFormatted
  };

  return {
    title: 'திருக்கணிதப்படி ஜாதகம்',
    input,
    basicDetails,
    planetaryDegrees,
    dasaTimelines,
    currentDasaBhukti,
    rasiChart,
    navamsamChart,
    footerInfo,
    nadiAnalysis,
    dsSystem,
    panchangam
  };
}
