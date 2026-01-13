# backend/app/routes/nlp.py

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.ai.nlp_engine import extract_symptoms_from_text, extract_medicines_from_text

router = APIRouter()

class TextInput(BaseModel):
    text: str

@router.post("/extract-symptoms")
async def parse_symptoms(input_data: TextInput):
    """
    Extract symptoms from text
    """
    try:
        symptoms = extract_symptoms_from_text(input_data.text)
        return JSONResponse({"symptoms": symptoms})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract symptoms: {str(e)}")

@router.post("/extract-medicines")
async def parse_medicines(input_data: TextInput):
    """
    Extract medicine names from prescription text
    """
    try:
        medicines = extract_medicines_from_text(input_data.text)
        return JSONResponse({"medicines": medicines})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract medicines: {str(e)}")
