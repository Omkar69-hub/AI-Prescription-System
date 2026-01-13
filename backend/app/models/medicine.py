# backend/app/models/medicine.py

from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId
from app.core.database import db

# ----------------------------
# Helper class to handle ObjectId
# ----------------------------
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


# ----------------------------
# Pydantic Models
# ----------------------------
class MedicineBase(BaseModel):
    brand_name: str
    generic_name: str
    dosage: Optional[str] = None
    description: Optional[str] = None

class MedicineCreate(MedicineBase):
    pass

class MedicineOut(MedicineBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")


# ----------------------------
# Database helper functions
# ----------------------------
async def create_medicine(medicine: MedicineCreate) -> MedicineOut:
    med_dict = medicine.dict()
    result = await db["medicines"].insert_one(med_dict)
    return MedicineOut(**med_dict, _id=result.inserted_id)

async def get_medicine_by_brand(brand_name: str) -> Optional[MedicineOut]:
    med_data = await db["medicines"].find_one({"brand_name": brand_name})
    if med_data:
        return MedicineOut(**med_data)
    return None

async def get_all_medicines() -> List[MedicineOut]:
    medicines = []
    cursor = db["medicines"].find({})
    async for med in cursor:
        medicines.append(MedicineOut(**med))
    return medicines
