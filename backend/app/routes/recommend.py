# backend/app/routes/recommend.py

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

# ----------------------------
# Request / Response Models
# ----------------------------
class SymptomRequest(BaseModel):
    symptoms: List[str]

class RecommendationResponse(BaseModel):
    disease: str
    medicines: List[str]
    advice: str

# ----------------------------
# Recommendation Endpoint
# ----------------------------
@router.post("/recommend", response_model=RecommendationResponse)
async def recommend_medicine(data: SymptomRequest):
    """
    Dummy recommendation logic (replace later with ML / NLP)
    """
    symptoms = [s.lower() for s in data.symptoms]

    if "fever" in symptoms and "cold" in symptoms:
        return {
            "disease": "Common Cold",
            "medicines": ["Paracetamol", "Cetirizine"],
            "advice": "Drink warm fluids and take rest"
        }

    return {
        "disease": "Unknown",
        "medicines": ["Consult a doctor"],
        "advice": "Symptoms unclear"
    }
