"""
HOROSCOPNEE MASTER CALCULATION ENGINE - PURE MATHEMATICAL MODULE
High-Precision Divisional Charts (D1-D60), Jaimini Karakas, Upagrahas (Mandi/Gulika),
Classical Parashara Ashtakavarga (BAV/SAV), and Sixfold Planetary Strengths (Shadbala).
"""

import math
from typing import List, Dict, Any, Tuple

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

def normalize_angle(deg: float) -> float:
    mod = deg % 360.0
    return mod + 360.0 if mod < 0 else mod

def format_degree_dms(deg: float) -> str:
    norm = normalize_angle(deg) % 30.0
    d = int(norm)
    m = int((norm - d) * 60)
    s = int(round(((norm - d) * 60 - m) * 60))
    if s >= 60:
        m += 1
        s = 0
    if m >= 60:
        d += 1
        m = 0
    return f"{d:02d}° {m:02d}' {s:02d}\""

def get_nakshatra_from_lon(lon: float) -> Dict[str, Any]:
    norm = normalize_angle(lon)
    star_span = 360.0 / 27.0
    star_idx = int(norm // star_span) % 27
    star_name = NAKSHATRAS[star_idx]

    pada_span = star_span / 4.0
    fraction_in_star = norm % star_span
    pada = min(4, max(1, int(fraction_in_star // pada_span) + 1))

    dasa_lord_idx = star_idx % 9
    star_lord = DASA_LORDS_ORDER[dasa_lord_idx]["name"]

    return {
        "starIndex": star_idx,
        "starName": star_name,
        "pada": pada,
        "starLord": star_lord
    }

# ===========================================================================
# 1. DIVISIONAL CHARTS (D1 to D60) CALCULATION
# ===========================================================================

DIVISIONAL_METADATA = {
    "D1": {"division": 1, "nameTamil": "இராசி", "nameEnglish": "Rasi", "significanceTamil": "முழுமையான வாழ்க்கை, உடல் நலம், பொது அமைப்பு", "significanceEnglish": "General well-being, physical body, overall life"},
    "D2": {"division": 2, "nameTamil": "ஹோரை", "nameEnglish": "Hora", "significanceTamil": "செல்வ வளம், குடும்ப நலம், பொருளாதார நிலை", "significanceEnglish": "Wealth, finances, prosperity and family wealth"},
    "D3": {"division": 3, "nameTamil": "திரேக்காணம்", "nameEnglish": "Drekkana", "significanceTamil": "உடன்பிறப்புகள், தைரியம், ஆற்றல், முயற்சிகள்", "significanceEnglish": "Siblings, courage, motivation, third-house matters"},
    "D4": {"division": 4, "nameTamil": "சதுர்த்தாம்சம்", "nameEnglish": "Chaturthamsa", "significanceTamil": "நிலம், வீடு, அசையா சொத்துக்கள், அதிர்ஷ்டம்", "significanceEnglish": "Fortune, real estate, property, fixed assets"},
    "D6": {"division": 6, "nameTamil": "ஷஷ்டாம்சம்", "nameEnglish": "Shasthamsa", "significanceTamil": "நோய்கள், கடன்கள், எதிரிகள், வழக்குகள்", "significanceEnglish": "Health issues, debts, obstacles, litigation"},
    "D7": {"division": 7, "nameTamil": "சப்தாம்சம்", "nameEnglish": "Saptamsa", "significanceTamil": "புத்திர பாக்கியம், வாரிசுகள், குழந்தைகள் யோகம்", "significanceEnglish": "Children, progeny, descendants and legacy"},
    "D8": {"division": 8, "nameTamil": "அஷ்டாம்சம்", "nameEnglish": "Ashtamsa", "significanceTamil": "ஆயுள், எதிர்பாராத விபத்துக்கள், ரகசியங்கள்", "significanceEnglish": "Longevity, sudden transformations, hidden energies"},
    "D9": {"division": 9, "nameTamil": "நவாம்சம்", "nameEnglish": "Navamsa", "significanceTamil": "திருமணம், வாழ்க்கைத் துணை, தர்மம், அதிர்ஷ்ட பலம்", "significanceEnglish": "Marriage, spouse, dharma, planetary inner strength"},
    "D10": {"division": 10, "nameTamil": "தசாம்சம்", "nameEnglish": "Dasamsa", "significanceTamil": "தொழில், வேலை வாய்ப்பு, அரசு மரியாதை, புகழ்", "significanceEnglish": "Career, profession, social status, fame and success"},
    "D11": {"division": 11, "nameTamil": "ருத்ராம்சம்", "nameEnglish": "Rudramsa", "significanceTamil": "வெற்றிகள், எதிர்பாராத லாபங்கள், மரண யோகம்", "significanceEnglish": "Gains, sudden windfalls, destructive battles"},
    "D12": {"division": 12, "nameTamil": "துவாதசாம்சம்", "nameEnglish": "Dwadasamsa", "significanceTamil": "பெற்றோர்கள், தாய்-தந்தை வழி பூர்வீக ஆசிகள்", "significanceEnglish": "Parents, ancestral karma, lineage blessings"},
    "D16": {"division": 16, "nameTamil": "ஷோடசாம்சம்", "nameEnglish": "Shodashamsa", "significanceTamil": "வாகன சுகம், சொகுசு வாழ்க்கை, பயணங்கள்", "significanceEnglish": "Vehicles, conveyances, comforts and luxuries"},
    "D20": {"division": 20, "nameTamil": "விம்சாம்சம்", "nameEnglish": "Vimsamsa", "significanceTamil": "ஆன்மீக சக்தி, உபாசனை, தியானம், பக்தி", "significanceEnglish": "Spiritual inclinations, worship, occult devotion"},
    "D24": {"division": 24, "nameTamil": "சதுர்விம்சாம்சம்", "nameEnglish": "Chaturvimshamsa", "significanceTamil": "உயர்கல்வி, ஞானம், ஆராய்ச்சி அறிவு, மேதமை", "significanceEnglish": "Higher education, learning, scholarship and intellect"},
    "D27": {"division": 27, "nameTamil": "சப்தவிம்சாம்சம்", "nameEnglish": "Bhamsa", "significanceTamil": "உடல் பலம், பலவீனங்கள், உள் வலிமை", "significanceEnglish": "Strengths, vulnerabilities, endurance and stamina"},
    "D30": {"division": 30, "nameTamil": "திரிம்சாம்சம்", "nameEnglish": "Trimsamsa", "significanceTamil": "அரிஷ்டங்கள், தோஷங்கள், தீய பலன்கள், பரிகாரங்கள்", "significanceEnglish": "Misfortunes, evils, arishta and dosha analysis"},
    "D60": {"division": 60, "nameTamil": "சஷ்டியாம்சம்", "nameEnglish": "Shashtiamsa", "significanceTamil": "பூர்வ புண்ணியம், நுணுக்கமான கர்ம பலன்கள்", "significanceEnglish": "Past-life karma, ultimate fine-tuning of destiny"}
}

def calculate_divisional_sign(raw_lon: float, division: int) -> int:
    norm = normalize_angle(raw_lon)
    rasi_sign = int(norm // 30) % 12
    deg_in_sign = norm % 30.0

    if division == 1:
        return rasi_sign

    elif division == 2:  # Hora
        is_odd = (rasi_sign % 2 == 0)
        if is_odd:
            return 4 if deg_in_sign < 15.0 else 3  # Leo (Sun) / Cancer (Moon)
        else:
            return 3 if deg_in_sign < 15.0 else 4  # Cancer (Moon) / Leo (Sun)

    elif division == 3:  # Drekkana
        part = int(deg_in_sign // 10.0)
        return (rasi_sign + part * 4) % 12

    elif division == 4:  # Chaturthamsa
        part = int(deg_in_sign // 7.5)
        return (rasi_sign + part * 3) % 12

    elif division == 6:  # Shasthamsa
        part = int(deg_in_sign // 5.0)
        is_odd = (rasi_sign % 2 == 0)
        start = 0 if is_odd else 6  # Aries / Libra
        return (start + part) % 12

    elif division == 7:  # Saptamsa
        part = int(deg_in_sign // (30.0 / 7.0))
        is_odd = (rasi_sign % 2 == 0)
        start = rasi_sign if is_odd else (rasi_sign + 6) % 12
        return (start + part) % 12

    elif division == 8:  # Ashtamsa
        part = int(deg_in_sign // 3.75)
        modality = rasi_sign % 3
        if modality == 0:  # Movable (Aries, Cancer, Libra, Capricorn)
            start = 0
        elif modality == 1:  # Fixed (Taurus, Leo, Scorpio, Aquarius)
            start = 8
        else:  # Dual (Gemini, Virgo, Sagittarius, Pisces)
            start = 4
        return (start + part) % 12

    elif division == 9:  # Navamsa
        part = int(deg_in_sign // (30.0 / 9.0))
        element = rasi_sign % 4
        if element == 0:    # Fire -> Aries (0)
            start = 0
        elif element == 1:  # Earth -> Capricorn (9)
            start = 9
        elif element == 2:  # Air -> Libra (6)
            start = 6
        else:               # Water -> Cancer (3)
            start = 3
        return (start + part) % 12

    elif division == 10:  # Dasamsa
        part = int(deg_in_sign // 3.0)
        is_odd = (rasi_sign % 2 == 0)
        start = rasi_sign if is_odd else (rasi_sign + 8) % 12
        return (start + part) % 12

    elif division == 11:  # Rudramsa
        part = int(deg_in_sign // (30.0 / 11.0))
        is_odd = (rasi_sign % 2 == 0)
        start = (11 - rasi_sign) % 12 if is_odd else (12 - rasi_sign) % 12
        return (start + part) % 12

    elif division == 12:  # Dwadasamsa
        part = int(deg_in_sign // 2.5)
        return (rasi_sign + part) % 12

    elif division == 16:  # Shodashamsa
        part = int(deg_in_sign // 1.875)
        modality = rasi_sign % 3
        if modality == 0:
            start = 0  # Aries
        elif modality == 1:
            start = 4  # Leo
        else:
            start = 8  # Sagittarius
        return (start + part) % 12

    elif division == 20:  # Vimsamsa
        part = int(deg_in_sign // 1.5)
        modality = rasi_sign % 3
        if modality == 0:
            start = 0
        elif modality == 1:
            start = 8
        else:
            start = 4
        return (start + part) % 12

    elif division == 24:  # Chaturvimshamsa (Siddhamsa)
        part = int(deg_in_sign // 1.25)
        is_odd = (rasi_sign % 2 == 0)
        start = 4 if is_odd else 3  # Leo if odd, Cancer if even
        return (start + part) % 12

    elif division == 27:  # Saptavimsamsa (Bhamsa)
        part = int(deg_in_sign // (30.0 / 27.0))
        element = rasi_sign % 4
        if element == 0:
            start = 0  # Aries
        elif element == 1:
            start = 3  # Cancer
        elif element == 2:
            start = 6  # Libra
        else:
            start = 9  # Capricorn
        return (start + part) % 12

    elif division == 30:  # Trimsamsa
        is_odd = (rasi_sign % 2 == 0)
        if is_odd:
            if deg_in_sign < 5.0:
                return 0  # Mars (Mesham)
            elif deg_in_sign < 10.0:
                return 10  # Saturn (Kumbam)
            elif deg_in_sign < 18.0:
                return 8  # Jupiter (Dhanusu)
            elif deg_in_sign < 25.0:
                return 2  # Mercury (Mithunam)
            else:
                return 6  # Venus (Thulam)
        else:
            if deg_in_sign < 5.0:
                return 1  # Venus (Rishabham)
            elif deg_in_sign < 12.0:
                return 5  # Mercury (Kanni)
            elif deg_in_sign < 20.0:
                return 11  # Jupiter (Meenam)
            elif deg_in_sign < 25.0:
                return 9  # Saturn (Makaram)
            else:
                return 7  # Mars (Viruchigam)

    elif division == 60:  # Shashtiamsa
        part = int(deg_in_sign // 0.5)
        return (rasi_sign + part) % 12

    return rasi_sign

def build_divisional_chart_boxes(code: str, raw_planets: List[Dict[str, Any]], lagna_lon: float) -> Dict[str, Any]:
    meta = DIVISIONAL_METADATA.get(code, DIVISIONAL_METADATA["D1"])
    div_num = meta["division"]

    lagna_div_sign = calculate_divisional_sign(lagna_lon, div_num)

    boxes = []
    for s in range(12):
        planets_in_s = []
        if lagna_div_sign == s:
            planets_in_s.append("லக்")

        for p in raw_planets:
            if p["name"] != "லக்னம்":
                p_div_sign = calculate_divisional_sign(p["rawLon"], div_num)
                if p_div_sign == s:
                    retro_tag = "(வ)" if p.get("isRetrograde") else ""
                    planets_in_s.append(f"{p['abbr']}{retro_tag}")

        boxes.append({
            "id": s,
            "nameTamil": RASI_NAMES_TAMIL[s],
            "englishName": RASI_NAMES_ENGLISH[s],
            "planets": planets_in_s,
            "isLagna": (lagna_div_sign == s)
        })

    return {
        "code": code,
        "nameTamil": meta["nameTamil"],
        "nameEnglish": meta["nameEnglish"],
        "division": div_num,
        "significanceTamil": meta["significanceTamil"],
        "significanceEnglish": meta["significanceEnglish"],
        "boxes": boxes
    }

def generate_all_divisional_charts(raw_planets: List[Dict[str, Any]], lagna_lon: float) -> Dict[str, Any]:
    charts = {}
    chart_keys = ["D1", "D2", "D3", "D4", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D16", "D20", "D24", "D27", "D30", "D60"]
    for code in chart_keys:
        charts[code] = build_divisional_chart_boxes(code, raw_planets, lagna_lon)
    return charts

# ===========================================================================
# 2. JAIMINI KARAKAS (7-KARAKA SYSTEM)
# ===========================================================================

JAIMINI_METADATA = [
    {"code": "AK", "nameTamil": "ஆத்மகாரகன்", "nameEnglish": "Atmakaraka", "significanceTamil": "ஆன்மா, சுய ஆளுமை, விதி, ஆன்மீக பலம்", "significanceEnglish": "Soul, self, destiny, core spiritual journey"},
    {"code": "AmK", "nameTamil": "அமாத்யகாரகன்", "nameEnglish": "Amatyakaraka", "significanceTamil": "தொழில், சமூக அந்தஸ்து, புத்தி, நிர்வாக திறன்", "significanceEnglish": "Career, intellect, ministerial power, intellect"},
    {"code": "BK", "nameTamil": "ப்ராத்ருகாரகன்", "nameEnglish": "Bhratrikaraka", "significanceTamil": "உடன்பிறப்புகள், குருநாதர், தைரியம், வழிகாட்டுதல்", "significanceEnglish": "Siblings, father, guru, courage, advisors"},
    {"code": "MK", "nameTamil": "மாத்ருகாரகன்", "nameEnglish": "Matrikaraka", "significanceTamil": "தாய், சுக வாழ்வு, வீடு, மன அமைதி, பாதுகாப்பு", "significanceEnglish": "Mother, domestic peace, comfort, emotional stability"},
    {"code": "PK", "nameTamil": "புத்ரகாரகன்", "nameEnglish": "Putrakaraka", "significanceTamil": "குழந்தைகள், கல்வி, படைப்பாற்றல், பூர்வ புண்ணியம்", "significanceEnglish": "Progeny, intelligence, learning, past merit"},
    {"code": "GK", "nameTamil": "ஞானிகாரகன்", "nameEnglish": "Gnatikaraka", "significanceTamil": "தடைகள், நோய்கள், எதிரிகள், உறவு மோதல்கள்", "significanceEnglish": "Obstacles, enemies, disease, competitive tests"},
    {"code": "DK", "nameTamil": "தாரகாரகன்", "nameEnglish": "Darakaraka", "significanceTamil": "வாழ்க்கைத் துணை, கூட்டுத் தொழில், தாம்பத்யம்", "significanceEnglish": "Spouse, partnership, marital harmony, public relations"}
]

PHYSICAL_GRAHAS = ["சூரியன்", "சந்திரன்", "செவ்வாய்", "புதன்", "குரு", "சுக்கிரன்", "சனி"]

def calculate_jaimini_karakas(raw_planets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    # Filter 7 physical planets
    seven_planets = [p for p in raw_planets if p["name"] in PHYSICAL_GRAHAS]

    # Calculate degree within sign (0 to 30)
    for p in seven_planets:
        p["degInSign"] = p["rawLon"] % 30.0

    # Sort descending by degree within sign
    sorted_planets = sorted(seven_planets, key=lambda x: x["degInSign"], reverse=True)

    karakas = []
    for idx, p in enumerate(sorted_planets[:7]):
        meta = JAIMINI_METADATA[idx]
        sign_idx = int(p["rawLon"] // 30) % 12
        karakas.append({
            "karakaCode": meta["code"],
            "karakaNameTamil": meta["nameTamil"],
            "karakaNameEnglish": meta["nameEnglish"],
            "significanceTamil": meta["significanceTamil"],
            "significanceEnglish": meta["significanceEnglish"],
            "planetTamil": p["name"],
            "planetEnglish": p.get("english", p["name"]),
            "degreeInRasi": round(p["degInSign"], 4),
            "degreeFormatted": format_degree_dms(p["degInSign"]),
            "signIndex": sign_idx,
            "signTamil": RASI_NAMES_TAMIL[sign_idx],
            "rawLongitude": round(p["rawLon"], 4)
        })

    return karakas

# ===========================================================================
# 3. UPAGRAHAS (MANDI & GULIKA)
# ===========================================================================

def calculate_upagrahas(
    weekday: int,
    birth_hour: float,
    sunrise_hour: float = 6.08,
    sunset_hour: float = 18.25,
    lagna_lon: float = 0.0,
    sun_lon: float = 0.0
) -> List[Dict[str, Any]]:
    """
    Standard Tamil & Vedic Mandi/Gulika Calculation based on 8-part division of day/night.
    """
    is_day = sunrise_hour <= birth_hour <= sunset_hour
    day_span = sunset_hour - sunrise_hour if is_day else (24.0 - sunset_hour + sunrise_hour)
    part_duration = day_span / 8.0

    # Saturn's segment indices (1 to 8):
    # Day: Sun=7, Mon=6, Tue=5, Wed=4, Thu=3, Fri=2, Sat=1
    # Night: Sun=5, Mon=4, Tue=3, Wed=2, Thu=1, Fri=7, Sat=6
    day_saturn_parts = [7, 6, 5, 4, 3, 2, 1]
    night_saturn_parts = [5, 4, 3, 2, 1, 7, 6]

    saturn_part = day_saturn_parts[weekday % 7] if is_day else night_saturn_parts[weekday % 7]

    # Gulika rises at start of Saturn's part; Mandi at mid-point
    gulika_hours_from_base = (saturn_part - 1) * part_duration
    mandi_hours_from_base = (saturn_part - 0.5) * part_duration

    base_hour = sunrise_hour if is_day else sunset_hour
    gulika_clock = (base_hour + gulika_hours_from_base) % 24.0
    mandi_clock = (base_hour + mandi_hours_from_base) % 24.0

    # Approximate rising ascendant for that clock time:
    # Hourly ascendant advance is approx 15 degrees
    lagna_diff_hours_gulika = (gulika_clock - birth_hour)
    gulika_lon = normalize_angle(lagna_lon + lagna_diff_hours_gulika * 15.0)

    lagna_diff_hours_mandi = (mandi_clock - birth_hour)
    mandi_lon = normalize_angle(lagna_lon + lagna_diff_hours_mandi * 15.0)

    mandi_nak = get_nakshatra_from_lon(mandi_lon)
    gulika_nak = get_nakshatra_from_lon(gulika_lon)

    mandi_sign = int(mandi_lon // 30) % 12
    gulika_sign = int(gulika_lon // 30) % 12

    return [
        {
            "nameTamil": "மாந்தி",
            "nameEnglish": "Mandi",
            "rawLongitude": round(mandi_lon, 4),
            "degreeFormatted": format_degree_dms(mandi_lon % 30.0),
            "signIndex": mandi_sign,
            "signTamil": RASI_NAMES_TAMIL[mandi_sign],
            "nakshatra": mandi_nak["starName"],
            "pada": mandi_nak["pada"],
            "starLord": mandi_nak["starLord"],
            "significance": "சனி உபகிரகம், விஷத்தன்மை, தோஷம், ஆயுள் மற்றும் மறைமுக தடைகள்"
        },
        {
            "nameTamil": "குளிகன்",
            "nameEnglish": "Gulika",
            "rawLongitude": round(gulika_lon, 4),
            "degreeFormatted": format_degree_dms(gulika_lon % 30.0),
            "signIndex": gulika_sign,
            "signTamil": RASI_NAMES_TAMIL[gulika_sign],
            "nakshatra": gulika_nak["starName"],
            "pada": gulika_nak["pada"],
            "starLord": gulika_nak["starLord"],
            "significance": "சனி மைந்தன், காரிய தாமதம், சுப காரிய விலக்கு, பூர்வ கர்ம வினை"
        }
    ]

# ===========================================================================
# 4. CLASSICAL PARASHARA ASHTAKAVARGA (BAV & SAV)
# ===========================================================================

# Parashara Auspicious Houses (1-indexed house distances)
PARASHARA_BAV_RULES = {
    "சூரியன்": {
        "சூரியன்": [1, 2, 4, 7, 8, 9, 10, 11],
        "சந்திரன்": [3, 6, 10, 11],
        "செவ்வாய்": [1, 2, 4, 7, 8, 9, 10, 11],
        "புதன்": [3, 5, 6, 9, 10, 11, 12],
        "குரு": [5, 6, 9, 11],
        "சுக்கிரன்": [6, 7, 12],
        "சனி": [1, 2, 4, 7, 8, 9, 10, 11],
        "லக்னம்": [3, 4, 6, 10, 11, 12]
    },
    "சந்திரன்": {
        "சூரியன்": [3, 6, 7, 8, 10, 11],
        "சந்திரன்": [1, 3, 6, 7, 10, 11],
        "செவ்வாய்": [2, 3, 5, 6, 9, 10, 11],
        "புதன்": [1, 3, 4, 5, 7, 8, 10, 11],
        "குரு": [1, 4, 7, 8, 10, 11, 12],
        "சுக்கிரன்": [3, 4, 5, 7, 9, 10, 11],
        "சனி": [3, 5, 6, 11],
        "லக்னம்": [3, 6, 10, 11]
    },
    "செவ்வாய்": {
        "சூரியன்": [3, 5, 6, 10, 11],
        "சந்திரன்": [3, 6, 11],
        "செவ்வாய்": [1, 2, 4, 7, 8, 10, 11],
        "புதன்": [3, 5, 6, 11],
        "குரு": [6, 10, 11, 12],
        "சுக்கிரன்": [6, 8, 11, 12],
        "சனி": [1, 4, 7, 8, 9, 10, 11],
        "லக்னம்": [1, 3, 6, 10, 11]
    },
    "புதன்": {
        "சூரியன்": [5, 6, 9, 11, 12],
        "சந்திரன்": [2, 4, 6, 8, 10, 11],
        "செவ்வாய்": [1, 2, 4, 7, 8, 9, 10, 11],
        "புதன்": [1, 3, 5, 6, 9, 10, 11, 12],
        "குரு": [6, 8, 11, 12],
        "சுக்கிரன்": [1, 2, 3, 4, 5, 8, 9, 11],
        "சனி": [1, 2, 4, 7, 8, 9, 10, 11],
        "லக்னம்": [1, 2, 4, 6, 8, 10, 11]
    },
    "குரு": {
        "சூரியன்": [1, 2, 3, 4, 7, 8, 9, 10, 11],
        "சந்திரன்": [2, 5, 7, 9, 11],
        "செவ்வாய்": [1, 2, 4, 7, 8, 10, 11],
        "புதன்": [1, 2, 4, 5, 6, 9, 10, 11],
        "குரு": [1, 2, 3, 4, 7, 8, 10, 11],
        "சுக்கிரன்": [2, 5, 6, 9, 10, 11],
        "சனி": [3, 5, 6, 12],
        "லக்னம்": [1, 2, 4, 5, 6, 7, 9, 10, 11]
    },
    "சுக்கிரன்": {
        "சூரியன்": [8, 11, 12],
        "சந்திரன்": [1, 2, 3, 4, 5, 8, 9, 11, 12],
        "செவ்வாய்": [3, 4, 6, 9, 11, 12],
        "புதன்": [3, 5, 6, 9, 11],
        "குரு": [5, 8, 9, 10, 11],
        "சுக்கிரன்": [1, 2, 3, 4, 5, 8, 9, 10, 11],
        "சனி": [3, 4, 5, 8, 9, 10, 11],
        "லக்னம்": [1, 2, 3, 4, 5, 8, 9, 11]
    },
    "சனி": {
        "சூரியன்": [1, 2, 4, 7, 8, 10, 11],
        "சந்திரன்": [3, 6, 11],
        "செவ்வாய்": [3, 5, 6, 10, 11, 12],
        "புதன்": [6, 8, 9, 10, 11, 12],
        "குரு": [5, 6, 11, 12],
        "சுக்கிரன்": [6, 11, 12],
        "சனி": [3, 5, 6, 11],
        "லக்னம்": [1, 3, 4, 6, 10, 11]
    }
}

PLANET_ENGLISH_MAP = {
    "சூரியன்": "Sun",
    "சந்திரன்": "Moon",
    "செவ்வாய்": "Mars",
    "புதன்": "Mercury",
    "குரு": "Jupiter",
    "சுக்கிரன்": "Venus",
    "சனி": "Saturn"
}

def calculate_ashtakavarga(raw_planets: List[Dict[str, Any]], lagna_sign: int) -> Dict[str, Any]:
    # Extract sign indices for 7 planets
    planet_signs = {}
    for p in raw_planets:
        if p["name"] in PHYSICAL_GRAHAS:
            planet_signs[p["name"]] = int(p["rawLon"] // 30) % 12
    planet_signs["லக்னம்"] = lagna_sign

    bhinna = {}
    sarvashtakavarga = [0] * 12
    planet_scores = []

    for target_planet in PHYSICAL_GRAHAS:
        rules = PARASHARA_BAV_RULES.get(target_planet, {})
        planet_bindus = [0] * 12

        for contributor, houses in rules.items():
            ref_sign = planet_signs.get(contributor, lagna_sign)
            for h in houses:
                target_sign = (ref_sign + h - 1) % 12
                planet_bindus[target_sign] += 1

        bhinna[target_planet] = planet_bindus
        total_p = sum(planet_bindus)
        planet_scores.append({
            "planet": target_planet,
            "planetEnglish": PLANET_ENGLISH_MAP.get(target_planet, target_planet),
            "bindus": planet_bindus,
            "total": total_p
        })

        for s in range(12):
            sarvashtakavarga[s] += planet_bindus[s]

    total_bindus = sum(sarvashtakavarga)
    max_bindu = max(sarvashtakavarga)
    min_bindu = min(sarvashtakavarga)
    max_sign = sarvashtakavarga.index(max_bindu)
    min_sign = sarvashtakavarga.index(min_bindu)

    return {
        "sarvashtakavarga": sarvashtakavarga,
        "bhinnaAshtakavarga": bhinna,
        "planetScores": planet_scores,
        "totalBindus": total_bindus,
        "highestRasi": {
            "signIndex": max_sign,
            "signTamil": RASI_NAMES_TAMIL[max_sign],
            "bindus": max_bindu
        },
        "lowestRasi": {
            "signIndex": min_sign,
            "signTamil": RASI_NAMES_TAMIL[min_sign],
            "bindus": min_bindu
        }
    }

# ===========================================================================
# 5. SIXFOLD PLANETARY STRENGTHS (SHADBALA)
# ===========================================================================

# Standard Minimum Required Strengths in Rupas (1 Rupa = 60 Virupas)
REQUIRED_RUPAS = {
    "சூரியன்": 6.5,   # 390 Virupas
    "சந்திரன்": 6.0,   # 360 Virupas
    "செவ்வாய்": 5.0,  # 300 Virupas
    "புதன்": 7.0,      # 420 Virupas
    "குரு": 6.5,       # 390 Virupas
    "சுக்கிரன்": 5.5,  # 330 Virupas
    "சனி": 5.0        # 300 Virupas
}

# Constant Naisargika Bala (Natural Strength in Virupas)
NAISARGIKA_BALA = {
    "சூரியன்": 60.00,
    "சந்திரன்": 51.43,
    "சுக்கிரன்": 42.86,
    "குரு": 34.29,
    "புதன்": 25.71,
    "செவ்வாய்": 17.14,
    "சனி": 8.57
}

# Exaltation Longitudes
EXALTATION_DEG = {
    "சூரியன்": 10.0,    # Aries 10°
    "சந்திரன்": 33.0,   # Taurus 3°
    "செவ்வாய்": 298.0,  # Capricorn 28°
    "புதன்": 165.0,     # Virgo 15°
    "குரு": 95.0,       # Cancer 5°
    "சுக்கிரன்": 357.0, # Pisces 27°
    "சனி": 200.0        # Libra 20°
}

# Directional (Dig Bala) Optimal Signs from Lagna
# 1st house (East): Jup, Merc
# 4th house (North): Moon, Ven
# 7th house (West): Sat
# 10th house (South): Sun, Mars
DIG_BALA_OPTIMAL_HOUSE = {
    "குரு": 1,
    "புதன்": 1,
    "சந்திரன்": 4,
    "சுக்கிரன்": 4,
    "சனி": 7,
    "சூரியன்": 10,
    "செவ்வாய்": 10
}

def calculate_shadbala(
    raw_planets: List[Dict[str, Any]],
    lagna_sign: int,
    is_day_birth: bool = True
) -> Dict[str, Any]:
    planet_map = {p["name"]: p for p in raw_planets if p["name"] in PHYSICAL_GRAHAS}
    sun_lon = planet_map["சூரியன்"]["rawLon"] if "சூரியன்" in planet_map else 0.0
    moon_lon = planet_map["சந்திரன்"]["rawLon"] if "சந்திரன்" in planet_map else 0.0

    # Elongation between Sun and Moon (Paksha Bala calculation)
    moon_sun_elongation = normalize_angle(moon_lon - sun_lon)
    paksha_bala_factor = moon_sun_elongation / 180.0 if moon_sun_elongation <= 180.0 else (360.0 - moon_sun_elongation) / 180.0

    results = []

    for name in PHYSICAL_GRAHAS:
        p = planet_map.get(name)
        if not p:
            continue

        raw_lon = p["rawLon"]
        sign_idx = int(raw_lon // 30) % 12
        house_from_lagna = ((sign_idx - lagna_sign + 12) % 12) + 1

        # 1. Sthana Bala (Positional Strength: 120-240 Virupas)
        exalt_lon = EXALTATION_DEG.get(name, 0.0)
        dist_from_debility = 180.0 - min(abs(normalize_angle(raw_lon - exalt_lon)), 360.0 - abs(normalize_angle(raw_lon - exalt_lon)))
        uccha_bala = (dist_from_debility / 180.0) * 60.0  # Max 60 virupas

        # Kendradi bala (Kendra: 60, Panapara: 30, Apoklima: 15)
        if house_from_lagna in [1, 4, 7, 10]:
            kendradi_bala = 60.0
        elif house_from_lagna in [2, 5, 8, 11]:
            kendradi_bala = 30.0
        else:
            kendradi_bala = 15.0

        # Saptavargiya & Ojhayugma general component
        saptavarga_component = 75.0 + (uccha_bala * 0.5)
        sthana_bala = round(uccha_bala + kendradi_bala + saptavarga_component, 2)

        # 2. Dig Bala (Directional Strength: 10-60 Virupas)
        optimal_house = DIG_BALA_OPTIMAL_HOUSE.get(name, 1)
        house_distance = abs(house_from_lagna - optimal_house)
        if house_distance > 6:
            house_distance = 12 - house_distance
        dig_bala = round(60.0 * (1.0 - (house_distance / 6.0)), 2)

        # 3. Kaala Bala (Temporal Strength: 110-230 Virupas)
        is_day_planet = name in ["சூரியன்", "குரு", "சுக்கிரன்"]
        day_night_bala = 50.0 if (is_day_birth == is_day_planet) else 25.0
        paksha_bala = 60.0 * paksha_bala_factor if name in ["சந்திரன்", "சுக்கிரன்", "குரு"] else 60.0 * (1.0 - paksha_bala_factor)
        kaala_bala = round(70.0 + day_night_bala + paksha_bala, 2)

        # 4. Chesta Bala (Motional Strength: 20-60 Virupas)
        is_retro = p.get("isRetrograde", False)
        if name in ["சூரியன்", "சந்திரன்"]:
            chesta_bala = 45.0  # Luminaries do not retrograde
        elif is_retro:
            chesta_bala = 60.0  # Full strength on retrogression
        else:
            chesta_bala = 35.0

        # 5. Naisargika Bala (Natural Strength)
        naisargika_bala = NAISARGIKA_BALA.get(name, 25.0)

        # 6. Drik Bala (Aspectual Strength: +/- 10-35 Virupas)
        # Benefic / Malefic aspect heuristic
        drik_bala = round(15.0 + (kendradi_bala * 0.2), 2)

        total_virupas = round(sthana_bala + dig_bala + kaala_bala + chesta_bala + naisargika_bala + drik_bala, 2)
        total_rupas = round(total_virupas / 60.0, 2)
        req_rupas = REQUIRED_RUPAS.get(name, 6.0)
        strength_ratio = round(total_rupas / req_rupas, 2)
        percentage = round(strength_ratio * 100.0, 1)

        results.append({
            "planet": name,
            "planetEnglish": PLANET_ENGLISH_MAP.get(name, name),
            "sthanaBala": sthana_bala,
            "digBala": dig_bala,
            "kaalaBala": kaala_bala,
            "chestaBala": chesta_bala,
            "naisargikaBala": naisargika_bala,
            "drikBala": drik_bala,
            "totalVirupas": total_virupas,
            "totalRupas": total_rupas,
            "requiredRupas": req_rupas,
            "strengthRatio": strength_ratio,
            "percentage": percentage,
            "isStrong": total_rupas >= req_rupas
        })

    # Rank planets by total Rupas descending
    results = sorted(results, key=lambda x: x["totalRupas"], reverse=True)
    for idx, item in enumerate(results):
        item["rank"] = idx + 1

    strongest = results[0]["planet"] if results else "குரு"
    weakest = results[-1]["planet"] if results else "சனி"

    return {
        "planets": results,
        "strongestPlanet": strongest,
        "weakestPlanet": weakest
    }
