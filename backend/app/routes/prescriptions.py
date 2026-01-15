# backend/app/routes/prescriptions.py

from fastapi import APIRouter, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

from app.models.prescription import PrescriptionCreate, PrescriptionOut, create_prescription, get_prescriptions_by_user
from app.core.database import get_database

router = APIRouter(
    prefix="/api/prescriptions",
    tags=["Prescriptions"]
)

# ----------------------------
# Get prescriptions by user
# ----------------------------
@router.get("/{user_id}", response_model=List[PrescriptionOut])
async def fetch_prescriptions(user_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Fetch all prescriptions for a given user_id
    """
    return await get_prescriptions_by_user(user_id, db)

# ----------------------------
# Create prescription
# ----------------------------
@router.post("/add", response_model=PrescriptionOut)
async def add_prescription(prescription: PrescriptionCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Add a new prescription
    """
    return await create_prescription(prescription, db)
