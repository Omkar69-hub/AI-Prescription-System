from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.medicine import MedicineOut
from app.core.database import get_database

router = APIRouter()


@router.get("/", response_model=list[MedicineOut])
async def get_all_medicines(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    medicines = []
    cursor = db.medicines.find({})

    async for medicine in cursor:
        # Convert ObjectId → string
        medicine["_id"] = str(medicine["_id"])
        medicines.append(medicine)

    if not medicines:
        raise HTTPException(status_code=404, detail="No medicines found")

    return medicines
