# backend/app/routes/auth.py

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

router = APIRouter()

# ----------------------------
# Signup
# ----------------------------
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = "patient"

@router.post("/signup")
async def signup(user: SignupRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    existing = await db["users"].find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    user_dict = {
        "email": user.email,
        "full_name": user.full_name or "",
        "phone": user.phone or "",
        "role": user.role or "patient",
        "hashed_password": get_password_hash(user.password),
    }
    result = await db["users"].insert_one(user_dict)
    return {"message": "Account created successfully.", "user_id": str(result.inserted_id)}

# ----------------------------
# Login
# ----------------------------
class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(login_data: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await db["users"].find_one({"email": login_data.email})

    if not user or not verify_password(login_data.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = {
        "user_id": str(user["_id"]),
        "role": user.get("role", "patient"),
        "email": user.get("email", ""),
    }
    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.get("role", "patient"),
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user.get("full_name", ""),
            "phone": user.get("phone", ""),
            "role": user.get("role", "patient"),
        }
    }
