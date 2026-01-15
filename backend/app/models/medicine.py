# backend/app/models/medicine.py

from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId


# ----------------------------
# MongoDB ObjectId handler
# ----------------------------
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


# ----------------------------
# Base schema
# ----------------------------
class MedicineBase(BaseModel):
    brand_name: str
    generic_name: str
    dosage: Optional[str] = None
    description: Optional[str] = None


# ----------------------------
# Output schema (CLEAN RESPONSE)
# ----------------------------
class MedicineOut(MedicineBase):
    id: str = Field(...)

    @classmethod
    def from_mongo(cls, data: dict):
        """
        Convert MongoDB document to API response
        """
        return cls(
            id=str(data["_id"]),
            brand_name=data["brand_name"],
            generic_name=data["generic_name"],
            dosage=data.get("dosage"),
            description=data.get("description"),
        )
