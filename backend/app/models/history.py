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
    action_type: str                  # e.g., "symptom_search", "prescription_upload"
    description: Optional[str] = ""  # Optional details about the action
    metadata: Optional[dict] = {}    # Any extra info (e.g., symptoms, prescription id)

class HistoryCreate(HistoryBase):
    pass

class HistoryOut(HistoryBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ----------------------------
# Database helper functions
# ----------------------------
async def create_history(history: HistoryCreate) -> HistoryOut:
    data = history.dict()
    data["created_at"] = datetime.utcnow()
    result = await db["history"].insert_one(data)
    return HistoryOut(**data, _id=result.inserted_id)

async def get_history_by_user(user_id: str) -> List[HistoryOut]:
    histories = []
    cursor = db["history"].find({"user_id": ObjectId(user_id)}).sort("created_at", -1)
    async for item in cursor:
        histories.append(HistoryOut(**item))
    return histories
