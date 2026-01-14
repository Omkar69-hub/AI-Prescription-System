# backend/app/models/history.py

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from app.core.database import db
from app.models.user import PyObjectId

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


# ----------------------------
# Database helper functions
# ----------------------------

async def create_history(history: HistoryCreate) -> HistoryOut:
    data = history.dict()
    data["user_id"] = ObjectId(data["user_id"])
    data["created_at"] = datetime.utcnow()

    result = await db["history"].insert_one(data)
    return HistoryOut(**data, _id=result.inserted_id)

async def get_history_by_user(user_id: str) -> List[HistoryOut]:
    cursor = db["history"].find(
        {"user_id": ObjectId(user_id)}
    ).sort("created_at", -1)

    return [HistoryOut(**doc) async for doc in cursor]
