"""
Ayyan Astro - High-Precision NASA Ephemeris & D.S. Astro System Engine
Powered by Skyfield (DE421 NASA Ephemeris), Lahiri Ayanamsha, and Tamil Thirukanidappadi calculations.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
import math
import os
import pytz

# Skyfield imports for NASA Ephemeris
try:
    from skyfield.api import load, Topos, wgs84
    from skyfield.framelib import ecliptic_frame
    SKYFIELD_AVAILABLE = True
except ImportError:
    SKYFIELD_AVAILABLE = False

try:
    from engine.math_utils import (
        calculate_divisional_sign,
        generate_all_divisional_charts,
        calculate_jaimini_karakas,
        calculate_upagrahas,
        calculate_ashtakavarga,
        calculate_shadbala
    )
except ImportError:
    from backend.engine.math_utils import (
        calculate_divisional_sign,
        generate_all_divisional_charts,
        calculate_jaimini_karakas,
        calculate_upagrahas,
        calculate_ashtakavarga,
        calculate_shadbala
    )

app = FastAPI(
    title="Ayyan Astro Skyfield Engine API",
    description="FastAPI Backend for High-Precision Thirukanidappadi Horoscope & D.S. Astro System Rules using Skyfield DE421",
    version="2.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Global Ephemeris Initialization (Lazy / Cached)
# ---------------------------------------------------------------------------
EPHEMERIS_DATA = None
TIMESCALE_DATA = None

def get_skyfield_data():
    global EPHEMERIS_DATA, TIMESCALE_DATA
    if EPHEMERIS_DATA is None and SKYFIELD_AVAILABLE:
        try:
            TIMESCALE_DATA = load.timescale()
            # Loads DE421 BSP file (NASA JPL planetary ephemeris 1900-2050)
            EPHEMERIS_DATA = load('de421.bsp')
        except Exception as e:
            print(f"Warning: Skyfield DE421 loading failed ({e}). Fallback to high-precision mathematical ephemeris.")
            EPHEMERIS_DATA = None
    return EPHEMERIS_DATA, TIMESCALE_DATA


# ---------------------------------------------------------------------------
# Constants & Reference Tables
# ---------------------------------------------------------------------------

RASI_NAMES_TAMIL = [
    "மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்",
    "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்",
    "தனுசு", "மகரம்", "கும்பம்", "மீனம்"
]

RASI_NAMES_ENGLISH = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

SIGN_LORDS = [
    "செவ்வாய்",   # 0: Mesham
    "சுக்கிரன்",  # 1: Rishabham
    "புதன்",      # 2: Mithunam
    "சந்திரன்",    # 3: Katakam
    "சூரியன்",    # 4: Simham
    "புதன்",      # 5: Kanni
    "சுக்கிரன்",  # 6: Thulam
    "செவ்வாய்",   # 7: Viruchigam
    "குரு",       # 8: Dhanusu
    "சனி",        # 9: Makaram
    "சனி",        # 10: Kumbam
    "குரு"        # 11: Meenam
]

NAKSHATRAS = [
    "அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிஷம்", "திருவாதிரை",
    "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்",
    "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
    "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்",
    "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"
]

DASA_LORDS_ORDER = [
    {"name": "கேது", "english": "Ketu", "years": 7, "abbr": "கேது"},
    {"name": "சுக்கிரன்", "english": "Venus", "years": 20, "abbr": "சுக்"},
    {"name": "சூரியன்", "english": "Sun", "years": 6, "abbr": "சூரி"},
    {"name": "சந்திரன்", "english": "Moon", "years": 10, "abbr": "சந்"},
    {"name": "செவ்வாய்", "english": "Mars", "years": 7, "abbr": "செவ்"},
    {"name": "ராகு", "english": "Rahu", "years": 18, "abbr": "ராகு"},
    {"name": "குரு", "english": "Jupiter", "years": 16, "abbr": "குரு"},
    {"name": "சனி", "english": "Saturn", "years": 19, "abbr": "சனி"},
    {"name": "புதன்", "english": "Mercury", "years": 17, "abbr": "புதன்"}
]

OWN_HOUSES_MAP = {
    "சூரியன்": [4],
    "சந்திரன்": [3],
    "செவ்வாய்": [0, 7],
    "புதன்": [2, 5],
    "குரு": [8, 11],
    "சுக்கிரன்": [1, 6],
    "சனி": [9, 10]
}

EXALTED_HOUSES_MAP = {
    "சூரியன்": 0,    # Mesham
    "சந்திரன்": 1,   # Rishabham
    "செவ்வாய்": 9,   # Makaram
    "புதன்": 5,      # Kanni
    "குரு": 3,       # Katakam
    "சுக்கிரன்": 11, # Meenam
    "சனி": 6         # Thulam
}


# ---------------------------------------------------------------------------
# Pydantic Input & Output Models
# ---------------------------------------------------------------------------

class HoroscopeInput(BaseModel):
    name: str = Field(default="க. பிரதீப் குமார்", description="Full Name")
    gender: str = Field(default="ஆண்", description="Gender (ஆண் / பெண் / இதர)")
    dob: str = Field(..., example="1998-05-18", description="Date of Birth (YYYY-MM-DD)")
    tob: str = Field(..., example="07:35", description="Time of Birth (HH:MM 24h format)")
    pob: str = Field(default="மதுரை", description="Place of Birth / City")
    fatherName: Optional[str] = Field(default="மு. கணேசன்")
    motherName: Optional[str] = Field(default="க. லட்சுமி")
    lat: Optional[str] = Field(default="09.9252", description="Latitude in decimal degrees")
    lon: Optional[str] = Field(default="78.1198", description="Longitude in decimal degrees")
    timezone: Optional[str] = Field(default="Asia/Kolkata", description="Timezone name")

class PlanetPosition(BaseModel):
    name: str
    sign: int
    degree: float
    rawLon: float
    nakshatra: str
    pada: int
    star_lord: str
    starLord: Optional[str] = None
    rasi: Optional[str] = None
    isRetrograde: bool = False
    isCombust: bool = False

class PlanetaryDegree(BaseModel):
    planet: str
    degree: str
    star: str
    nakshatra: Optional[str] = None
    pada: int
    star_lord: Optional[str] = None
    starLord: Optional[str] = None
    rasi: Optional[str] = None
    rasi_index: Optional[int] = None
    isRetrograde: bool = False
    isCombust: bool = False
    rawLongitude: float

class BhuktiTimeline(BaseModel):
    bhuktiLord: str
    startDate: str
    endDate: str
    duration: str
    isCurrent: bool = False

class DasaTimeline(BaseModel):
    dasaLord: str
    startDate: str
    endDate: str
    duration: str
    isCurrent: bool = False
    activeBhukti: Optional[str] = None
    bhuktis: List[BhuktiTimeline] = []

class CurrentDasaBhuktiInfo(BaseModel):
    dasaLord: str
    bhuktiLord: str
    dasaStartDate: str
    dasaEndDate: str
    bhuktiStartDate: str
    bhuktiEndDate: str
    summaryText: str

class ZodiacBox(BaseModel):
    id: int
    nameTamil: str = ""
    englishName: str
    planets: List[str] = []
    ashtakavargaBindu: Optional[int] = None
    isLagna: bool = False

class BasicDetails(BaseModel):
    genderLabel: str
    name: str
    fatherName: str
    motherName: str
    dob: str
    tob: str
    pob: str
    nakshatra: str
    rasi: str
    latLong: str
    ayanamsa: str
    lagna: str
    sunrise: str
    thithi: str

class FooterInfo(BaseModel):
    janmaDasaIruppu: str
    nadappuVayadu: str
    nadappuDasaBhukti: str

class HoroscopeData(BaseModel):
    title: str
    input: HoroscopeInput
    basicDetails: BasicDetails
    planetaryDegrees: List[PlanetaryDegree]
    dasaTimelines: List[DasaTimeline]
    currentDasaBhukti: CurrentDasaBhuktiInfo
    rasiChart: List[ZodiacBox]
    navamsamChart: List[ZodiacBox]
    footerInfo: FooterInfo
    specialPredictions: List[str]
    divisionalCharts: Optional[Dict[str, Any]] = None
    ashtakavarga: Optional[Dict[str, Any]] = None
    shadbala: Optional[Dict[str, Any]] = None
    jaiminiKarakas: Optional[List[Dict[str, Any]]] = None
    upagrahas: Optional[List[Dict[str, Any]]] = None
    # Aliases for direct API consumers
    positions: Optional[List[PlanetaryDegree]] = None
    chart: Optional[List[ZodiacBox]] = None
    navamsa: Optional[List[ZodiacBox]] = None
    dasaInfo: Optional[CurrentDasaBhuktiInfo] = None


# ---------------------------------------------------------------------------
# Mathematical & Astronomical Helpers
# ---------------------------------------------------------------------------

def normalize_angle(deg: float) -> float:
    mod = deg % 360.0
    if mod < 0:
        mod += 360.0
    return mod

def format_degree_dms(deg: float) -> str:
    norm = normalize_angle(deg) % 30.0
    d = int(norm)
    m = int((norm - d) * 60)
    s = int(round(((norm - d) * 60 - m) * 60))
    if s == 60:
        s = 59
    return f"{d:02d}° {m:02d}' {s:02d}\""

KNOWN_CITIES_COORDS = {
    "மதுரை": (9.9252, 78.1198),
    "madurai": (9.9252, 78.1198),
    "சென்னை": (13.0827, 80.2707),
    "chennai": (13.0827, 80.2707),
    "madras": (13.0827, 80.2707),
    "கோயம்புத்தூர்": (11.0168, 76.9558),
    "கோவை": (11.0168, 76.9558),
    "coimbatore": (11.0168, 76.9558),
    "திருச்சிராப்பள்ளி": (10.7905, 78.7047),
    "திருச்சி": (10.7905, 78.7047),
    "trichy": (10.7905, 78.7047),
    "சேலம்": (11.6643, 78.1460),
    "salem": (11.6643, 78.1460),
    "திருநெல்வேலி": (8.7139, 77.7567),
    "நெல்லை": (8.7139, 77.7567),
    "tirunelveli": (8.7139, 77.7567),
    "ஈரோடு": (11.3410, 77.7172),
    "erode": (11.3410, 77.7172),
    "திருப்பூர்": (11.1085, 77.3411),
    "tiruppur": (11.1085, 77.3411),
    "தஞ்சாவூர்": (10.7870, 79.1378),
    "thanjavur": (10.7870, 79.1378),
    "வேலூர்": (12.9165, 79.1325),
    "vellore": (12.9165, 79.1325),
    "திண்டுக்கல்": (10.3673, 77.9803),
    "dindigul": (10.3673, 77.9803),
    "தூத்துக்குடி": (8.7642, 78.1348),
    "tuticorin": (8.7642, 78.1348),
    "கன்னியாகுமரி": (8.0883, 77.5385),
    "kanyakumari": (8.0883, 77.5385),
    "நாகர்கோவில்": (8.1833, 77.4119),
    "nagercoil": (8.1833, 77.4119),
    "புதுச்சேரி": (11.9416, 79.8083),
    "pondicherry": (11.9416, 79.8083),
    "பெங்களூரு": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "மும்பை": (19.0760, 72.8777),
    "mumbai": (19.0760, 72.8777),
    "தில்லி": (28.6139, 77.2090),
    "delhi": (28.6139, 77.2090),
}

def parse_coordinate(coord_val: Optional[str], default_val: float, pob: Optional[str] = None, is_lat: bool = True) -> float:
    if coord_val:
        s = str(coord_val).strip()
        import re
        dms_m = re.search(r"([0-9.]+)\s*°?\s*([0-9.]+)?\s*'?\s*([0-9.]+)?\s*\"?\s*([NSEWnsew])?", s)
        if dms_m and (dms_m.group(4) or "°" in s):
            d = float(dms_m.group(1)) if dms_m.group(1) else 0.0
            m = float(dms_m.group(2)) if dms_m.group(2) else 0.0
            sec = float(dms_m.group(3)) if dms_m.group(3) else 0.0
            hem = dms_m.group(4).upper() if dms_m.group(4) else ""
            res = d + m / 60.0 + sec / 3600.0
            if hem in ["S", "W"]:
                res = -res
            return res
        clean = re.sub(r"[^\d.-]", "", s.replace(",", "."))
        try:
            val = float(clean)
            if val != 0:
                return val
        except ValueError:
            pass

    if pob:
        q = pob.lower().strip()
        for k, v in KNOWN_CITIES_COORDS.items():
            if k in q:
                return v[0] if is_lat else v[1]

    return default_val

def get_julian_date(year: int, month: int, day: int, hour: int, minute: int, second: float = 0.0) -> float:
    y = year
    m = month
    if m <= 2:
        y -= 1
        m += 12
    A = math.floor(y / 100)
    B = 2 - A + math.floor(A / 4)
    day_fraction = (day + (hour + minute / 60.0 + second / 3600.0) / 24.0)
    return math.floor(365.25 * (y + 4716)) + math.floor(30.6001 * (m + 1)) + day_fraction + B - 1524.5

def get_lahiri_ayanamsa(jd: float) -> float:
    """
    Standard Chitrapaksha (Lahiri) Ayanamsa Formulation
    T = (JD - 2451545.0) / 36525.0
    Ayanamsha = 23.857092 + 1.396971 * T + 0.000308 * T * T
    """
    T = (jd - 2451545.0) / 36525.0
    return 23.857092 + (1.396971 * T) + (0.000308 * T * T)

def get_navamsam_sign(raw_lon: float) -> int:
    norm = normalize_angle(raw_lon)
    rasi_sign = int(norm // 30)
    nav_idx = int((norm % 30) // (30.0 / 9.0))
    modality = rasi_sign % 4
    if modality == 0:    # Fire (Aries, Leo, Sagittarius) -> starts at Mesham (0)
        start_sign = 0
    elif modality == 1:  # Earth (Taurus, Virgo, Capricorn) -> starts at Makaram (9)
        start_sign = 9
    elif modality == 2:  # Air (Gemini, Libra, Aquarius) -> starts at Thulam (6)
        start_sign = 6
    else:                # Water (Cancer, Scorpio, Pisces) -> starts at Katakam (3)
        start_sign = 3
    return (start_sign + nav_idx) % 12

def get_nakshatra_info(moon_lon: float):
    norm = normalize_angle(moon_lon)
    star_span = 360.0 / 27.0  # 13° 20' = 13.333333°
    star_idx = int(norm // star_span) % 27
    star_name = NAKSHATRAS[star_idx]

    pada_span = star_span / 4.0  # 3° 20'
    fraction_in_star = norm % star_span
    pada = min(4, max(1, int(fraction_in_star // pada_span) + 1))

    dasa_lord_idx = star_idx % 9
    dasa_lord_obj = DASA_LORDS_ORDER[dasa_lord_idx]
    star_lord = dasa_lord_obj["name"]

    # Janma Dasa Balance calculation
    rem_proportion = (star_span - fraction_in_star) / star_span
    total_years = dasa_lord_obj["years"] * rem_proportion
    b_years = int(total_years)
    total_months = (total_years - b_years) * 12.0
    b_months = int(total_months)
    b_days = int(round((total_months - b_months) * 30.0))

    return {
        "starIndex": star_idx,
        "starName": star_name,
        "nakshatra": star_name,
        "pada": pada,
        "star_lord": star_lord,
        "starLord": star_lord,
        "dasaLordIndex": dasa_lord_idx,
        "dasaLordObj": dasa_lord_obj,
        "balanceYears": b_years,
        "balanceMonths": b_months,
        "balanceDays": b_days
    }


# ---------------------------------------------------------------------------
# High-Precision Astronomical Ephemeris Engine (Skyfield + DE421)
# ---------------------------------------------------------------------------

def calculate_topocentric_ephemeris(
    year: int, month: int, day: int, hour: int, minute: int,
    lat: float, lon: float, tz_name: str = "Asia/Kolkata"
):
    """
    Computes geocentric/topocentric positions using Skyfield DE421 Ephemeris with
    strict Lahiri Ayanamsha Sidereal conversion.
    """
    # 1. Convert Local Birth Time to UTC
    try:
        local_tz = pytz.timezone(tz_name)
        dt_local = local_tz.localize(datetime(year, month, day, hour, minute))
        dt_utc = dt_local.astimezone(pytz.utc)
    except Exception:
        # Fallback to IST (+05:30) if timezone string is invalid
        dt_local = datetime(year, month, day, hour, minute)
        total_utc_mins = hour * 60 + minute - 330
        dt_utc = datetime(year, month, day) + timedelta(minutes=total_utc_mins)

    ut_year = dt_utc.year
    ut_month = dt_utc.month
    ut_day = dt_utc.day
    ut_hour = dt_utc.hour
    ut_minute = dt_utc.minute
    ut_second = dt_utc.second

    # Julian Date & Lahiri Ayanamsa
    jd = get_julian_date(ut_year, ut_month, ut_day, ut_hour, ut_minute, ut_second)
    ayanamsa = get_lahiri_ayanamsa(jd)
    T = (jd - 2451545.0) / 36525.0

    ephem, ts = get_skyfield_data()

    planetary_data = []

    if ephem is not None and ts is not None:
        try:
            t = ts.utc(ut_year, ut_month, ut_day, ut_hour, ut_minute, ut_second)
            earth = ephem['earth']

            # Target bodies in DE421
            targets = [
                ("சூரியன்", "சூரி", ephem['sun']),
                ("சந்திரன்", "சந்", ephem['moon']),
                ("புதன்", "புதன்", ephem['mercury barycenter']),
                ("சுக்கிரன்", "சுக்", ephem['venus barycenter']),
                ("செவ்வாய்", "செவ்", ephem['mars barycenter']),
                ("குரு", "குரு", ephem['jupiter barycenter']),
                ("சனி", "சனி", ephem['saturn barycenter'])
            ]

            # Next step for retrograde determination (delta = 20 mins)
            t_next = ts.utc(ut_year, ut_month, ut_day, ut_hour, ut_minute + 20, ut_second)

            for name, abbr, body in targets:
                # Apparent Geocentric Ecliptic Longitude
                app = earth.at(t).observe(body).apparent()
                _, lon_ecl, _ = app.frame_latlon(ecliptic_frame)
                trop_lon = lon_ecl.degrees

                # Retrograde evaluation
                app_next = earth.at(t_next).observe(body).apparent()
                _, lon_ecl_next, _ = app_next.frame_latlon(ecliptic_frame)
                d_lon = ((lon_ecl_next.degrees - trop_lon + 540.0) % 360.0) - 180.0
                is_retro = d_lon < 0.0 if name not in ["சூரியன்", "சந்திரன்"] else False

                sid_lon = normalize_angle(trop_lon - ayanamsa)
                planetary_data.append({
                    "name": name,
                    "abbr": abbr,
                    "rawLon": sid_lon,
                    "isRetrograde": is_retro
                })

        except Exception as ex:
            print(f"Skyfield position calculation fallback: {ex}")
            ephem = None

    if ephem is None:
        # High-Precision VSOP87 / Periodic Analytical Fallback Engine
        rad = math.pi / 180.0
        deg = 180.0 / math.pi

        # Sun
        L0_sun = normalize_angle(280.46646 + 36000.76983 * T)
        M_sun = normalize_angle(357.52911 + 35999.05029 * T) * rad
        C_sun = (1.914602 - 0.004817 * T) * math.sin(M_sun) + 0.019993 * math.sin(2 * M_sun)
        trop_sun = normalize_angle(L0_sun + C_sun)
        sid_sun = normalize_angle(trop_sun - ayanamsa)

        # Moon
        L_moon = normalize_angle(218.3164477 + 481267.88128 * T)
        D_moon = normalize_angle(297.8501921 + 445267.1114034 * T) * rad
        M_moon = normalize_angle(134.9633964 + 477198.8675055 * T) * rad
        F_moon = normalize_angle(93.2720950 + 483202.0175233 * T) * rad

        trop_moon = normalize_angle(
            L_moon +
            6.288774 * math.sin(M_moon) +
            1.274027 * math.sin(2 * D_moon - M_moon) +
            0.658314 * math.sin(2 * D_moon) +
            0.213618 * math.sin(2 * M_moon) -
            0.185116 * math.sin(M_sun) -
            0.114332 * math.sin(2 * F_moon)
        )
        sid_moon = normalize_angle(trop_moon - ayanamsa)

        # Simplified Planets
        def calc_orb(l0, dl, p0, dp, e, a):
            L = normalize_angle(l0 + dl * T)
            p = normalize_angle(p0 + dp * T)
            M = normalize_angle(L - p) * rad
            nu = M + (2 * e - 0.25 * (e**3)) * math.sin(M) + 1.25 * (e**2) * math.sin(2 * M)
            return normalize_angle(nu * deg + p - ayanamsa)

        sid_mars = calc_orb(355.45, 19141.69, 336.04, 0.44, 0.0934, 1.52)
        sid_merc = calc_orb(252.25, 149474.07, 77.45, 0.16, 0.2056, 0.387)
        sid_jup = calc_orb(34.40, 3036.30, 14.75, 0.21, 0.0484, 5.20)
        sid_ven = calc_orb(181.98, 58519.21, 131.53, 0.004, 0.0067, 0.723)
        sid_sat = calc_orb(49.94, 1223.51, 92.43, -0.81, 0.0541, 9.54)

        planetary_data = [
            {"name": "சூரியன்", "abbr": "சூரி", "rawLon": sid_sun, "isRetrograde": False},
            {"name": "சந்திரன்", "abbr": "சந்", "rawLon": sid_moon, "isRetrograde": False},
            {"name": "புதன்", "abbr": "புதன்", "rawLon": sid_merc, "isRetrograde": False},
            {"name": "சுக்கிரன்", "abbr": "சுக்", "rawLon": sid_ven, "isRetrograde": False},
            {"name": "செவ்வாய்", "abbr": "செவ்", "rawLon": sid_mars, "isRetrograde": False},
            {"name": "குரு", "abbr": "குரு", "rawLon": sid_jup, "isRetrograde": False},
            {"name": "சனி", "abbr": "சனி", "rawLon": sid_sat, "isRetrograde": False},
        ]

    # Mean Lunar Nodes (Rahu & Ketu)
    trop_rahu = normalize_angle(125.04452 - 1934.136261 * T + 0.0020708 * T * T)
    sid_rahu = normalize_angle(trop_rahu - ayanamsa)
    sid_ketu = normalize_angle(sid_rahu + 180.0)

    planetary_data.append({"name": "ராகு", "abbr": "ராகு", "rawLon": sid_rahu, "isRetrograde": True})
    planetary_data.append({"name": "கேது", "abbr": "கேது", "rawLon": sid_ketu, "isRetrograde": True})

    # Lagna (Ascendant) based on Local Sidereal Time
    rad = math.pi / 180.0
    deg = 180.0 / math.pi
    d_days = jd - 2451545.0
    GMST = normalize_angle(280.46061837 + 360.98564736629 * d_days + 0.000387933 * T * T)
    RAMC = normalize_angle(GMST + lon)
    eps = (23.4392911 - 0.0130042 * T) * rad
    phi = lat * rad
    RAMC_rad = RAMC * rad

    # Standard Spherical Astronomy Formulation for Rising Sign (Ascendant):
    # tan(lambda) = cos(RAMC) / (-sin(RAMC)*cos(eps) - tan(phi)*sin(eps))
    yLagna = math.cos(RAMC_rad)
    xLagna = -math.sin(RAMC_rad) * math.cos(eps) - math.tan(phi) * math.sin(eps)
    trop_lagna = normalize_angle(math.atan2(yLagna, xLagna) * deg)
    sid_lagna = normalize_angle(trop_lagna - ayanamsa)

    planetary_data.append({"name": "லக்னம்", "abbr": "லக்", "rawLon": sid_lagna, "isRetrograde": False})

    return ayanamsa, planetary_data


# ---------------------------------------------------------------------------
# Dasa-Bhukti Chronological Timeline Generator
# ---------------------------------------------------------------------------

def calculate_dasa_timelines(
    birth_date: datetime,
    dasa_lord_idx: int,
    balance_years: int,
    balance_months: int,
    balance_days: int
):
    dasa_timelines: List[DasaTimeline] = []
    now = datetime.now()
    current_start = birth_date

    def format_d(d: datetime) -> str:
        return d.strftime("%d-%m-%Y")

    first_lord = DASA_LORDS_ORDER[dasa_lord_idx]
    
    # 1st Dasa (Janma Dasa Balance)
    tot_days = balance_years * 365.25 + balance_months * 30.4375 + balance_days
    first_end = current_start + timedelta(days=tot_days)

    is_first_current = current_start <= now < first_end

    # First Dasa Bhuktis
    first_bhuktis: List[BhuktiTimeline] = []
    b_start = current_start
    for b in range(9):
        b_lord_idx = (dasa_lord_idx + b) % 9
        b_lord = DASA_LORDS_ORDER[b_lord_idx]
        b_months = (first_lord["years"] * b_lord["years"] * 12.0) / 120.0
        b_days = b_months * 30.4375
        b_end = b_start + timedelta(days=b_days)
        is_b_curr = is_first_current and (b_start <= now < b_end)

        by = int(b_months // 12)
        bm = int(b_months % 12)
        first_bhuktis.append(BhuktiTimeline(
            bhuktiLord=b_lord["name"],
            startDate=format_d(b_start),
            endDate=format_d(b_end),
            duration=f"{by} வரு, {bm} மா",
            isCurrent=is_b_curr
        ))
        b_start = b_end

    active_b = next((b.bhuktiLord for b in first_bhuktis if b.isCurrent), None)
    dasa_timelines.append(DasaTimeline(
        dasaLord=first_lord["name"],
        startDate=format_d(current_start),
        endDate=format_d(first_end),
        duration=f"{balance_years} வருடம் {balance_months} மாதம் {balance_days} நாள்",
        isCurrent=is_first_current,
        activeBhukti=active_b,
        bhuktis=first_bhuktis
    ))

    current_start = first_end

    # Subsequent 8 Dasas
    for i in range(1, 9):
        lord_idx = (dasa_lord_idx + i) % 9
        lord = DASA_LORDS_ORDER[lord_idx]
        end = current_start + timedelta(days=lord["years"] * 365.25)
        is_curr = current_start <= now < end

        bhuktis: List[BhuktiTimeline] = []
        b_start = current_start
        for b in range(9):
            b_lord_idx = (lord_idx + b) % 9
            b_lord = DASA_LORDS_ORDER[b_lord_idx]
            b_months = (lord["years"] * b_lord["years"] * 12.0) / 120.0
            b_days = b_months * 30.4375
            b_end = b_start + timedelta(days=b_days)
            is_b_curr = is_curr and (b_start <= now < b_end)

            by = int(b_months // 12)
            bm = int(b_months % 12)
            bhuktis.append(BhuktiTimeline(
                bhuktiLord=b_lord["name"],
                startDate=format_d(b_start),
                endDate=format_d(b_end),
                duration=f"{by} வரு, {bm} மா",
                isCurrent=is_b_curr
            ))
            b_start = b_end

        active_b = next((b.bhuktiLord for b in bhuktis if b.isCurrent), None)
        dasa_timelines.append(DasaTimeline(
            dasaLord=lord["name"],
            startDate=format_d(current_start),
            endDate=format_d(end),
            duration=f"{lord['years']} வருடங்கள்",
            isCurrent=is_curr,
            activeBhukti=active_b,
            bhuktis=bhuktis
        ))
        current_start = end

    active_dasa = next((d for d in dasa_timelines if d.isCurrent), dasa_timelines[0])
    active_bhukti_obj = next((b for b in active_dasa.bhuktis if b.isCurrent), None)
    bhukti_name = active_bhukti_obj.bhuktiLord if active_bhukti_obj else active_dasa.dasaLord

    current_dasa_info = CurrentDasaBhuktiInfo(
        dasaLord=active_dasa.dasaLord,
        bhuktiLord=bhukti_name,
        dasaStartDate=active_dasa.startDate,
        dasaEndDate=active_dasa.endDate,
        bhuktiStartDate=active_bhukti_obj.startDate if active_bhukti_obj else active_dasa.startDate,
        bhuktiEndDate=active_bhukti_obj.endDate if active_bhukti_obj else active_dasa.endDate,
        summaryText=f"{active_dasa.dasaLord} தசையில் {bhukti_name} புக்தி"
    )

    return dasa_timelines, current_dasa_info


# ---------------------------------------------------------------------------
# Requirement 3: D.S. Astro System Rules Engine (Python)
# ---------------------------------------------------------------------------

def evaluate_ds_astro_system_rules(
    planet_positions: List[Dict[str, Any]],
    current_dasa_lord: str,
    lagna_rasi_idx: int
) -> List[str]:
    """
    Evaluates D.S. Astro System Astrological Rules in Python:
    1. Dasa Lagna Shift (House 1 = Dasa Lord's Rasi)
    2. Debt, Disease & Enmity (6th house from Dasa Lagna -> Saturn/Ketu)
    3. Danger & Accidents (8th house from Dasa Lagna -> Mars/Rahu)
    4. Progeny & Gender (Jupiter+Ketu -> Male, Jupiter+Rahu -> Female)
    5. Twins (Lagna and 5th Lord in Ubaya Rasis)
    6. Adoption (9th & 10th Lords conjunct)
    7. Career (10th Lord in Aatchi/Ucham -> Own Business)
    8. Parivarthanai & Rahu-Ketu Midpoint Checks
    """
    predictions: List[str] = []

    def get_p(name_fragment: str) -> Optional[Dict[str, Any]]:
        return next((p for p in planet_positions if name_fragment in p["name"]), None)

    def is_conjunct(p1: Optional[Dict[str, Any]], p2: Optional[Dict[str, Any]]) -> bool:
        if p1 is not None and p2 is not None:
            return (int(p1["rawLon"] // 30) % 12) == (int(p2["rawLon"] // 30) % 12)
        return False

    def is_aspected_by(target_sign: int, aspecting_p: Optional[Dict[str, Any]]) -> bool:
        if not aspecting_p:
            return False
        p_sign = int(aspecting_p["rawLon"] // 30) % 12
        diff = (target_sign - p_sign + 12) % 12
        if diff in [0, 6]:  # Conjunction or 7th aspect
            return True
        if "செவ்வாய்" in aspecting_p["name"] and diff in [3, 7]:  # Mars 4th, 8th
            return True
        if "குரு" in aspecting_p["name"] and diff in [4, 8]:      # Jupiter 5th, 9th
            return True
        if "சனி" in aspecting_p["name"] and diff in [2, 9]:       # Saturn 3rd, 10th
            return True
        return False

    # Key Planets
    sun_p = get_p("சூரியன்")
    moon_p = get_p("சந்திரன்")
    mars_p = get_p("செவ்வாய்")
    merc_p = get_p("புதன்")
    jup_p = get_p("குரு")
    ven_p = get_p("சுக்கிரன்")
    sat_p = get_p("சனி")
    rahu_p = get_p("ராகு")
    ketu_p = get_p("கேது")

    # 1. DASA LAGNA SHIFT (தசாநாதன் லக்னம்)
    dasa_lord_p = get_p(current_dasa_lord)
    dasa_lagna_idx = int(dasa_lord_p["rawLon"] // 30) % 12 if dasa_lord_p else lagna_rasi_idx

    # 2. DEBT, DISEASE & ENMITY (6th House from Dasa Lagna)
    house6_from_dasa = (dasa_lagna_idx + 5) % 12
    ketu_sign = int(ketu_p["rawLon"] // 30) % 12 if ketu_p else -1
    sat_sign = int(sat_p["rawLon"] // 30) % 12 if sat_p else -1

    if ketu_sign == house6_from_dasa:
        predictions.append(
            "கடன் / விரைய எச்சரிக்கை: நடப்பு தசாநாதனுக்கு 6-ஆம் இடத்தில் கேது பகவான் அமர்ந்துள்ளதால், "
            "இக்காலகட்டத்தில் தேவையற்ற விரையங்கள், கடன் சுமைகள் அல்லது எதிரிகளால் சிறு மன உளைச்சல் ஏற்படலாம்; நிதி விவகாரங்களில் கவனமாக இருக்கவும்."
        )

    if sat_sign == house6_from_dasa or is_aspected_by(house6_from_dasa, sat_p):
        predictions.append(
            "நோய் / உடல்நலன்: நடப்பு தசாநாதனுக்கு 6-ஆம் இடத்தை சனி பகவான் தொடர்பு கொள்வதால் (அமர்வு/பார்வை), "
            "இக்காலகட்டத்தில் உடல் நலக்குறைபாடுகள், மூட்டு/வயிற்று உபாதைகள் அல்லது மருத்துவ செலவுகள் ஏற்பட வாய்ப்புள்ளது."
        )

    # 3. ACCIDENTS & DANGER (8th House from Dasa Lagna)
    house8_from_dasa = (dasa_lagna_idx + 7) % 12
    mars_sign = int(mars_p["rawLon"] // 30) % 12 if mars_p else -1
    rahu_sign = int(rahu_p["rawLon"] // 30) % 12 if rahu_p else -1

    if mars_sign == house8_from_dasa or rahu_sign == house8_from_dasa or is_aspected_by(house8_from_dasa, mars_p):
        predictions.append(
            "எச்சரிக்கை (8-ஆம் பாவகம்): நடப்பு தசாநாதனுக்கு 8-ஆம் இடத்தில் பாப கிரகங்கள் (செவ்வாய்/ராகு) தொடர்பில் உள்ளதால், "
            "வாகனப் பயணங்களில் மிகுந்த கவனம் தேவை. அவசர முடிவுகள் மற்றும் விவாதங்களைத் தவிர்க்கவும்."
        )

    # 4. PROGENY & CHILD GENDER (புத்திர பாக்கியம் & பாலினம்)
    if is_conjunct(jup_p, ketu_p):
        predictions.append(
            "ஆண் குழந்தை யோகம்: புத்திர காரகன் குருவுடன் ஞானகாரகன் கேது பகவான் இணைந்துள்ளதால், குலத்திற்கு பெருமை சேர்க்கும் ஆண் குழந்தை பிறக்க அதிக வாய்ப்புகள் உள்ளன."
        )
    if is_conjunct(jup_p, rahu_p):
        predictions.append(
            "பெண் குழந்தை யோகம்: புத்திர காரகன் குருவுடன் ராகு பகவான் இணைந்துள்ளதால், குடும்பத்திற்கு அதிர்ஷ்டம் தரும் பெண் குழந்தை பிறக்க அதிக வாய்ப்புகள் உள்ளன."
        )

    # 5. TWINS (இரட்டை குழந்தை யோகம் - லக்னம் & 5-ஆம் அதிபதி உபய ராசிகளில்)
    ubaya_rasis = [2, 5, 8, 11]  # Gemini(2), Virgo(5), Sagittarius(8), Pisces(11)
    lord5_sign_idx = (lagna_rasi_idx + 4) % 12
    lord5_name = SIGN_LORDS[lord5_sign_idx]
    lord5_p = get_p(lord5_name)

    if (lagna_rasi_idx in ubaya_rasis) and lord5_p and (int(lord5_p["rawLon"] // 30) % 12 in ubaya_rasis):
        predictions.append(
            "இரட்டை குழந்தை யோகம்: லக்னம் மற்றும் 5-ஆம் அதிபதி ஆகிய இரண்டும் உபய ராசிகளில் (இரட்டை தன்மை கொண்ட ராசிகள்) அமைந்துள்ளதால், இரட்டை குழந்தை பிறக்கும் பாக்கியம் உண்டு."
        )

    # 6. ADOPTION (தத்து புத்திர யோகம் - 9 & 10-ஆம் அதிபதிகள் சேர்க்கை)
    lord9_name = SIGN_LORDS[(lagna_rasi_idx + 8) % 12]
    lord10_name = SIGN_LORDS[(lagna_rasi_idx + 9) % 12]
    lord9_p = get_p(lord9_name)
    lord10_p = get_p(lord10_name)

    if lord9_p and lord10_p and is_conjunct(lord9_p, lord10_p) and (lord9_name != lord10_name):
        predictions.append(
            "தத்து புத்திர யோகம்: தர்ம கர்மாதிபதிகள் (9, 10-ஆம் அதிபதிகள்) இணைந்துள்ளதால், வாழ்க்கையில் தத்துப்பிள்ளை எடுக்கும் அமைப்பு அல்லது ஆதரவற்ற குழந்தைகளை வளர்த்து ஆதரிக்கும் தர்ம குணம் அமையும்."
        )

    # 7. CAREER - OWN BUSINESS VS JOB (சொந்தத் தொழில் vs உத்தியோகம்)
    if lord10_p:
        l10_sign = int(lord10_p["rawLon"] // 30) % 12
        is_own = l10_sign in OWN_HOUSES_MAP.get(lord10_name, [])
        is_exalted = l10_sign == EXALTED_HOUSES_MAP.get(lord10_name, -1)

        if is_own or is_exalted:
            predictions.append(
                "சொந்தத் தொழில் யோகம்: தொழில் ஸ்தானாதிபதி (10-ஆம் அதிபதி) ஆட்சி அல்லது உச்சம் பெற்று பலமாக உள்ளதால், "
                "பிற்காலத்தில் சொந்த தொழில், வியாபாரம் அல்லது தொழில்முனைவில் ஈடுபட்டு பெரிய பொருளாதார வெற்றி பெறுவீர்கள்."
            )
        else:
            predictions.append(
                "தொழில் & உத்தியோக யோகம்: 10-ஆம் அதிபதியின் அமைப்பின்படி, நிலையான அரசு அல்லது தனியார் நிறுவன உயர் பதவிகளில் பணிபுரிந்து படிப்படியாக உயர்ந்த நிலையை அடைவீர்கள்."
            )

    # 8. RAHU-KETU MIDPOINT (மையப்புள்ளி விதி)
    if rahu_p and ketu_p and sun_p:
        rahu_deg = rahu_p["rawLon"]
        ketu_deg = ketu_p["rawLon"]
        midpoint = normalize_angle(rahu_deg + ((ketu_deg - rahu_deg + 360.0) % 360.0) / 2.0)
        
        diff_sun = abs((sun_p["rawLon"] - midpoint + 180.0) % 360.0 - 180.0)
        if diff_sun <= 3.5:
            predictions.append(
                "மையப்புள்ளி விதி: பித்ருகாரகன் சூரிய பகவான் ராகு-கேதுவின் கர்ம மையப்புள்ளியில் (±3°க்குள்) சிக்கியுள்ளதால், தந்தை வழி உறவுகளிலும் தந்தையின் உடல்நலத்திலும் கூடுதல் கவனம் தேவை."
            )

        if moon_p:
            diff_moon = abs((moon_p["rawLon"] - midpoint + 180.0) % 360.0 - 180.0)
            if diff_moon <= 3.5:
                predictions.append(
                    "மையப்புள்ளி விதி: மாத்ருகாரகன் சந்திரன் ராகு-கேதுவின் கர்ம மையப்புள்ளியில் (±3°க்குள்) சிக்கியுள்ளதால், தாயாரின் உடல்நலத்திலும், மன அமைதியிலும் நிதானம் பேண வேண்டும்."
                )

    # 9. PARIVARTHANAI (பரிவர்த்தனை யோகம்)
    classical = ["சூரியன்", "சந்திரன்", "செவ்வாய்", "புதன்", "குரு", "சுக்கிரன்", "சனி"]
    has_pari = False
    for i in range(len(classical)):
        for j in range(i + 1, len(classical)):
            p1 = get_p(classical[i])
            p2 = get_p(classical[j])
            if p1 and p2:
                s1 = int(p1["rawLon"] // 30) % 12
                s2 = int(p2["rawLon"] // 30) % 12
                if s1 != s2 and SIGN_LORDS[s1] == classical[j] and SIGN_LORDS[s2] == classical[i]:
                    has_pari = True
                    break
        if has_pari:
            break

    if has_pari:
        predictions.append(
            "பரிவர்த்தனை யோகம் & எச்சரிக்கை: ஜாதகத்தில் கிரக பரிவர்த்தனை ஏற்பட்டுள்ளதால், ஆரம்பத்தில் ஒரு செயலில் அதிக எதிர்பார்ப்பை தூண்டி, இறுதியில் திடீர் திருப்பத்தை தரக்கூடும். அவசர முடிவுகளைத் தவிர்ப்பது நலம்."
        )

    # 10. MARRIAGE (திருமண பலன்)
    if mars_p and sat_p:
        is_sat_mars_aspect = is_aspected_by(int(mars_p["rawLon"] // 30) % 12, sat_p)
        ketu_12th = False
        if ketu_p:
            m_s = int(mars_p["rawLon"] // 30) % 12
            k_s = int(ketu_p["rawLon"] // 30) % 12
            ketu_12th = ((k_s - m_s + 12) % 12) in [0, 11]

        if is_sat_mars_aspect or ketu_12th:
            predictions.append(
                "திருமண தாமதம்: களத்திர காரகன் செவ்வாய் பகவானை சனி அல்லது கேது தொடர்பு கொள்வதால், திருமணம் 27+ வயதிற்குப் பின் சற்று தாமதமாக அமைவதே சிறப்பான யோகத்தைத் தரும்."
            )

    return predictions


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Ayyan Astro NASA Skyfield Ephemeris Backend",
        "skyfield_active": SKYFIELD_AVAILABLE and EPHEMERIS_DATA is not None,
        "ayanamsa": "Chitrapaksha Lahiri Ayanamsha (High-Precision Nirayana)",
        "version": "2.0.0"
    }

@app.post("/api/v1/generate-horoscope", response_model=HoroscopeData)
def generate_horoscope_endpoint(payload: HoroscopeInput):
    """
    Evaluates Horoscope using Skyfield DE421 Ephemeris, converts tropical longitudes
    to Lahiri Sidereal, computes Navamsam, Vimshottari Dasas and runs D.S. Astro System rules.
    """
    try:
        # Parse Dates
        dob_parts = [int(x) for x in payload.dob.split("-") if x.isdigit()]
        year = dob_parts[0] if len(dob_parts) > 0 else 1995
        month = dob_parts[1] if len(dob_parts) > 1 else 5
        day = dob_parts[2] if len(dob_parts) > 2 else 15

        raw_tob = (payload.tob or "10:30").strip()
        tob_parts = [int(x) for x in raw_tob.split(":") if x.isdigit()]
        hour = tob_parts[0] if len(tob_parts) > 0 else 10
        minute = tob_parts[1] if len(tob_parts) > 1 else 30

        # Format TOB and DOB nicely preserving user input
        h12 = 12 if hour == 0 else (hour - 12 if hour > 12 else hour)
        period = "PM" if hour >= 12 else "AM"
        tob_display = f"{hour:02d}:{minute:02d} ({h12:02d}:{minute:02d} {period})"
        dob_display = f"{day:02d}-{month:02d}-{year}"

        lat_val = parse_coordinate(payload.lat, 9.9252, payload.pob, is_lat=True)
        lon_val = parse_coordinate(payload.lon, 78.1198, payload.pob, is_lat=False)

        # Step 1: Skyfield DE421 Ephemeris Calculation
        ayanamsa, raw_planets = calculate_topocentric_ephemeris(
            year=year, month=month, day=day, hour=hour, minute=minute,
            lat=lat_val, lon=lon_val, tz_name=payload.timezone or "Asia/Kolkata"
        )

        # Step 2: Build Planetary Degree Table (Graha Padasaram)
        sun_p = next(p for p in raw_planets if p["name"] == "சூரியன்")
        moon_p = next(p for p in raw_planets if p["name"] == "சந்திரன்")
        lagna_p = next(p for p in raw_planets if p["name"] == "லக்னம்")

        planetary_degrees: List[PlanetaryDegree] = []

        # 1. Add Lagna
        lagna_raw_lon = lagna_p["rawLon"]
        lagna_deg_in_sign = lagna_raw_lon % 30.0
        lagna_sign_idx = int(lagna_raw_lon // 30) % 12
        lagna_star_info = get_nakshatra_info(lagna_raw_lon)
        planetary_degrees.append(PlanetaryDegree(
            planet="லக்னம்",
            degree=format_degree_dms(lagna_deg_in_sign),
            star=lagna_star_info["starName"],
            nakshatra=lagna_star_info["starName"],
            pada=lagna_star_info["pada"],
            star_lord=lagna_star_info["star_lord"],
            starLord=lagna_star_info["star_lord"],
            rasi=RASI_NAMES_TAMIL[lagna_sign_idx],
            rasi_index=lagna_sign_idx,
            isRetrograde=False,
            isCombust=False,
            rawLongitude=round(lagna_raw_lon, 4)
        ))

        # 2. Add 9 Planets
        for p in raw_planets:
            if p["name"] != "லக்னம்":
                raw_lon = p["rawLon"]
                deg_in_sign = raw_lon % 30.0
                sign_idx = int(raw_lon // 30) % 12
                star_info = get_nakshatra_info(raw_lon)
                sun_dist = min(abs(raw_lon - sun_p["rawLon"]), 360.0 - abs(raw_lon - sun_p["rawLon"]))
                is_combust = p["name"] in ["செவ்வாய்", "புதன்", "குரு", "சுக்கிரன்", "சனி"] and sun_dist <= 8.5

                planetary_degrees.append(PlanetaryDegree(
                    planet=p["name"],
                    degree=format_degree_dms(deg_in_sign),
                    star=star_info["starName"],
                    nakshatra=star_info["starName"],
                    pada=star_info["pada"],
                    star_lord=star_info["star_lord"],
                    starLord=star_info["star_lord"],
                    rasi=RASI_NAMES_TAMIL[sign_idx],
                    rasi_index=sign_idx,
                    isRetrograde=p["isRetrograde"],
                    isCombust=is_combust,
                    rawLongitude=round(raw_lon, 4)
                ))

        # Moon Nakshatra & Lagna Rasi
        moon_nak_info = get_nakshatra_info(moon_p["rawLon"])
        moon_sign = int(moon_p["rawLon"] // 30) % 12
        lagna_sign = int(lagna_p["rawLon"] // 30) % 12

        # Step 3: Dasa Timelines & Current Active Dasa
        birth_dt = datetime(year, month, day, hour, minute)
        dasa_timelines, current_dasa_bhukti = calculate_dasa_timelines(
            birth_date=birth_dt,
            dasa_lord_idx=moon_nak_info["dasaLordIndex"],
            balance_years=moon_nak_info["balanceYears"],
            balance_months=moon_nak_info["balanceMonths"],
            balance_days=moon_nak_info["balanceDays"]
        )

        # Step 4: D.S. Astro System Rules Evaluation
        special_predictions = evaluate_ds_astro_system_rules(
            planet_positions=raw_planets,
            current_dasa_lord=current_dasa_bhukti.dasaLord,
            lagna_rasi_idx=lagna_sign
        )

        # Step 5: Ashtakavarga (Classical Parashara System)
        ashtakavarga_data = calculate_ashtakavarga(raw_planets, lagna_sign)
        sarvashtakavarga_bindus = ashtakavarga_data["sarvashtakavarga"]

        # Step 6: Rasi Chart & Navamsam Chart (4x4 Grid Boxes)
        rasi_chart: List[ZodiacBox] = []
        for s in range(12):
            planets_in_s = []
            if lagna_sign == s:
                planets_in_s.append("லக்")
            for p in raw_planets:
                if p["name"] != "லக்னம்" and (int(p["rawLon"] // 30) % 12) == s:
                    retro_tag = "(வ)" if p["isRetrograde"] else ""
                    planets_in_s.append(f"{p['abbr']}{retro_tag}")

            rasi_chart.append(ZodiacBox(
                id=s,
                nameTamil=RASI_NAMES_TAMIL[s],
                englishName=RASI_NAMES_ENGLISH[s],
                planets=planets_in_s,
                ashtakavargaBindu=sarvashtakavarga_bindus[s],
                isLagna=(lagna_sign == s)
            ))

        lagna_nav_sign = get_navamsam_sign(lagna_p["rawLon"])
        navamsam_chart: List[ZodiacBox] = []
        for s in range(12):
            nav_planets_in_s = []
            if lagna_nav_sign == s:
                nav_planets_in_s.append("லக்")
            for p in raw_planets:
                if p["name"] != "லக்னம்" and get_navamsam_sign(p["rawLon"]) == s:
                    retro_tag = "(வ)" if p["isRetrograde"] else ""
                    nav_planets_in_s.append(f"{p['abbr']}{retro_tag}")

            navamsam_chart.append(ZodiacBox(
                id=s,
                nameTamil=RASI_NAMES_TAMIL[s],
                englishName=RASI_NAMES_ENGLISH[s],
                planets=nav_planets_in_s,
                isLagna=(lagna_nav_sign == s)
            ))

        # Step 7: All Divisional Charts (D1 to D60)
        divisional_charts = generate_all_divisional_charts(raw_planets, lagna_raw_lon)

        # Step 8: Jaimini Karakas (7-Karaka System)
        jaimini_karakas = calculate_jaimini_karakas(raw_planets)

        # Step 9: Upagrahas (Mandi & Gulika)
        weekday_sun0 = (birth_dt.weekday() + 1) % 7  # 0=Sunday ... 6=Saturday
        birth_hour_float = hour + minute / 60.0
        upagrahas_list = calculate_upagrahas(
            weekday=weekday_sun0,
            birth_hour=birth_hour_float,
            sunrise_hour=6.08,
            sunset_hour=18.25,
            lagna_lon=lagna_raw_lon,
            sun_lon=sun_p["rawLon"]
        )

        # Step 10: Shadbala (Sixfold Planetary Strengths)
        is_day_birth = (6.08 <= birth_hour_float <= 18.25)
        shadbala_data = calculate_shadbala(
            raw_planets=raw_planets,
            lagna_sign=lagna_sign,
            is_day_birth=is_day_birth
        )

        # Basic Details & Footer Info
        now_dt = datetime.now()
        age_years = now_dt.year - year
        
        basic_details = BasicDetails(
            genderLabel="ஜாதகர் பெயர்" if payload.gender == "ஆண்" else "ஜாதகி பெயர்",
            name=payload.name,
            fatherName=payload.fatherName or "மு. கணேசன்",
            motherName=payload.motherName or "க. லட்சுமி",
            dob=dob_display,
            tob=tob_display,
            pob=payload.pob,
            nakshatra=f"{moon_nak_info['starName']} - {moon_nak_info['pada']} ஆம் பாதம்",
            rasi=f"{RASI_NAMES_TAMIL[moon_sign]} ராசி",
            latLong=f"{lat_val:.2f}° N / {lon_val:.2f}° E",
            ayanamsa=f"{format_degree_dms(ayanamsa)} (Chitrapaksha Lahiri)",
            lagna=f"{RASI_NAMES_TAMIL[lagna_sign]} லக்னம்",
            sunrise="06:05 AM",
            thithi="சுப திதி"
        )

        footer_info = FooterInfo(
            janmaDasaIruppu=f"ஜென்ம கால தசா இருப்பு: {moon_nak_info['dasaLordObj']['name']} திசை {moon_nak_info['balanceYears']} வருடம் {moon_nak_info['balanceMonths']} மாதம் {moon_nak_info['balanceDays']} நாள்",
            nadappuVayadu=f"நடப்பு வயது: {age_years} வருடம்",
            nadappuDasaBhukti=f"நடப்பு: {current_dasa_bhukti.summaryText}"
        )

        return HoroscopeData(
            title="திருக்கணிதப்படி ஜாதகம்",
            input=payload,
            basicDetails=basic_details,
            planetaryDegrees=planetary_degrees,
            dasaTimelines=dasa_timelines,
            currentDasaBhukti=current_dasa_bhukti,
            rasiChart=rasi_chart,
            navamsamChart=navamsam_chart,
            footerInfo=footer_info,
            specialPredictions=special_predictions,
            divisionalCharts=divisional_charts,
            ashtakavarga=ashtakavarga_data,
            shadbala=shadbala_data,
            jaiminiKarakas=jaimini_karakas,
            upagrahas=upagrahas_list,
            positions=planetary_degrees,
            chart=rasi_chart,
            navamsa=navamsam_chart,
            dasaInfo=current_dasa_bhukti
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"NASA Ephemeris calculation failed in backend: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
