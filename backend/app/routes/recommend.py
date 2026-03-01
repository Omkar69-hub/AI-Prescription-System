# backend/app/routes/recommend.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
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
    buy_link: Optional[str] = None

class SymptomRequest(BaseModel):
    symptoms: str

class RecommendationResponse(BaseModel):
    condition: str
    description: str
    diet: str
    workout: str
    medicines: List[MedicineInfo]

def build_buy_link(medicine_name: str) -> str:
    """Generate a search link for buying the medicine online."""
    query = medicine_name.replace(" ", "+")
    return f"https://www.netmeds.com/catalogsearch/result?q={query}"

# ----------------------------
# Recommendation Endpoint (saves to history automatically)
# ----------------------------
@router.post("/recommend", response_model=RecommendationResponse)
async def recommend_medicine(
    data: SymptomRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    input_text = data.symptoms.lower()
    matched_rec = None

    # Keyword matching against DB recommendations
    cursor = db["recommendations"].find()
    async for rec in cursor:
        for s in rec.get("symptoms", []):
            if s.lower() in input_text:
                matched_rec = rec
                break
        if matched_rec:
            break

    if not matched_rec:
        # Fallback: generic suggestion
        matched_rec = {
            "condition": "General Discomfort",
            "description": "Based on your symptoms, we cannot pinpoint a specific condition. Please consult a doctor for a thorough evaluation.",
            "diet": "Drink plenty of water, eat balanced meals rich in vegetables and lean protein.",
            "workout": "Rest as needed. Light walking is fine if you feel comfortable.",
            "medicines": [
                {"brand": "Paracetamol", "generic": "Acetaminophen", "dosage": "500mg", "timing": "Every 6–8 hours as needed"},
                {"brand": "ORS Sachet", "generic": "Oral Rehydration Salts", "dosage": "1 sachet in 1L water", "timing": "As needed for dehydration"},
            ]
        }

    # Build medicine list with buy links
    medicines_with_links = []
    for m in matched_rec.get("medicines", []):
        medicines_with_links.append(MedicineInfo(
            brand=m.get("brand", ""),
            generic=m.get("generic", ""),
            dosage=m.get("dosage", ""),
            timing=m.get("timing", "As directed"),
            buy_link=build_buy_link(m.get("generic", m.get("brand", ""))),
        ))

    # Auto-save to history
    try:
        history_record = {
            "user_id": ObjectId(current_user["user_id"]),
            "symptoms": data.symptoms,
            "condition": matched_rec["condition"],
            "medicines": [
                {"brand": m.brand, "generic": m.generic, "dosage": m.dosage}
                for m in medicines_with_links
            ],
            "created_at": datetime.utcnow(),
        }
        await db["history"].insert_one(history_record)
    except Exception:
        pass  # Don't fail the main request if history save fails

    return RecommendationResponse(
        condition=matched_rec["condition"],
        description=matched_rec["description"],
        diet=matched_rec["diet"],
        workout=matched_rec["workout"],
        medicines=medicines_with_links,
    )
