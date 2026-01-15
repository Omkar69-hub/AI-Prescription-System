from typing import List, Optional
from app.core.database import db
from app.models.medicine import MedicineCreate, MedicineOut


# ----------------------------
# Create Medicine
# ----------------------------
async def create_medicine(medicine: MedicineCreate) -> MedicineOut:
    data = medicine.dict()
    result = await db.medicines.insert_one(data)
    data["_id"] = result.inserted_id
    return MedicineOut(**data)


# ----------------------------
# Get Medicine by Brand
# ----------------------------
async def get_medicine_by_brand(brand_name: str) -> Optional[MedicineOut]:
    data = await db.medicines.find_one({"brand_name": brand_name})
    if data:
        return MedicineOut(**data)
    return None


# ----------------------------
# Get All Medicines
# ----------------------------
async def get_all_medicines() -> List[MedicineOut]:
    medicines = []
    async for med in db.medicines.find({}):
        medicines.append(MedicineOut(**med))
    return medicines
