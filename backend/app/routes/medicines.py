# backend/app/routes/medicines.py

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_database
from app.models.medicine import MedicineOut

router = APIRouter(
    prefix="/api/medicines",
    tags=["Medicines"]
)

# ----------------------------
# Get all medicines
# ----------------------------
@router.get("/", response_model=list[MedicineOut])
async def get_all_medicines(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Fetch all medicines from the database.
    Converts MongoDB _id to string id for frontend use.
    """
    medicines = []
    cursor = db.medicines.find({})  # fetch all

    async for medicine in cursor:
        # Convert MongoDB document to Pydantic model
        medicines.append(MedicineOut.from_mongo(medicine))

    return medicines
