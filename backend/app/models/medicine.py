from typing import Optional
from pydantic import BaseModel, Field


# ----------------------------
# Base Medicine Schema
# ----------------------------
class MedicineBase(BaseModel):
    brand_name: str
    generic_name: str
    dosage: Optional[str] = None
    description: Optional[str] = None


# ----------------------------
# Output Schema (API Response)
# ----------------------------
class MedicineOut(MedicineBase):
    id: str = Field(..., alias="_id")

    class Config:
        populate_by_name = True
