# backend/app/models/user.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import get_password_hash, verify_password

# ----------------------------
# Helper class to handle ObjectId
# ----------------------------
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string"}

# ----------------------------
# Pydantic models for User
# ----------------------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = "patient"

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        populate_by_name = True

class UserInDB(UserBase):
    hashed_password: str

# ----------------------------
# Database helper functions
# ----------------------------
async def create_user(user: UserCreate, db: AsyncIOMotorDatabase) -> UserOut:
    user_dict = user.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    result = await db["users"].insert_one(user_dict)
    return UserOut(**user_dict, _id=result.inserted_id)

async def get_user_by_email(email: str, db: AsyncIOMotorDatabase):
    user_data = await db["users"].find_one({"email": email})
    return user_data  # return raw dict for flexibility

async def verify_user(email: str, password: str, db: AsyncIOMotorDatabase) -> bool:
    user = await get_user_by_email(email, db)
    if not user:
        return False
    return verify_password(password, user.get("hashed_password", ""))
