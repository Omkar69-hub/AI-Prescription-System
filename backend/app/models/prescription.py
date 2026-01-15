# backend/app/routes/prescriptions.py

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId

from app.models.prescription import (
    PrescriptionCreate,
    PrescriptionOut,
    create_prescription,
    get_prescriptions_by_user,
    get_prescription_by_id
)
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/api/prescriptions", tags=["Prescriptions"])


# ----------------------------
# Get all prescriptions for a user
# ----------------------------
@router.get("/", response_model=List[PrescriptionOut])
async def fetch_prescriptions(user_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Fetch all prescriptions for a user
    """
    try:
        prescriptions = await get_prescriptions_by_user(user_id, db)
        return prescriptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch prescriptions: {str(e)}")


# ----------------------------
# Get a prescription by ID
# ----------------------------
@router.get("/{prescription_id}", response_model=PrescriptionOut)
async def fetch_prescription(prescription_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Fetch a single prescription by its ID
    """
    try:
        prescription = await get_prescription_by_id(prescription_id, db)
        if not prescription:
            raise HTTPException(status_code=404, detail="Prescription not found")
        return prescription
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch prescription: {str(e)}")


# ----------------------------
# Add a new prescription
# ----------------------------
@router.post("/add", response_model=PrescriptionOut)
async def add_prescription(record: PrescriptionCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Save a new prescription
    """
    try:
        new_prescription = await create_prescription(record, db)
        return new_prescription
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save prescription: {str(e)}")
