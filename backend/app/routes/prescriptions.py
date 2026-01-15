# backend/app/routes/prescriptions.py

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from app.models.prescription import PrescriptionCreate, PrescriptionOut, get_prescriptions_by_user, create_prescription
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/api/prescriptions", tags=["Prescriptions"])

# ----------------------------
# Get prescriptions by user
# ----------------------------
@router.get("/", response_model=List[PrescriptionOut])
async def read_prescriptions(user_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    prescriptions = await get_prescriptions_by_user(user_id)
    return prescriptions

# ----------------------------
# Add new prescription
# ----------------------------
@router.post("/add", response_model=PrescriptionOut)
async def add_prescription(prescription: PrescriptionCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    new_pres = await create_prescription(prescription)
    return new_pres
