# backend/app/routes/admin.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_database
from app.core.security import get_current_user

router = APIRouter()

# ----------------------------
# Models
# ----------------------------
class MedicineMappingCreate(BaseModel):
    brand: str
    generic: str
    disease: str

# ----------------------------
# GET  /api/admin/medicines  — list all medicine mappings
# ----------------------------
@router.get("/medicines")
async def list_medicine_mappings(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if current_user["role"] not in ("admin", "doctor"):
        raise HTTPException(status_code=403, detail="Access denied.")

    cursor = db["medicine_mappings"].find({})
    results = []
    async for doc in cursor:
        results.append({
            "id": str(doc["_id"]),
            "brand": doc.get("brand", ""),
            "generic": doc.get("generic", ""),
            "disease": doc.get("disease", ""),
            "created_at": doc.get("created_at", "").isoformat() if doc.get("created_at") else "",
        })
    return results

# ----------------------------
# POST /api/admin/medicines  — add a new medicine mapping
# ----------------------------
@router.post("/medicines")
async def add_medicine_mapping(
    payload: MedicineMappingCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if current_user["role"] not in ("admin", "doctor"):
        raise HTTPException(status_code=403, detail="Access denied.")

    # Prevent exact duplicates
    existing = await db["medicine_mappings"].find_one({
        "brand": {"$regex": f"^{payload.brand}$", "$options": "i"},
        "disease": {"$regex": f"^{payload.disease}$", "$options": "i"},
    })
    if existing:
        raise HTTPException(status_code=409, detail="A mapping for this brand and condition already exists.")

    doc = {
        "brand": payload.brand.strip(),
        "generic": payload.generic.strip(),
        "disease": payload.disease.strip(),
        "created_at": datetime.utcnow(),
        "created_by": current_user["user_id"],
    }
    result = await db["medicine_mappings"].insert_one(doc)
    return {"message": "Medicine mapping added successfully.", "id": str(result.inserted_id)}

# ----------------------------
# DELETE /api/admin/medicines/{id}  — delete a mapping
# ----------------------------
@router.delete("/medicines/{medicine_id}")
async def delete_medicine_mapping(
    medicine_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete mappings.")

    result = await db["medicine_mappings"].delete_one({"_id": ObjectId(medicine_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mapping not found.")
    return {"message": "Mapping deleted."}
