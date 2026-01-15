# backend/app/models/history.py

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from app.models.user import PyObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

# ----------------------------
# Pydantic Models
# ----------------------------
class HistoryBase(BaseModel):
    user_id: PyObjectId
    action_type: str
    description: Optional[str] = ""
    metadata: Optional[dict] = {}

class HistoryCreate(HistoryBase):
    pass

class HistoryOut(HistoryBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda dt: dt.isoformat()}


# ----------------------------
# Database helper functions
# ----------------------------
async def create_history(history: HistoryCreate, db: AsyncIOMotorDatabase) -> HistoryOut:
    """
    Save a history record into MongoDB
    """
    data = history.dict()
    data["user_id"] = ObjectId(data["user_id"])
    data["created_at"] = datetime.utcnow()

    result = await db["history"].insert_one(data)
    return HistoryOut(**data, _id=result.inserted_id)


async def get_history_by_user(user_id: str, db: AsyncIOMotorDatabase) -> List[HistoryOut]:
    """
    Fetch all history records for a given user_id
    """
    cursor = db["history"].find({"user_id": ObjectId(user_id)}).sort("created_at", -1)
    return [HistoryOut(**doc) async for doc in cursor]
