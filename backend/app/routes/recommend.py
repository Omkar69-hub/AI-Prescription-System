# backend/app/routes/recommend.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

# ----------------------------
# Request / Response Models
# ----------------------------
class MedicineInfo(BaseModel):
    brand: str
    generic: str
    dosage: str
    timing: str

class SymptomRequest(BaseModel):
    symptoms: str  # Now accepting a string (sentence or keywords)

class RecommendationResponse(BaseModel):
    condition: str
    description: str
    diet: str
    workout: str
    medicines: List[MedicineInfo]

# ----------------------------
# Recommendation Endpoint
# ----------------------------
@router.post("/recommend", response_model=RecommendationResponse)
async def recommend_medicine(data: SymptomRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Search MongoDB for matching symptoms and return a structured recommendation.
    """
    input_text = data.symptoms.lower()
    
    # Simple keyword matching logic
    # In a real app, this would use NLP or vector search
    cursor = db["recommendations"].find()
    async for rec in cursor:
        # Check if any of the keywords in the DB entry exist in the user's input
        for s in rec.get("symptoms", []):
            if s.lower() in input_text:
                return RecommendationResponse(
                    condition=rec["condition"],
                    description=rec["description"],
                    diet=rec["diet"],
                    workout=rec["workout"],
                    medicines=[MedicineInfo(**m) for m in rec["medicines"]]
                )

    # Default fallback if no match found
    raise HTTPException(
        status_code=404,
        detail="No specific analysis found for these symptoms. Please consult a doctor."
    )
