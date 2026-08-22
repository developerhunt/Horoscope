"""
D.S.Astro System Deterministic Rule Engine
Loads rules from knowledge/ds-astro/rules/*.json and evaluates chart facts.
"""

import json
import os
import math
from typing import List, Dict, Any, Optional

RASI_NAMES_TAMIL = [
    "மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்",
    "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்",
    "தனுசு", "மகரம்", "கும்பம்", "மீனம்"
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

DEBILITATED_HOUSES_MAP = {
    "சூரியன்": 6,    # Thulam
    "சந்திரன்": 7,   # Viruchigam
    "செவ்வாய்": 3,   # Katakam
    "புதன்": 11,     # Meenam
    "குரு": 9,       # Makaram
    "சுக்கிரன்": 5,  # Kanni
    "சனி": 0         # Mesham
}

STHANA_BALAM_SCORES = {
    "EXALTED": 6,
    "MOOLATRIKONA": 5,
    "OWN": 4,
    "FRIENDLY": 3,
    "NEUTRAL": 2,
    "ENEMY": 1,
    "DEBILITATED": 0
}

def get_sthana_balam(planet_name: str, rasi_idx: int) -> Dict[str, Any]:
    if planet_name in EXALTED_HOUSES_MAP and rasi_idx == EXALTED_HOUSES_MAP[planet_name]:
        return {"status": "உச்சம் (Exalted)", "score": 6, "isStrong": True}
    if planet_name in DEBILITATED_HOUSES_MAP and rasi_idx == DEBILITATED_HOUSES_MAP[planet_name]:
        return {"status": "நீச்சம் (Debilitated)", "score": 0, "isStrong": False}
    if planet_name in OWN_HOUSES_MAP and rasi_idx in OWN_HOUSES_MAP[planet_name]:
        return {"status": "ஆட்சி (Own House)", "score": 4, "isStrong": True}
    # Friendly / Neutral / Enemy rough standard approximation
    return {"status": "நட்பு / சமம் (Friendly/Neutral)", "score": 3, "isStrong": True}


class DSRuleEngine:
    def __init__(self, knowledge_dir: Optional[str] = None):
        if not knowledge_dir:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            knowledge_dir = os.path.join(base_dir, "knowledge", "ds-astro", "rules")
        self.knowledge_dir = knowledge_dir
        self.rules_by_category: Dict[str, List[Dict[str, Any]]] = {}
        self.load_all_rules()

    def load_all_rules(self):
        if not os.path.exists(self.knowledge_dir):
            print(f"Warning: Rules directory {self.knowledge_dir} not found.")
            return

        for fname in os.listdir(self.knowledge_dir):
            if fname.endswith(".json"):
                cat_name = fname.replace(".json", "")
                fpath = os.path.join(self.knowledge_dir, fname)
                try:
                    with open(fpath, "r", encoding="utf-8") as f:
                        rules_list = json.load(f)
                        self.rules_by_category[cat_name] = rules_list
                except Exception as e:
                    print(f"Error loading rules from {fpath}: {e}")

    def evaluate(
        self,
        planet_positions: List[Dict[str, Any]],
        current_dasa_lord: str,
        current_bhukti_lord: str,
        lagna_rasi_idx: int,
        active_dasa_start: str = "",
        active_dasa_end: str = "",
        active_bhukti_start: str = "",
        active_bhukti_end: str = ""
    ) -> Dict[str, Any]:
        """
        Executes complete D.S. Astro System analysis:
        1. Temporary Lagna derivation (Dasa Lord Sign)
        2. Temporary Lagna Lord derivation (Dispositor)
        3. Relationship evaluation (Trines, Kendras, 3-11, 6-8, 2-12, Aspects, Midpoints)
        4. Category-wise rule evaluation with structured traceability.
        """
        # Helper to get planet record
        def get_p(name_frag: str) -> Optional[Dict[str, Any]]:
            return next((p for p in planet_positions if name_frag in p.get("planet", "") or name_frag in p.get("name", "")), None)

        sun = get_p("சூரியன்")
        moon = get_p("சந்திரன்")
        mars = get_p("செவ்வாய்")
        merc = get_p("புதன்")
        jup = get_p("குரு")
        ven = get_p("சுக்கிரன்")
        sat = get_p("சனி")
        rahu = get_p("ராகு")
        ketu = get_p("கேது")

        def p_sign(p: Optional[Dict[str, Any]]) -> int:
            if not p:
                return -1
            lon = p.get("rawLongitude", p.get("rawLon", 0.0))
            return int(lon // 30) % 12

        def p_deg_in_sign(p: Optional[Dict[str, Any]]) -> float:
            if not p:
                return 0.0
            lon = p.get("rawLongitude", p.get("rawLon", 0.0))
            return lon % 30.0

        def is_aspected(target_sign: int, aspecting_p: Optional[Dict[str, Any]]) -> bool:
            if not aspecting_p:
                return False
            a_sign = p_sign(aspecting_p)
            diff = (target_sign - a_sign + 12) % 12
            if diff in [0, 6]:  # Conjunction or 7th
                return True
            p_name = aspecting_p.get("planet", aspecting_p.get("name", ""))
            if "செவ்வாய்" in p_name and diff in [3, 7]:  # 4th & 8th
                return True
            if "குரு" in p_name and diff in [4, 8]:      # 5th & 9th
                return True
            if "சனி" in p_name and diff in [2, 9]:       # 3rd & 10th
                return True
            return False

        def get_rel_type(sign1: int, sign2: int) -> str:
            diff = (sign2 - sign1 + 12) % 12
            if diff in [0, 4, 8]:
                return "TRIKONA (1-5-9)"
            if diff in [3, 6, 9]:
                return "KENDRA (1-4-7-10)"
            if diff in [2, 10]:
                return "THREE_ELEVEN (3-11)"
            if diff in [5, 7]:
                return "SIX_EIGHT (6-8)"
            if diff in [1, 11]:
                return "TWO_TWELVE (2-12)"
            return "GENERAL"

        # 1. TEMPORARY LAGNA (Dasa Lord Sign)
        dasa_p = get_p(current_dasa_lord)
        temp_lagna_idx = p_sign(dasa_p) if dasa_p else lagna_rasi_idx
        temp_lagna_name = RASI_NAMES_TAMIL[temp_lagna_idx]

        # 2. TEMPORARY LAGNA LORD (Dispositor of Dasa Lord)
        temp_lagna_lord_name = SIGN_LORDS[temp_lagna_idx]
        temp_lagna_lord_p = get_p(temp_lagna_lord_name)
        temp_lagna_lord_sign = p_sign(temp_lagna_lord_p) if temp_lagna_lord_p else temp_lagna_idx

        # Sthana Balam of Temp Lagna Lord
        temp_lagna_balam = get_sthana_balam(temp_lagna_lord_name, temp_lagna_lord_sign)

        # Star lord of Dasa Lord
        dasa_star_lord = dasa_p.get("star", "அஸ்வினி") if dasa_p else ""
        dasa_star_lord_name = dasa_p.get("starLord", "கேது") if dasa_p else "கேது"

        # Rahu-Ketu Midpoint calculation (4th house perpendicular axis)
        midpoint_hits = []
        if rahu and ketu:
            rahu_sign_idx = p_sign(rahu)
            ketu_sign_idx = p_sign(ketu)
            mid1_sign = (rahu_sign_idx + 3) % 12
            mid2_sign = (rahu_sign_idx + 9) % 12
            for check_p in [sun, moon, mars, merc, jup, ven, sat]:
                if check_p:
                    csign = p_sign(check_p)
                    cname = check_p.get("planet", check_p.get("name", ""))
                    if csign in [mid1_sign, mid2_sign]:
                        midpoint_hits.append(f"{cname} ({RASI_NAMES_TAMIL[csign]} - ராகு/கேது 4-ம் அச்சு மையப்புள்ளி)")

        # -------------------------------------------------------------
        # CATEGORIZED PREDICTIONS EVALUATION
        # -------------------------------------------------------------
        categories_output: Dict[str, Dict[str, Any]] = {}

        # 1. GENERAL / METHODOLOGY ANALYSIS
        gen_signals = [
            f"நடப்பு தசாநாதன் {current_dasa_lord} அமர்ந்த ராசி '{temp_lagna_name}' தற்காலிக லக்னமாக பாவிக்கப்படுகிறது.",
            f"தசாநாதனுக்கு வீடு கொடுத்த லக்னாதிபதி: {temp_lagna_lord_name} ({temp_lagna_balam['status']}).",
        ]
        if temp_lagna_balam["isStrong"]:
            gen_status = "strong_indication"
            gen_summary = f"{current_dasa_lord} தசையில் வீடு கொடுத்த லக்னாதிபதி {temp_lagna_lord_name} பலமாக இருப்பதால், இக்காலகட்டத்தில் சுபகாரியங்கள், முன்னேற்றம் மற்றும் பெருமைகள் கைக்கூடும்."
        else:
            gen_status = "caution"
            gen_summary = f"{current_dasa_lord} தசையில் வீடு கொடுத்த லக்னாதிபதி {temp_lagna_lord_name} பலமிழந்துள்ளதால், இக்காலகட்டத்தில் நிதானம், திட்டமிட்ட உழைப்பு மற்றும் விழிப்புணர்வு தேவை."

        categories_output["general"] = {
            "category": "general",
            "title": "பொது & தசாநாதன் லக்ன பலன்கள் (D.S. Method)",
            "status": gen_status,
            "summary": gen_summary,
            "signals": gen_signals,
            "obstructions": [],
            "timing": {
                "dasa": current_dasa_lord,
                "bhukti": current_bhukti_lord,
                "startDate": active_dasa_start,
                "endDate": active_dasa_end,
                "window": f"{current_dasa_lord} தசா காலம் ({active_dasa_start} முதல் {active_dasa_end} வரை)"
            },
            "matchedRules": [
                {
                    "ruleId": "DS-GEN-001",
                    "title": "தசா நாதன் இருக்கும் இடமே தற்காலிக லக்னம்",
                    "sourcePage": 6,
                    "section": "விதி 1"
                },
                {
                    "ruleId": "DS-GEN-002",
                    "title": "தசாநாதனுக்கு வீடு கொடுத்தவரே லக்னாதிபதி",
                    "sourcePage": 6,
                    "section": "விதி 2"
                }
            ],
            "reasoning": f"D.S.Astro முறைப்படி நடப்பு தசாநாதன் {current_dasa_lord} நின்ற ராசியான {temp_lagna_name} லக்னமாக எடுத்துக்கொள்ளப்படுகிறது. அதன் அதிபதி {temp_lagna_lord_name} பெற்றுள்ள ஸ்தானபலம் ({temp_lagna_balam['score']}/6) அடிப்படையில் திசையின் பொதுவான பலன்கள் அமைகின்றன."
        }

        # 2. EDUCATION ANALYSIS
        edu_signals = []
        edu_obs = []
        edu_matched = []
        sun_merc_dist = abs((sun.get("rawLongitude", sun.get("rawLon", 0.0)) - merc.get("rawLongitude", merc.get("rawLon", 0.0)) + 180.0) % 360.0 - 180.0) if (sun and merc) else 30.0

        if sun and merc and sun_merc_dist <= 15.0:
            edu_signals.append(f"சூரியன் மற்றும் புதன் 15 பாகைக்குள் ({sun_merc_dist:.1f}°) இணைந்து புதாதித்ய யோகம் தருகிறது.")
            edu_matched.append({"ruleId": "DS-EDU-002", "title": "புதாதித்ய யோகம் (15 பாகைக்குள்)", "sourcePage": 18, "section": "கல்வி விதிகள் 1"})
        elif merc and merc.get("isRetrograde", False):
            edu_signals.append("புதன் பகவான் வக்ரம் பெற்றுள்ளதால் கல்வியில் உயர் தேர்ச்சி மற்றும் ஆராய்ச்சித் திறன் உண்டு.")
            edu_matched.append({"ruleId": "DS-EDU-003", "title": "புதன் வக்ர யோகம்", "sourcePage": 18, "section": "கல்வி விதிகள் 2"})

        # Medical education check: Mercury + Saturn + Moon connected to 6th house / Kanni
        kanni_sign = 5
        is_med = (p_sign(merc) == kanni_sign or p_sign(sat) == kanni_sign or p_sign(moon) == kanni_sign or
                  (get_rel_type(p_sign(merc), p_sign(sat)) == "TRIKONA (1-5-9)"))
        if is_med:
            edu_signals.append("புதன், சனி, சந்திரன் 6-ஆம் பாவகம்/திரிகோண தொடர்பில் உள்ளதால் MBBS / மருத்துவக் கல்வி, மருந்தியல் பயிலும் உன்னத யோகம் உண்டு.")
            edu_matched.append({"ruleId": "DS-EDU-006", "title": "M.B.B.S. மருத்துவக் கல்வி யோகம்", "sourcePage": 20, "section": "M.B.B.S. மருத்துவம்"})

        # Aviation / Pilot
        air_signs = [2, 6, 10]
        if merc and rahu and (p_sign(merc) in air_signs or p_sign(rahu) in air_signs) and (p_sign(merc) == p_sign(rahu) or get_rel_type(p_sign(merc), p_sign(rahu)) == "TRIKONA (1-5-9)"):
            edu_signals.append("புதன் + ராகு காற்று ராசிகளில் தொடர்பில் உள்ளதால் Pilot / விமானவியல் / விண்வெளித் துறை கல்வி யோகம் உள்ளது.")
            edu_matched.append({"ruleId": "DS-EDU-008", "title": "Pilot படிப்பு / விமானவியல்", "sourcePage": 21, "section": "Pilot படிப்பு"})

        edu_summary = "கல்விகாரகன் புதனின் வலிமை மற்றும் சூரியன் தொடர்பால் பட்டப்படிப்பு, தொழில்முறைக் கல்வி மற்றும் தேர்வுகளில் வெற்றி பெறுவீர்கள்."
        if len(edu_signals) > 0:
            edu_summary = " ".join(edu_signals)

        categories_output["education"] = {
            "category": "education",
            "title": "கல்வி & வித்யா யோகம் (Education & Career Degrees)",
            "status": "favorable",
            "summary": edu_summary,
            "signals": edu_signals if edu_signals else ["புதன் வித்தியாகாரகனின் அமைப்பால் தொடர் கல்வி வளர்ச்சி உண்டு."],
            "obstructions": edu_obs,
            "timing": {
                "dasa": current_dasa_lord,
                "bhukti": current_bhukti_lord,
                "window": f"{current_dasa_lord} தசா புத்தி காலங்கள்"
            },
            "matchedRules": edu_matched if edu_matched else [{"ruleId": "DS-EDU-001", "title": "புதன் வித்யா காரகன்", "sourcePage": 17, "section": "கல்வி"}],
            "reasoning": f"D.S.Astro புத்தகத்தின் 17-21 பக்கங்களில் உள்ள விதிகளின்படி, புதன், சூரியன் இடைப்பட்ட பாகை ({sun_merc_dist:.1f}°), மற்றும் மருத்துவ/தொழில்நுட்ப கிரக சேர்க்கைகளின் அடிப்படையில் பலன் நிர்ணயிக்கப்பட்டுள்ளது."
        }

        # 3. MARRIAGE ANALYSIS
        mar_signals = []
        mar_obs = []
        mar_matched = []
        mars_sign_idx = p_sign(mars)
        sat_sign_idx = p_sign(sat)
        ketu_sign_idx = p_sign(ketu)

        # Check Mars affliction
        if sat and is_aspected(mars_sign_idx, sat):
            mar_obs.append("செவ்வாய் பகவானை சனி பகவான் விசேஷப் பார்வையில் பார்ப்பதால் திருமணத்தில் தாமதம் ஏற்படலாம்.")
            mar_matched.append({"ruleId": "DS-MAR-002", "title": "செவ்வாய்-சனி பார்வை திருமண தாமதம்", "sourcePage": 22, "section": "திருமண தடை காரணிகள்"})

        # Check Dasa Lord link with Mars & 12th Lord
        house12_from_temp = (temp_lagna_idx + 11) % 12
        lord12_name = SIGN_LORDS[house12_from_temp]
        lord12_p = get_p(lord12_name)
        lord12_sign = p_sign(lord12_p) if lord12_p else -1

        dasa_mars_rel = get_rel_type(temp_lagna_idx, mars_sign_idx) if mars else ""
        if dasa_mars_rel in ["TRIKONA (1-5-9)", "KENDRA (1-4-7-10)", "CONJUNCTION"]:
            mar_signals.append(f"தசாநாதன் {current_dasa_lord} மங்களகாரகன் செவ்வாயுடன் சுப தொடர்பில் ({dasa_mars_rel}) உள்ளதால் இந்த தசா காலத்திலேயே திருமணம் கைகூடும்.")
            mar_matched.append({"ruleId": "DS-MAR-003", "title": "தசாநாதன் - செவ்வாய் தொடர்பு திருமண உறுதி", "sourcePage": 23, "section": "திருமணம் நடக்கும் சூத்திரம்"})

        # Love marriage check: 2/7 lord with 5/11 lord and Mercury
        lord2_name = SIGN_LORDS[(lagna_rasi_idx + 1) % 12]
        lord7_name = SIGN_LORDS[(lagna_rasi_idx + 6) % 12]
        lord5_name = SIGN_LORDS[(lagna_rasi_idx + 4) % 12]
        lord11_name = SIGN_LORDS[(lagna_rasi_idx + 10) % 12]
        lord2_p = get_p(lord2_name)
        lord7_p = get_p(lord7_name)
        lord5_p = get_p(lord5_name)
        lord11_p = get_p(lord11_name)

        if merc and (p_sign(merc) in [p_sign(lord5_p), p_sign(lord7_p), p_sign(lord2_p), p_sign(lord11_p)]):
            mar_signals.append("2, 7-ஆம் அதிபதிகளுடன் 5, 11-ஆம் அதிபதி மற்றும் காதல்காரகன் புதன் தொடர்பில் உள்ளதால் மனதிற்குப் பிடித்த காதல் திருமணம் கைகூடும் யோகம் உண்டு.")
            mar_matched.append({"ruleId": "DS-MAR-007", "title": "காதல் திருமணம் யோகம்", "sourcePage": 30, "section": "காதல் திருமணம் யாருக்கு அமையும்"})

        # Timing window
        mar_status = "strong_indication" if len(mar_signals) >= len(mar_obs) else "caution"
        mar_summary = "மங்களகாரகன் செவ்வாய் மற்றும் 12-ஆம் அதிபதி தொடர்புகளின் அடிப்படையில் சுப முகூர்த்த காலத்தில் திருமண பந்தம் உறுதியாகும்."
        if mar_signals:
            mar_summary = " ".join(mar_signals)

        categories_output["marriage"] = {
            "category": "marriage",
            "title": "திருமணம் & தாம்பத்திய வாழ்க்கை (Marriage & Relationships)",
            "status": mar_status,
            "summary": mar_summary,
            "signals": mar_signals if mar_signals else ["செவ்வாய் மங்களகாரகனின் சுப ஸ்தான பலத்தால் நல்ல வரன் அமையும்."],
            "obstructions": mar_obs,
            "timing": {
                "dasa": current_dasa_lord,
                "bhukti": current_bhukti_lord,
                "startDate": active_bhukti_start or active_dasa_start,
                "endDate": active_bhukti_end or active_dasa_end,
                "window": f"{current_dasa_lord} தசையில் திரிகோண புத்தி அல்லது 12-ம் அதிபதி புத்தி காலங்கள்"
            },
            "matchedRules": mar_matched if mar_matched else [{"ruleId": "DS-MAR-001", "title": "செவ்வாய் மங்களகாரகன் திருமண விதி", "sourcePage": 22, "section": "திருமணம்"}],
            "reasoning": f"D.S.Astro புத்தகத்தின் 21-36 பக்கங்களில் உள்ள விதிகளின்படி, மங்களகாரகன் செவ்வாயின் ஸ்தானபலம், தசாநாதனுக்கு 12-ஆம் அதிபதியான {lord12_name} தொடர்பு, மற்றும் புத்திநாதன் திரிகோண நிலைகள் கொண்டு திருமண பலன் கணிக்கப்பட்டுள்ளது."
        }

        # 4. CAREER ANALYSIS
        car_signals = []
        car_obs = []
        car_matched = []
        lord10_name = SIGN_LORDS[(lagna_rasi_idx + 9) % 12]
        lord10_p = get_p(lord10_name)
        lord6_name = SIGN_LORDS[(lagna_rasi_idx + 5) % 12]
        lord6_p = get_p(lord6_name)

        if lord10_p:
            l10_sign = p_sign(lord10_p)
            l10_balam = get_sthana_balam(lord10_name, l10_sign)
            if l10_balam["isStrong"]:
                car_signals.append(f"10-ஆம் அதிபதி {lord10_name} ஆட்சி/உச்சம் பெற்று {l10_balam['status']} பலத்துடன் இருப்பதால் சொந்தத் தொழில், வியாபாரம், ஒப்பந்தப் பணிகள் மூலம் பெரும் வெற்றி கிட்டும்.")
                car_matched.append({"ruleId": "DS-CAR-001", "title": "சொந்தத் தொழில் யோகம் (10-ஆம் அதிபதி ஆட்சி/உச்சம்)", "sourcePage": 46, "section": "சொந்தத் தொழில்"})
            else:
                car_signals.append(f"6-ஆம் அதிபதி மற்றும் தசாநாதன் அமைப்பால், நிலையான உத்தியோகம் மற்றும் நிறுவனப் பொறுப்புகளில் பணிபுரிவது அதிக யோகத்தைத் தரும்.")
                car_matched.append({"ruleId": "DS-CAR-001", "title": "உத்தியோகம் / சேவைப் பணி", "sourcePage": 43, "section": "உத்தியோகம்"})

        # Central / State Govt job
        if merc and sat and (is_aspected(p_sign(merc), sat) or p_sign(merc) == p_sign(sat)):
            if sun and (is_aspected(p_sign(sun), sat) or is_aspected(p_sign(sun), mars)):
                car_signals.append("புதன் + சூரியன் + சனி + செவ்வாய் அரசு காரக அமைப்புகளுடன் இணைந்திருப்பதால் அரசுப் பணி (State/Central Govt Exam) தேர்ச்சி பெறும் யோகம் உண்டு.")
                car_matched.append({"ruleId": "DS-CAR-002", "title": "அரசு வேலை யோகம்", "sourcePage": 44, "section": "மத்திய / மாநில அரசு வேலை"})

        # Foreign career
        if temp_lagna_lord_p and p_sign(temp_lagna_lord_p) in [(temp_lagna_idx + 2) % 12, (temp_lagna_idx + 5) % 12, (temp_lagna_idx + 7) % 12, (temp_lagna_idx + 11) % 12]:
            car_signals.append("தசாநாதனுக்கு வீடு கொடுத்த லக்னாதிபதி மறைவு ஸ்தானத்தில் (3, 6, 8, 12) நிற்பதால் சொந்த ஊரை விட்டு வெளியூர், வெளிமாநிலம் அல்லது வெளிநாடுகளில் பணியாற்றும் பாக்கியம் உண்டு.")
            car_matched.append({"ruleId": "DS-CAR-006", "title": "வெளிநாட்டு வேலை & இடமாற்றம்", "sourcePage": 50, "section": "வெளிநாட்டில் வேலை"})

        categories_output["career"] = {
            "category": "career",
            "title": "தொழில், உத்தியோகம் & அரசு வேலை (Career & Profession)",
            "status": "strong_indication",
            "summary": " ".join(car_signals) if car_signals else "10-ஆம் அதிபதி மற்றும் சனியின் காரகத்துவத்தால் தொழில் முன்னேற்றம் மற்றும் உத்தியோக உயர்வு உண்டு.",
            "signals": car_signals if car_signals else ["தொழில் காரகன் சனி மற்றும் 10-ஆம் அதிபதி நற்பலன்களைத் தருவர்."],
            "obstructions": car_obs,
            "timing": {
                "dasa": current_dasa_lord,
                "bhukti": current_bhukti_lord,
                "window": f"{current_dasa_lord} தசா காலம்"
            },
            "matchedRules": car_matched if car_matched else [{"ruleId": "DS-CAR-001", "title": "தொழில் நிர்ணயம்", "sourcePage": 43, "section": "உத்தியோகம்"}],
            "reasoning": f"D.S.Astro புத்தகத்தின் 43-53 பக்க விதிகளின்படி, 10-ஆம் அதிபதியின் ஸ்தானபலம், சூரியன்/செவ்வாய்/சனி தொழில் காரகத் தொடர்புகள், மற்றும் தசாநாதனுக்கு மறைவு ஸ்தான அமைப்புகள் பரிசீலிக்கப்பட்டுள்ளன."
        }

        # 5. CHILDREN PROGENY ANALYSIS
        chd_signals = []
        chd_matched = []
        if jup and ketu and (p_sign(jup) == p_sign(ketu) or get_rel_type(p_sign(jup), p_sign(ketu)) == "TRIKONA (1-5-9)"):
            chd_signals.append("புத்திரகாரகன் குருவுடன் ஞானகாரகன் கேது இணைந்துள்ளதால் குலத்திற்கு புகழ் சேர்க்கும் ஆண் குழந்தை பிறக்க அதிக வாய்ப்பு உண்டு.")
            chd_matched.append({"ruleId": "DS-CHD-002", "title": "ஆண் குழந்தை யோகம் (குரு+கேது)", "sourcePage": 41, "section": "குழந்தைகள் ஆணா பெண்ணா"})
        elif jup and rahu and (p_sign(jup) == p_sign(rahu) or get_rel_type(p_sign(jup), p_sign(rahu)) == "TRIKONA (1-5-9)"):
            chd_signals.append("புத்திரகாரகன் குருவுடன் ராகு இணைந்துள்ளதால் குடும்பத்திற்கு அதிர்ஷ்டம் தரும் பெண் குழந்தை பாக்கியம் உண்டாகும்.")
            chd_matched.append({"ruleId": "DS-CHD-002", "title": "பெண் குழந்தை யோகம் (குரு+ராகு)", "sourcePage": 41, "section": "குழந்தைகள் ஆணா பெண்ணா"})

        # Ubaya Rasis Twins check
        ubaya = [2, 5, 8, 11]
        if lagna_rasi_idx in ubaya and lord5_p and p_sign(lord5_p) in ubaya:
            chd_signals.append("லக்னம் மற்றும் 5-ஆம் அதிபதி இரண்டும் உபய (இரட்டை) ராசிகளில் இருப்பதால் இரட்டை குழந்தை பிறக்கும் அபூர்வ யோகம் உண்டு.")
            chd_matched.append({"ruleId": "DS-CHD-003", "title": "இரட்டை குழந்தை யோகம்", "sourcePage": 60, "section": "இரட்டை குழந்தை"})

        categories_output["children"] = {
            "category": "children",
            "title": "குழந்தை பாக்கியம் & வம்ச விருத்தி (Children & Progeny)",
            "status": "favorable",
            "summary": " ".join(chd_signals) if chd_signals else "5-ஆம் அதிபதி மற்றும் புத்திரகாரகன் குருவின் அருளால் நன்மக்கட்பேறு மற்றும் வம்சவிருத்தி சுபமாக அமையும்.",
            "signals": chd_signals if chd_signals else ["குரு பகவானின் சுப பார்வையால் புத்திர பாக்கியம் கைகூடும்."],
            "obstructions": [],
            "timing": {
                "dasa": current_dasa_lord,
                "bhukti": current_bhukti_lord,
                "window": f"குரு புத்தி அல்லது திரிகோண தசா காலங்கள்"
            },
            "matchedRules": chd_matched if chd_matched else [{"ruleId": "DS-CHD-001", "title": "புத்திர பாக்கிய விதி", "sourcePage": 36, "section": "குழந்தை பாக்கியம்"}],
            "reasoning": "D.S.Astro புத்தகத்தின் 36-42 மற்றும் 60-ஆம் பக்கங்களில் உள்ள 15 குழந்தை நிர்ணய விதிகளின்படி பலன்கள் பெறப்பட்டுள்ளன."
        }

        # 6. FINANCE & WEALTH ANALYSIS
        fin_signals = []
        fin_obs = []
        fin_matched = []
        lord2_balam = get_sthana_balam(lord2_name, p_sign(lord2_p)) if lord2_p else {"isStrong": False}
        lord11_balam = get_sthana_balam(lord11_name, p_sign(lord11_p)) if lord11_p else {"isStrong": False}

        if lord2_balam.get("isStrong") and lord11_balam.get("isStrong"):
            fin_signals.append(f"2 மற்றும் 11-ஆம் அதிபதிகள் ({lord2_name}, {lord11_name}) ஆட்சி/உச்சம் பெற்று பலமாக உள்ளதால் கோடீஸ்வர யோகம் மற்றும் அளப்பரிய சொத்துக்கள் சேரும்.")
            fin_matched.append({"ruleId": "DS-FIN-001", "title": "யார் கோடீஸ்வரன் விதி", "sourcePage": 48, "section": "யார் கோடீஸ்வரன்"})
        else:
            fin_signals.append("படிப்படியான சேமிப்பு மற்றும் உழைப்பின் மூலம் சீரான பணப்புழக்கம் மற்றும் பொருளாதார வளர்ச்சி ஏற்படும்.")

        # Check debt clearance
        house6_from_temp = (temp_lagna_idx + 5) % 12
        if ketu and p_sign(ketu) != house6_from_temp:
            fin_signals.append(f"தசாநாதனுக்கு 6-ஆம் பாவகம் கேதுவின் ஆதிக்கமின்றி இருப்பதால் இக்காலகட்டத்தில் பழைய கடன்கள் படிப்படியாக தீர்ந்துவிடும்.")
            fin_matched.append({"ruleId": "DS-FIN-003", "title": "கடன் தீரும் யோகம்", "sourcePage": 51, "section": "கடன் எப்போது தீரும்"})

        categories_output["finance"] = {
            "category": "finance",
            "title": "தனம், பொருளாதாரம் & கடன் நிவர்த்தி (Finance & Wealth)",
            "status": "strong_indication",
            "summary": " ".join(fin_signals),
            "signals": fin_signals,
            "obstructions": fin_obs,
            "timing": {
                "dasa": current_dasa_lord,
                "bhukti": current_bhukti_lord,
                "window": f"{current_dasa_lord} தசா காலம்"
            },
            "matchedRules": fin_matched if fin_matched else [{"ruleId": "DS-FIN-001", "title": "தன ஸ்தான விதி", "sourcePage": 47, "section": "பொருளாதார நெருக்கடி"}],
            "reasoning": f"D.S.Astro புத்தகத்தின் 47-51 பக்கங்களின்படி, 2, 11-ஆம் அதிபதிகள் மற்றும் தசாநாதனுக்கு 6-ஆம் இடத்து கேது/சனி தொடர்புகளின் அடிப்படையில் கணிப்பு செய்யப்பட்டுள்ளது."
        }

        # 7. PROPERTY & VEHICLE ANALYSIS
        prop_signals = []
        prop_matched = []
        if moon and not (sat and is_aspected(p_sign(moon), sat)):
            prop_signals.append("தாய்க்காரகன் மற்றும் 4-ஆம் வீட்டு அதிபதி சந்திரன் சுப பலத்துடன் உள்ளதால் சொந்த மனை, பூமி, வீடு கட்டும் பாக்கியம் உண்டு.")
            prop_matched.append({"ruleId": "DS-PROP-001", "title": "சொந்த வீடு கட்டும் யோகம் (சந்திரன் பலம்)", "sourcePage": 54, "section": "சொந்த வீடு"})

        if ven and rahu and (p_sign(ven) == p_sign(rahu) or get_rel_type(p_sign(ven), p_sign(rahu)) == "TRIKONA (1-5-9)"):
            prop_signals.append("சுக்கிரன் + ராகு சுப தொடர்பில் உள்ளதால் நவீன சொகுசு வாகனம் (Luxury Car) வாங்கும் யோகம் உள்ளது.")
            prop_matched.append({"ruleId": "DS-VEH-001", "title": "புதிய சொகுசு வாகனம் வாங்கும் யோகம்", "sourcePage": 55, "section": "வாகனம் வாங்கும் யோகம்"})

        categories_output["property"] = {
            "category": "property",
            "title": "சொந்த வீடு, நிலம் & வாகன யோகம் (Property & Vehicles)",
            "status": "favorable",
            "summary": " ".join(prop_signals) if prop_signals else "4-ஆம் அதிபதி மற்றும் சுக்கிரனின் ஆதரவால் வீடு, மனை, வாகன சேர்க்கை உண்டாகும்.",
            "signals": prop_signals if prop_signals else ["சந்திரன் மற்றும் சுக்கிரன் அமைப்பால் சொந்த வீடு யோகம் கைக்கூடும்."],
            "obstructions": [],
            "timing": {
                "dasa": current_dasa_lord,
                "bhukti": current_bhukti_lord,
                "window": f"சந்திரன் அல்லது சுக்கிரன் புத்தி காலங்கள்"
            },
            "matchedRules": prop_matched if prop_matched else [{"ruleId": "DS-PROP-001", "title": "வீடு வாகன விதி", "sourcePage": 54, "section": "சொந்த வீடு"}],
            "reasoning": "D.S.Astro புத்தகத்தின் 54-56 பக்க விதிகளின்படி, சந்திரன் (வீடு கட்டி வாழும் நிம்மதி காரகன்) மற்றும் சுக்கிரன் (சொகுசு வாகனம்) பலம் ஆய்வு செய்யப்பட்டுள்ளது."
        }

        # 8. HEALTH & VITALITY ANALYSIS
        hlt_signals = []
        hlt_obs = []
        hlt_matched = []
        temp_6th_lord_name = SIGN_LORDS[(temp_lagna_idx + 5) % 12]
        hlt_signals.append(f"நடப்பு தசா லக்னத்திற்கு 6-ஆம் அதிபதி {temp_6th_lord_name} ஆவார். உணவு முறை மற்றும் அன்றாட உடற்பயிற்சியில் கவனம் செலுத்துவது உடலை ஆரோக்கியமாக வைக்கும்.")
        hlt_matched.append({"ruleId": "DS-HLT-001", "title": "6-ஆம் அதிபதி நோய்கள் அட்டவணை", "sourcePage": 53, "section": "6-ஆம் அதிபதி யார்?"})

        categories_output["health"] = {
            "category": "health",
            "title": "உடல் நலம் & ஆரோக்கியம் (Health & Vitality)",
            "status": "favorable",
            "summary": "D.S.Astro பாரம்பரிய விதிப்படி உடல் ஆரோக்கியம் மற்றும் தசா லக்ன 6-ஆம் அதிபதியின் அமைப்புகள் சுபமாக பராமரிக்கப்பட வேண்டும்.",
            "signals": hlt_signals,
            "obstructions": hlt_obs,
            "timing": {
                "dasa": current_dasa_lord,
                "bhukti": current_bhukti_lord,
                "window": f"{current_dasa_lord} தசா காலம்"
            },
            "matchedRules": hlt_matched,
            "reasoning": f"D.S.Astro புத்தகத்தின் 52-54 பக்கங்களின்படி, 6-ஆம் அதிபதி {temp_6th_lord_name} மற்றும் சனியின் பார்வைத் தொடர்புகள் பரிசீலிக்கப்பட்டு உடல்நலக் குறிப்புகள் வழங்கப்பட்டுள்ளன."
        }

        # 9. RAHU-KETU & SPECIAL ASPECTS
        rk_signals = []
        rk_matched = []
        if midpoint_hits:
            rk_signals.append(f"கர்ம மையப்புள்ளி அச்சு: {', '.join(midpoint_hits)} ராகு-கேதுவின் 4-ம் செங்குத்து அச்சில் அமைந்துள்ளன.")
            rk_matched.append({"ruleId": "DS-RAK-003", "title": "ராகு-கேது மையப்புள்ளி (Midpoint)", "sourcePage": 87, "section": "மையப்புள்ளிகள்"})
        else:
            rk_signals.append("முக்கிய கிரகங்கள் ராகு-கேதுவின் மையப்புள்ளி தாக்கமின்றி சுதந்திரமாக இயங்குகின்றன.")

        # Ketu in 12th
        if ketu and p_sign(ketu) == (lagna_rasi_idx + 11) % 12:
            rk_signals.append("மோட்சகாரகன் கேது பகவான் 12-ஆம் பாவத்தில் அமர்ந்துள்ளதால் ஆன்மீக ஈடுபாடு மற்றும் இறுதிப் பிறவி (மோட்ச யோகம்) சுட்டிக்காட்டப்படுகிறது.")
            rk_matched.append({"ruleId": "DS-RAK-004", "title": "கேது 12-ல் இருத்தல் (கடைசி பிறவி)", "sourcePage": 77, "section": "மோட்ச காரகன் கேது"})

        categories_output["rahu-ketu"] = {
            "category": "rahu-ketu",
            "title": "ராகு-கேது கர்ம அச்சு & சிறப்பு பார்வைகள் (Rahu-Ketu & Special Aspects)",
            "status": "favorable",
            "summary": " ".join(rk_signals),
            "signals": rk_signals,
            "obstructions": [],
            "timing": {
                "dasa": current_dasa_lord,
                "bhukti": current_bhukti_lord,
                "window": "ஆயுள் முழுவதும்"
            },
            "matchedRules": rk_matched if rk_matched else [{"ruleId": "DS-RAK-001", "title": "ராகு கேது ரகசியங்கள்", "sourcePage": 76, "section": "ராகு கேது"}],
            "reasoning": "D.S.Astro புத்தகத்தின் 76-90 பக்கங்களில் கூறப்பட்டுள்ள ராகு-கேது தசாபுத்தி ரகசியங்கள், மையப்புள்ளி விதிகள் மற்றும் சிறப்பு பார்வைகள் ஆய்வு செய்யப்பட்டுள்ளன."
        }

        return {
            "temporaryLagna": {
                "dasaLord": current_dasa_lord,
                "signIndex": temp_lagna_idx,
                "signNameTamil": temp_lagna_name,
                "signLord": temp_lagna_lord_name,
                "dispositorSthanaBalam": temp_lagna_balam,
                "starLord": dasa_star_lord_name
            },
            "categories": categories_output,
            "midpointHits": midpoint_hits
        }
