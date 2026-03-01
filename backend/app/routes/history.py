# backend/app/routes/history.py

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.security import get_current_user

router = APIRouter()

def serialize_history(doc) -> dict:
    doc["id"] = str(doc.pop("_id", ""))
    doc["user_id"] = str(doc.get("user_id", ""))
    return doc

# ----------------------------
# Patient: Get own history
# ----------------------------
@router.get("/")
async def get_my_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user["user_id"]
    cursor = db["history"].find({"user_id": ObjectId(user_id)}).sort("created_at", -1)
    records = [serialize_history(doc) async for doc in cursor]
    return records


# ----------------------------
# Doctor: Get all patients' history with their info
# ----------------------------
@router.get("/all-patients")
async def get_all_patient_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if current_user["role"] not in ("doctor", "admin"):
        raise HTTPException(status_code=403, detail="Only doctors can view patient history.")

    cursor = db["history"].find({}).sort("created_at", -1)
    records = []
    async for doc in cursor:
        serialized = serialize_history(doc)
        # Enrich with patient's name, email, phone from users collection
        try:
            patient = await db["users"].find_one({"_id": ObjectId(serialized["user_id"])})
            if patient:
                serialized["patient_name"] = patient.get("full_name", "Unknown")
                serialized["patient_email"] = patient.get("email", "")
                serialized["patient_phone"] = patient.get("phone", "")
        except Exception:
            serialized["patient_name"] = "Unknown"
            serialized["patient_email"] = ""
            serialized["patient_phone"] = ""
        records.append(serialized)
    return records

# ----------------------------
# Save a symptom search to history (called by recommend endpoint internally)
# ----------------------------
@router.post("/add")
async def add_history(
    record: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    data = {
        "user_id": ObjectId(current_user["user_id"]),
        "symptoms": record.get("symptoms", ""),
        "condition": record.get("condition", ""),
        "medicines": record.get("medicines", []),
        "created_at": datetime.utcnow(),
    }
    result = await db["history"].insert_one(data)
    return {"message": "History saved", "id": str(result.inserted_id)}
