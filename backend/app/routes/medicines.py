from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.mongodb import db
from app.models.medicines import Medicine

router = APIRouter()

# -----------------------------
# Get all medicines
# -----------------------------
@router.get("/", response_model=list[Medicine])
async def get_all_medicines(db: AsyncIOMotorDatabase = Depends(get_database)):
    medicines = []
    cursor = db.medicines.find({})
    async for medicine in cursor:
        medicine["id"] = str(medicine["_id"])
        del medicine["_id"]
        medicines.append(medicine)

    return medicines
