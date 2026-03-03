# backend/app/routes/recommend.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import re
from app.core.database import get_database
from app.core.security import get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

# ----------------------------
# Models
# ----------------------------
class MedicineInfo(BaseModel):
    brand: str
    generic: str
    dosage: str
    timing: str
    buy_link: Optional[str] = None          # 1mg search (generic molecule)
    brand_link: Optional[str] = None         # 1mg search (brand name)
    pharmeasy_link: Optional[str] = None     # PharmEasy search (generic molecule)

class SymptomRequest(BaseModel):
    symptoms: str

class RecommendationResponse(BaseModel):
    condition: str
    description: str
    diet: str
    workout: str
    medicines: List[MedicineInfo]

# ----------------------------
# Link / URL helpers
# ----------------------------
def _clean_name(name: str) -> str:
    """
    Strip dosage quantities and units so the search is molecule-only.
    e.g. "Paracetamol 650mg" -> "Paracetamol"
         "Alprazolam 0.25mg" -> "Alprazolam"
         "Ibuprofen 400mg + Paracetamol 325mg" -> "Ibuprofen"
         "Cholecalciferol 60,000 IU (Vitamin D3)" -> "Cholecalciferol"
    """
    # Remove dosage numbers + units (with optional comma-separated numbers)
    cleaned = re.sub(
        r'[\d][\d,.]*\s*(?:mg|ml|mcg|g\b|%|IU|lakh)\b',
        '', name, flags=re.IGNORECASE
    )
    # Remove parenthetical alternate names
    cleaned = re.sub(r'\([^)]*\)', '', cleaned)
    # Take only the first active ingredient (before + or ,)
    cleaned = re.split(r'\s*\+\s*|\s*,\s*', cleaned)[0]
    return ' '.join(cleaned.split()).strip()

def build_buy_link(medicine_name: str) -> str:
    """1mg search URL using the cleaned molecule name."""
    mol = _clean_name(medicine_name)
    query = mol.replace(' ', '+')
    return f"https://www.1mg.com/search/all?name={query}"

def build_pharmeasy_link(medicine_name: str) -> str:
    """PharmEasy search URL using the cleaned molecule name."""
    mol = _clean_name(medicine_name)
    query = mol.replace(' ', '+')
    return f"https://pharmeasy.in/search/all?name={query}"

def build_brand_link(brand_name: str) -> str:
    """1mg search URL using only the first word of the brand name."""
    first_word = brand_name.strip().split()[0]
    return f"https://www.1mg.com/search/all?name={first_word}"

# ----------------------------
# Intelligent Fallback
# ----------------------------
def _ai_fallback(input_text: str) -> dict:
    """
    Rule-based intelligent fallback covering broad categories.
    Used when no DB record matches the user's symptoms.
    """
    txt = input_text.lower()

    # Pain-related
    if any(w in txt for w in ["pain", "ache", "hurt", "sore", "cramp"]):
        return {
            "condition": "General Pain / Discomfort",
            "description": "Pain can have many causes. This general recommendation is intended for mild, acute pain. Please consult a doctor if pain is severe, persistent, or accompanied by other symptoms.",
            "diet": "Anti-inflammatory foods: turmeric, ginger, berries, leafy greens. Stay well-hydrated. Avoid alcohol and processed foods.",
            "workout": "Rest the affected area. Light stretching and heat/cold therapy. Consult a physiotherapist for chronic pain.",
            "medicines": [
                {"brand": "Combiflam", "generic": "Ibuprofen 400mg + Paracetamol 325mg", "dosage": "1 tablet", "timing": "Every 8 hours after meals — max 3 days"},
                {"brand": "Crocin Pain Relief", "generic": "Paracetamol 650mg", "dosage": "1 tablet", "timing": "Every 6–8 hours (milder option, gentler on stomach)"},
            ]
        }

    # Skin-related
    if any(w in txt for w in ["skin", "rash", "itch", "scar", "spot", "bump", "pustule"]):
        return {
            "condition": "General Skin Condition",
            "description": "Various skin conditions present with similar symptoms. This general recommendation covers mild, non-emergency skin issues.",
            "diet": "Increase Vitamin E, Vitamin C, and zinc intake. Stay hydrated (8–10 glasses/day). Reduce processed sugar and dairy.",
            "workout": "Shower immediately after exercise. Wear breathable fabrics. Avoid scratching or touching affected areas.",
            "medicines": [
                {"brand": "Calamine Lotion", "generic": "Calamine + Zinc Oxide", "dosage": "Apply thin layer", "timing": "2–3 times daily — gentle on skin, safe for most conditions"},
                {"brand": "Hydrocortisone 1% Cream", "generic": "Hydrocortisone 1% Topical", "dosage": "Apply small amount", "timing": "Twice daily for up to 7 days — consult dermatologist for prolonged use"},
            ]
        }

    # Fatigue / weakness
    if any(w in txt for w in ["tired", "fatigue", "exhausted", "weak", "no energy", "lethargic", "sluggish"]):
        return {
            "condition": "Fatigue / General Weakness",
            "description": "Persistent fatigue may indicate nutritional deficiency, anemia, thyroid issues, or sleep disorders. Consult a doctor for blood tests.",
            "diet": "Iron-rich foods (spinach, lentils), B12 sources (eggs, fish), and adequate protein. Avoid excessive sugar which causes energy crashes.",
            "workout": "Gentle daily walks 20–30 minutes. Avoid overexertion. Adequate sleep (7–9 hours) is critical.",
            "medicines": [
                {"brand": "Becadexamin", "generic": "Multivitamin + Minerals Capsule", "dosage": "1 capsule daily", "timing": "After breakfast"},
                {"brand": "Shelcal 500", "generic": "Calcium 500mg + Vitamin D3 250 IU", "dosage": "1 tablet twice daily", "timing": "With meals"},
            ]
        }

    # Eye problems
    if any(w in txt for w in ["eye", "vision", "blur", "seeing", "sight"]):
        return {
            "condition": "Eye Discomfort / Strain",
            "description": "Eye strain is common from prolonged screen use. Other causes include dry eyes, infection, or refractive error.",
            "diet": "Vitamin A-rich foods (carrots, sweet potato, leafy greens) support eye health. Omega-3 reduces dry eye.",
            "workout": "Follow the 20-20-20 rule: every 20 min, look 20 feet away for 20 seconds. Regular outdoor activity benefits eye health.",
            "medicines": [
                {"brand": "Refresh Tears", "generic": "Carboxymethylcellulose 0.5% Eye Drops", "dosage": "1–2 drops per eye", "timing": "As needed for dryness — up to 6 times daily"},
                {"brand": "Optive Eye Drops", "generic": "Carboxymethylcellulose 0.5% + Glycerin 0.9%", "dosage": "1 drop per eye", "timing": "3–4 times daily"},
            ]
        }

    # Respiratory (general)
    if any(w in txt for w in ["breath", "lungs", "chest", "oxygen", "inhale"]):
        return {
            "condition": "Respiratory Discomfort",
            "description": "Breathing difficulties can range from mild congestion to serious conditions. Seek emergency care if breathlessness is severe.",
            "diet": "Anti-inflammatory diet. Warm liquids help soothe airways. Honey and ginger are natural bronchodilators.",
            "workout": "Steam inhalation twice daily. Pursed lip breathing exercises. Avoid smoke and polluted air.",
            "medicines": [
                {"brand": "Asthalin Inhaler", "generic": "Salbutamol 100mcg Inhaler", "dosage": "2 puffs as needed", "timing": "For breathlessness — seek medical advice if needed frequently"},
                {"brand": "Nasoclear Saline Spray", "generic": "Isotonic Saline 0.9%", "dosage": "2 sprays per nostril", "timing": "3–4 times daily to clear airways"},
            ]
        }

    # Default general fallback
    return {
        "condition": "General Discomfort",
        "description": "Based on your description, we recommend a general supportive approach. For accurate diagnosis, please consult a doctor who can examine you in person.",
        "diet": "Eat a balanced diet with plenty of fruits, vegetables, and whole grains. Drink 8–10 glasses of water daily. Avoid junk food, alcohol, and excessive caffeine.",
        "workout": "Light physical activity (walking 20–30 min/day) supports overall health. Adequate sleep (7–8 hours) and stress management are equally important.",
        "medicines": [
            {"brand": "Crocin 500", "generic": "Paracetamol 500mg", "dosage": "1 tablet", "timing": "Every 6–8 hours as needed for general discomfort"},
            {"brand": "Electral ORS", "generic": "Oral Rehydration Salts", "dosage": "1 sachet in 1L water", "timing": "As needed to maintain hydration"},
        ]
    }

# ----------------------------
# Recommendation Endpoint
# ----------------------------
@router.post("/recommend", response_model=RecommendationResponse)
async def recommend_medicine(
    data: SymptomRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    input_text = data.symptoms.lower()

    # ── Step 1: Score every DB record by how many keywords match ──────────────
    scored = []
    async for rec in db["recommendations"].find():
        score = 0
        for keyword in rec.get("symptoms", []):
            if keyword.lower() in input_text:
                score += 1
        if score > 0:
            scored.append((score, rec))

    if scored:
        # Pick the highest-scoring match
        scored.sort(key=lambda x: x[0], reverse=True)
        matched_rec = scored[0][1]
    else:
        # ── Step 2: Intelligent fallback ────────────────────────────────────────
        matched_rec = _ai_fallback(input_text)

    # ── Step 3: Build medicine list with three links each ─────────────────────
    medicines_with_links = []
    for m in matched_rec.get("medicines", []):
        brand   = m.get("brand", "")
        generic = m.get("generic", "")
        medicines_with_links.append(MedicineInfo(
            brand=brand,
            generic=generic,
            dosage=m.get("dosage", ""),
            timing=m.get("timing", "As directed"),
            buy_link=build_buy_link(generic),        # 1mg generic search (molecule only)
            brand_link=build_brand_link(brand),      # 1mg brand first-word search
            pharmeasy_link=build_pharmeasy_link(generic),  # PharmEasy fallback
        ))

    # ── Step 4: Auto-save to history ──────────────────────────────────────────
    try:
        await db["history"].insert_one({
            "user_id": ObjectId(current_user["user_id"]),
            "symptoms": data.symptoms,
            "condition": matched_rec["condition"],
            "medicines": [
                {"brand": m.brand, "generic": m.generic, "dosage": m.dosage}
                for m in medicines_with_links
            ],
            "created_at": datetime.utcnow(),
        })
    except Exception:
        pass   # History save failure must not block the response

    return RecommendationResponse(
        condition=matched_rec["condition"],
        description=matched_rec["description"],
        diet=matched_rec["diet"],
        workout=matched_rec["workout"],
        medicines=medicines_with_links,
    )
