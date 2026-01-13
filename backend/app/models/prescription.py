# backend/app/models/prescription.py

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.core.database import db
from app.models.user import PyObjectId

# ----------------------------
# Pydantic Models
# ----------------------------
class PrescriptionBase(BaseModel):
    user_id: PyObjectId
    medicines: Optional[List[str]] = []  # Extracted medicine names
    image_url: Optional[str] = None      # URL to uploaded prescription image
    notes: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionOut(PrescriptionBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ----------------------------
# Database helper functions
# ----------------------------
async def create_prescription(prescription: PrescriptionCreate) -> PrescriptionOut:
    data = prescription.dict()
    data["created_at"] = datetime.utcnow()
    result = await db["prescriptions"].insert_one(data)
    return PrescriptionOut(**data, _id=result.inserted_id)

async def get_prescriptions_by_user(user_id: str) -> List[PrescriptionOut]:
    prescriptions = []
    cursor = db["prescriptions"].find({"user_id": ObjectId(user_id)}).sort("created_at", -1)
    async for pres in cursor:
        prescriptions.append(PrescriptionOut(**pres))
    return prescriptions

async def get_prescription_by_id(prescription_id: str) -> Optional[PrescriptionOut]:
    pres = await db["prescriptions"].find_one({"_id": ObjectId(prescription_id)})
    if pres:
        return PrescriptionOut(**pres)
    return None
