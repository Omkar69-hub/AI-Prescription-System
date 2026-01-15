from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_database
from app.models.medicine import MedicineOut

router = APIRouter()

# ----------------------------
# Get all medicines
# ----------------------------
@router.get("/", response_model=list[MedicineOut])
async def get_all_medicines(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    medicines = []
    cursor = db.medicines.find({})

    async for medicine in cursor:
        medicines.append(MedicineOut.from_mongo(medicine))

    return medicines
