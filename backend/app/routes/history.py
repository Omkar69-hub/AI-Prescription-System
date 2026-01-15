# backend/app/routes/history.py

from fastapi import APIRouter, Depends, HTTPException
from app.models.history import HistoryCreate, HistoryOut, create_history, get_history_by_user
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

router = APIRouter()

# ----------------------------
# Get user history
# ----------------------------
@router.get("/", response_model=List[HistoryOut])
async def get_history(user_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Get all history records for a specific user
    """
    try:
        return await get_history_by_user(user_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")


# ----------------------------
# Add history record
# ----------------------------
@router.post("/add", response_model=HistoryOut)
async def add_history(record: HistoryCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Save a new history record
    """
    try:
        return await create_history(record, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save history: {str(e)}")
