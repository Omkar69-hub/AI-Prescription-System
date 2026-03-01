# backend/app/routes/auth.py

from fastapi import APIRouter, HTTPException, Depends, status
from passlib.context import CryptContext
from app.models.user import UserCreate, UserOut, get_user_by_email
from app.core.security import create_access_token, verify_password
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

router = APIRouter()

# ----------------------------
# Password hashing
# ----------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_user_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ----------------------------
# Signup
# ----------------------------
@router.post("/signup", response_model=UserOut)
async def signup(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    existing_user = await get_user_by_email(user.email, db)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    user_dict = user.dict()
    user_dict["hashed_password"] = hash_password(user_dict.pop("password"))
    # Default role if not provided
    if "role" not in user_dict:
        user_dict["role"] = "patient"

    result = await db["users"].insert_one(user_dict)
    user_out = UserOut(**user_dict, _id=result.inserted_id)
    return user_out

# ----------------------------
# Login
# ----------------------------
class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(login_data: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await db["users"].find_one({"email": login_data.email})
    
    if not user or not verify_user_password(login_data.password, user.get("hashed_password") or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token_data = {"user_id": str(user["_id"]), "role": user.get("role", "patient")}
    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.get("role", "patient"),
        "user": {
            "email": user["email"],
            "full_name": user.get("full_name"),
            "role": user.get("role", "patient")
        }
    }
