# backend/app/models/prescription.py

from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

# ----------------------------
# Pydantic Schemas
# ----------------------------

class PrescriptionCreate(BaseModel):
    user_id: str
    disease: str
    medicines: List[str]

class PrescriptionOut(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    disease: str
    medicines: List[str]
    created_at: datetime

    class Config:
        allow_population_by_field_name = True
        json_encoders = {str: str}

# ----------------------------
# Database functions
# ----------------------------

async def create_prescription(prescription: PrescriptionCreate, db: AsyncIOMotorDatabase):
    data = prescription.dict()
    data["created_at"] = datetime.utcnow()
    result = await db.prescriptions.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return PrescriptionOut(**data)

async def get_prescriptions_by_user(user_id: str, db: AsyncIOMotorDatabase):
    cursor = db.prescriptions.find({"user_id": user_id}).sort("created_at", -1)
    return [PrescriptionOut(**{**doc, "_id": str(doc["_id"])}) async for doc in cursor]
