# backend/app/routes/history.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from app.models.history import db, HistoryCreate, HistoryOut
from bson import ObjectId

router = APIRouter()

# ----------------------------
# Get user history
# ----------------------------
@router.get("/")
async def get_history(user_id: str = None):
    """
    Get all history records for the logged-in user
    """
    try:
        query = {"user_id": ObjectId(user_id)} if user_id else {}
        cursor = db["history"].find(query).sort("created_at", -1)
        history_list = []
        async for record in cursor:
            history_list.append(HistoryOut(**record, id=record["_id"]))
        return history_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

# ----------------------------
# Add history record
# ----------------------------
@router.post("/add")
async def add_history(record: HistoryCreate):
    """
    Save a new history record
    """
    try:
        result = await db["history"].insert_one(record.dict())
        return {"message": "History saved", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save history: {str(e)}")
