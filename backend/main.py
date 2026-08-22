"""
Ayyan Astro - Premium Astrology Python Backend
FastAPI service implementing:
1. Astronomical calculation engine simulation
2. D.S. Astro System secret astrological rules
3. Nadi directional conjunctions
4. Complete structured JSON responses for React frontend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, date, time
import math

app = FastAPI(
    title="Ayyan Astro Engine API",
    description="FastAPI Backend for Tamil Thirukanidappadi Horoscope & D.S. Astro System Engine",
    version="1.0.0"
)

# Enable CORS for React Frontend (allows localhost, preview domains and production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Pydantic Request & Response Models
# ---------------------------------------------------------------------------

class HoroscopeRequest(BaseModel):
    name: str = Field(..., example="க. பிரதீப் குமார்", description="Full Name")
    gender: str = Field(..., example="ஆண்", description="Gender (ஆண் / பெண் / இதர)")
    dob: str = Field(..., example="1998-05-18", description="Date of Birth (YYYY-MM-DD)")
    tob: str = Field(..., example="07:35", description="Time of Birth (HH:MM in 24h format)")
    pob: str = Field(..., example="மதுரை", description="Place of birth / City")
    father_name: Optional[str] = Field(default="மு. கணேசன்", description="Father's Name")
    mother_name: Optional[str] = Field(default="க. லட்சுமி", description="Mother's Name")

class PlanetPosition(BaseModel):
    planet: str
    tamil_name: str
    rasi_index: int  # 0: Mesham, 1: Rishabam, ..., 11: Meenam
    rasi_tamil: str
    rasi_english: str
    absolute_degree: float  # 0.0 to 360.0 degrees
    degree_in_rasi: str    # e.g., "14° 22' 10\""
    nakshatra: str
    pada: int
    is_retrograde: bool
    is_combust: bool

class DasaBhuktiInfo(BaseModel):
    current_dasa_lord: str
    current_bhukti_lord: str
    dasa_balance: str
    current_age: str
    dasa_end_date: str

class HoroscopeResponse(BaseModel):
    personal_info: Dict[str, Any]
    panchangam_details: Dict[str, Any]
    planetary_positions: List[PlanetPosition]
    dasa_bhukti: DasaBhuktiInfo
    special_predictions: List[str]
    ashtakavarga_bindus: Dict[str, int]


# ---------------------------------------------------------------------------
# Astrological Constants & Lookups
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

NAKSHATRAS = [
    "அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிஷம்", "திருவாதிரை",
    "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்",
    "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
    "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்",
    "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"
]

PLANET_TAMIL_MAP = {
    "Lagna": "லக்னம்",
    "Sun": "சூரியன்",
    "Moon": "சந்திரன்",
    "Mars": "செவ்வாய்",
    "Mercury": "புதன்",
    "Jupiter": "குரு",
    "Venus": "சுக்கிரன்",
    "Saturn": "சனி",
    "Rahu": "ராகு",
    "Ketu": "கேது"
}

# Nadi 4 Elemental Directions (1-5-9 Trines)
# East: Aries(0), Leo(4), Sagittarius(8) - Fire
# South: Taurus(1), Virgo(5), Capricorn(9) - Earth
# West: Gemini(2), Libra(6), Aquarius(10) - Air
# North: Cancer(3), Scorpio(7), Pisces(11) - Water
NADI_DIRECTIONS = {
    "East": [0, 4, 8],
    "South": [1, 5, 9],
    "West": [2, 6, 10],
    "North": [3, 7, 11]
}

def get_direction_for_rasi(rasi_idx: int) -> str:
    for direction, signs in NADI_DIRECTIONS.items():
        if rasi_idx in signs:
            return direction
    return "East"


# ---------------------------------------------------------------------------
# Requirement 2: Calculation Engine Simulation
# ---------------------------------------------------------------------------

def calculate_planetary_positions(dob_str: str, tob_str: str, pob: str) -> Dict[str, Any]:
    """
    Simulates high-precision astronomical calculations (Thirukanidappadi Lahiri Ayanamsa).
    Returns structured planetary data, degrees, Nakshatras, and Dasa details.
    """
    try:
        dt_dob = datetime.strptime(dob_str, "%Y-%m-%d")
        t_parts = [int(x) for x in tob_str.split(":")]
        hour = t_parts[0] if len(t_parts) > 0 else 7
        minute = t_parts[1] if len(t_parts) > 1 else 35
    except Exception:
        dt_dob = datetime(1998, 5, 18)
        hour, minute = 7, 35

    # Deterministic Seed based on exact birth coordinates
    seed = (dt_dob.year * 372 + dt_dob.month * 31 + dt_dob.day + hour * 13 + minute * 7) % 360
    
    # Lagna calculation based on birth hour & month
    lagna_deg = (seed * 1.37 + (hour * 15.0) + (minute * 0.25)) % 360.0
    lagna_rasi = int(lagna_deg // 30)

    # Planets simulation with realistic astrological spacing
    # Ketu is exactly 180 degrees opposite to Rahu
    rahu_deg = (seed * 1.73 + 45.0) % 360.0
    ketu_deg = (rahu_deg + 180.0) % 360.0

    raw_planets = [
        {"name": "Lagna", "deg": lagna_deg, "retro": False, "combust": False},
        {"name": "Sun", "deg": (seed * 0.98 + 42.0) % 360.0, "retro": False, "combust": False},
        {"name": "Moon", "deg": (seed * 2.45 + 115.0) % 360.0, "retro": False, "combust": False},
        {"name": "Mars", "deg": (seed * 1.15 + 85.0) % 360.0, "retro": False, "combust": False},
        {"name": "Mercury", "deg": (seed * 0.98 + 48.0) % 360.0, "retro": True, "combust": False},
        {"name": "Jupiter", "deg": (seed * 0.45 + 130.0) % 360.0, "retro": False, "combust": True},
        {"name": "Venus", "deg": (seed * 1.05 + 22.0) % 360.0, "retro": True, "combust": False},
        {"name": "Saturn", "deg": (seed * 0.32 + 10.0) % 360.0, "retro": True, "combust": False},
        {"name": "Rahu", "deg": rahu_deg, "retro": True, "combust": False},
        {"name": "Ketu", "deg": ketu_deg, "retro": True, "combust": False}
    ]

    # For demonstration of the rules, if user picks a specific combo we ensure realistic rule triggers
    # Check if Jupiter and Saturn align into the same Nadi direction
    jupiter_sign = int(raw_planets[5]["deg"] // 30)
    saturn_sign = int(raw_planets[7]["deg"] // 30)

    # Convert to structured PlanetPosition objects
    positions: List[PlanetPosition] = []
    positions_dict: Dict[str, Dict[str, Any]] = {}

    for p in raw_planets:
        total_deg = p["deg"]
        rasi_idx = int(total_deg // 30)
        deg_in_sign = total_deg % 30
        
        deg_int = int(deg_in_sign)
        min_int = int((deg_in_sign - deg_int) * 60)
        sec_int = int((((deg_in_sign - deg_int) * 60) - min_int) * 60)
        deg_str = f"{deg_int:02d}° {min_int:02d}' {sec_int:02d}\""

        # Nakshatra Calculation (each Nakshatra is 13° 20' = 13.3333°)
        nakshatra_idx = int(total_deg // (360.0 / 27.0)) % 27
        pada = int((total_deg % (360.0 / 27.0)) // (360.0 / 108.0)) + 1

        planet_obj = PlanetPosition(
            planet=p["name"],
            tamil_name=PLANET_TAMIL_MAP[p["name"]],
            rasi_index=rasi_idx,
            rasi_tamil=RASI_NAMES_TAMIL[rasi_idx],
            rasi_english=RASI_NAMES_ENGLISH[rasi_idx],
            absolute_degree=round(total_deg, 4),
            degree_in_rasi=deg_str,
            nakshatra=NAKSHATRAS[nakshatra_idx],
            pada=pada,
            is_retrograde=p["retro"],
            is_combust=p["combust"]
        )
        positions.append(planet_obj)
        positions_dict[p["name"]] = planet_obj.dict()

    # Dasa Calculation
    moon_pos = positions_dict["Moon"]
    moon_nak_idx = NAKSHATRAS.index(moon_pos["nakshatra"]) if moon_pos["nakshatra"] in NAKSHATRAS else 0
    dasa_lords_order = ["கேது", "சுக்கிரன்", "சூரியன்", "சந்திரன்", "செவ்வாய்", "ராகு", "குரு", "சனி", "புதன்"]
    current_dasa_lord = dasa_lords_order[moon_nak_idx % 9]
    bhukti_lord = "சுக்கிரன்" if current_dasa_lord == "புதன்" else "குரு"

    # Current Age
    current_year = datetime.now().year
    birth_year = dt_dob.year
    age_years = max(0, current_year - birth_year)

    dasa_info = DasaBhuktiInfo(
        current_dasa_lord=current_dasa_lord,
        current_bhukti_lord=bhukti_lord,
        dasa_balance=f"{current_dasa_lord} திசை 04 வருடம் 07 மாதம் 18 நாள்",
        current_age=f"{age_years} வருடம் 03 மாதம் 12 நாள்",
        dasa_end_date="14-11-2027"
    )

    return {
        "positions": positions,
        "positions_dict": positions_dict,
        "dasa_info": dasa_info
    }


# ---------------------------------------------------------------------------
# Requirement 3: The Rule Engine (D.S. Astro System & Nadi Logic)
# ---------------------------------------------------------------------------

def run_astrology_rules(chart_data: Dict[str, Any]) -> List[str]:
    """
    Executes secret astrological rules:
    1. Nadi Directional Conjunctions (Jupiter & Saturn in same elemental direction)
    2. D.S. Astro System - Rahu-Ketu Midpoint degree check with Sun/Moon (within ±3°)
    3. D.S. Astro System - Thasanathan Lagna (Ketu or Saturn in 6th, 8th, or 12th from Dasa Lord)
    """
    predictions: List[str] = []
    pos_dict = chart_data["positions_dict"]
    dasa_info: DasaBhuktiInfo = chart_data["dasa_info"]

    # -----------------------------------------------------------------------
    # Rule 1: Nadi Directional Conjunctions (Jupiter & Saturn in same direction)
    # -----------------------------------------------------------------------
    jup_pos = pos_dict.get("Jupiter")
    sat_pos = pos_dict.get("Saturn")

    if jup_pos and sat_pos:
        jup_direction = get_direction_for_rasi(jup_pos["rasi_index"])
        sat_direction = get_direction_for_rasi(sat_pos["rasi_index"])

        if jup_direction == sat_direction:
            predictions.append(
                f"ஜீவ - கர்ம யோகம்: குரு மற்றும் சனி ஒரே திசை ({jup_direction} / {jup_pos['rasi_tamil']}) தொடர்பில் இருப்பதால், "
                "ஜாதகர் தனது சுய உழைப்பால் தொழிலில் சிறப்பான நிலையை அடைவார்."
            )
        else:
            # Fallback Nadi directional pairing note
            predictions.append(
                f"நாடி திசை தொடர்பு: குரு ({jup_direction} திசை - {jup_pos['rasi_tamil']}), "
                f"சனி ({sat_direction} திசை - {sat_pos['rasi_tamil']}) அமைப்பில் உள்ளதால் கடின உழைப்பிற்கு பிறகே உயர்வு கிட்டும்."
            )

    # -----------------------------------------------------------------------
    # Rule 2: D.S. Astro System - Rahu-Ketu Midpoint Degree Check (±3°)
    # -----------------------------------------------------------------------
    rahu_pos = pos_dict.get("Rahu")
    ketu_pos = pos_dict.get("Ketu")
    sun_pos = pos_dict.get("Sun")
    moon_pos = pos_dict.get("Moon")

    if rahu_pos and ketu_pos and sun_pos:
        rahu_deg = rahu_pos["absolute_degree"]
        ketu_deg = ketu_pos["absolute_degree"]
        sun_deg = sun_pos["absolute_degree"]

        # Calculate shorter angular midpoint between Rahu and Ketu
        diff = (ketu_deg - rahu_deg) % 360.0
        midpoint_deg = (rahu_deg + (diff / 2.0)) % 360.0
        
        # Check if Sun is within ±3 degrees of this exact axis midpoint
        angular_dist_sun = abs((sun_deg - midpoint_deg + 180.0) % 360.0 - 180.0)
        
        if angular_dist_sun <= 3.0:
            predictions.append(
                "தந்தைக்கு கண்டம்: சூரியன் ராகு-கேது மையப்புள்ளியில் (Midpoint) உள்ளதால் தந்தையின் ஆரோக்கியத்தில் கூடுதல் கவனம் தேவை."
            )
        
        # Also verify for Moon
        if moon_pos:
            moon_deg = moon_pos["absolute_degree"]
            angular_dist_moon = abs((moon_deg - midpoint_deg + 180.0) % 360.0 - 180.0)
            if angular_dist_moon <= 3.0:
                predictions.append(
                    "தாய்க்கு கண்டம் & மன அழுத்தம்: சந்திரன் ராகு-கேது மையப்புள்ளியில் உள்ளதால் தாயாரின் உடல்நிலையில் கவனம் தேவை."
                )

    # -----------------------------------------------------------------------
    # Rule 3: D.S. Astro System - Thasanathan Lagna
    # -----------------------------------------------------------------------
    # Identify the Rasi where the Current Dasa Lord is posited
    # Map Tamil Dasa Lord Name back to English planet key
    dasa_lord_tamil = dasa_info.current_dasa_lord
    lord_key = "Mercury"  # default
    for eng_name, tam_name in PLANET_TAMIL_MAP.items():
        if tam_name in dasa_lord_tamil or dasa_lord_tamil in tam_name:
            lord_key = eng_name
            break

    dasa_lord_planet = pos_dict.get(lord_key)
    if dasa_lord_planet:
        dasa_lagna_rasi = dasa_lord_planet["rasi_index"]
        
        # Hidden houses from Dasa Lagna (6th, 8th, 12th)
        # 6th house = (dasa_lagna_rasi + 5) % 12
        # 8th house = (dasa_lagna_rasi + 7) % 12
        # 12th house = (dasa_lagna_rasi + 11) % 12
        dusthana_rasis = [
            (dasa_lagna_rasi + 5) % 12,
            (dasa_lagna_rasi + 7) % 12,
            (dasa_lagna_rasi + 11) % 12
        ]

        ketu_rasi = pos_dict["Ketu"]["rasi_index"] if "Ketu" in pos_dict else -1
        saturn_rasi = pos_dict["Saturn"]["rasi_index"] if "Saturn" in pos_dict else -1

        if ketu_rasi in dusthana_rasis or saturn_rasi in dusthana_rasis:
            predictions.append(
                f"தசாநாதன் லக்கின விதி: நடப்பு தசாநாதனான {dasa_lord_tamil}-க்கு மறைவு ஸ்தானங்களில் (6, 8, 12ல்) "
                "பாப கிரகங்கள் (சனி/கேது) உள்ளதால், இக்காலகட்டத்தில் தேவையற்ற விரையங்களும், கடன் சுமைகளும் ஏற்பட வாய்ப்புள்ளது."
            )
        else:
            predictions.append(
                f"தசாநாதன் லக்கின பலன்: நடப்பு தசாநாதனான {dasa_lord_tamil}-க்கு திரிகோண & கேந்திர ஸ்தானங்கள் சுபத்துவமாக உள்ளதால் "
                "தொழில் முன்னேற்றமும் பொருளாதார வரவும் சிறப்பாக இருக்கும்."
            )

    return predictions


# ---------------------------------------------------------------------------
# Requirement 1 & 4: API Endpoint & Comprehensive JSON Response
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Ayyan Astro FastAPI Engine",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

@app.post("/api/v1/generate-horoscope", response_model=HoroscopeResponse)
def generate_horoscope_endpoint(payload: HoroscopeRequest):
    """
    Main API endpoint:
    Receives birth details, calculates planetary longitudes, runs D.S. Astro & Nadi rules,
    and returns a complete structured JSON payload.
    """
    try:
        # Step 1: Run Astronomical Calculations
        calc_result = calculate_planetary_positions(
            dob_str=payload.dob,
            tob_str=payload.tob,
            pob=payload.pob
        )

        positions: List[PlanetPosition] = calc_result["positions"]
        dasa_info: DasaBhuktiInfo = calc_result["dasa_info"]

        # Step 2: Execute Rule Engine
        special_predictions = run_astrology_rules(calc_result)

        # Step 3: Format Personal & Panchangam Info
        dt_dob = datetime.strptime(payload.dob, "%Y-%m-%d")
        moon_pos = calc_result["positions_dict"]["Moon"]
        lagna_pos = calc_result["positions_dict"]["Lagna"]

        personal_info = {
            "name": payload.name,
            "gender": payload.gender,
            "dob_raw": payload.dob,
            "dob_formatted": dt_dob.strftime("%d-%m-%Y"),
            "tob": payload.tob,
            "pob": payload.pob,
            "father_name": payload.father_name,
            "mother_name": payload.mother_name,
            "janma_nakshatra": moon_pos["nakshatra"],
            "janma_rasi": moon_pos["rasi_tamil"],
            "lagna_rasi": lagna_pos["rasi_tamil"],
            "pada": moon_pos["pada"]
        }

        panchangam_details = {
            "ayanamsa": "24° 07' 22\" (Lahiri)",
            "paksham": "சுக்ல பட்சம்" if dt_dob.day % 2 == 0 else "கிருஷ்ண பட்சம்",
            "thithi": "பஞ்சமி",
            "nithya_yogam": "சித்த யோகம் / பிரீதி",
            "karanam": "பவ கரணம்",
            "sunrise": "06:12 AM",
            "sunset": "06:28 PM",
            "coordinates": "09° 55' N / 78° 07' E (Madurai Reference)"
        }

        ashtakavarga_bindus = {
            "Aries": 34, "Taurus": 41, "Gemini": 33, "Cancer": 28,
            "Leo": 29, "Virgo": 31, "Libra": 28, "Scorpio": 27,
            "Sagittarius": 29, "Capricorn": 28, "Aquarius": 22, "Pisces": 34
        }

        return HoroscopeResponse(
            personal_info=personal_info,
            panchangam_details=panchangam_details,
            planetary_positions=positions,
            dasa_bhukti=dasa_info,
            special_predictions=special_predictions,
            ashtakavarga_bindus=ashtakavarga_bindus
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calculating horoscope in Astro Engine: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
