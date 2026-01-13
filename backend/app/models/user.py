# backend/app/models/user.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.core.database import db
from app.core.security import get_password_hash, verify_password
from bson import ObjectId

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
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


# ----------------------------
# Pydantic models for User
# ----------------------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

class UserInDB(UserBase):
    hashed_password: str

# ----------------------------
# Database helper functions
# ----------------------------
async def create_user(user: UserCreate):
    user_dict = user.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    result = await db["users"].insert_one(user_dict)
    user_out = UserOut(**user_dict, _id=result.inserted_id)
    return user_out

async def get_user_by_email(email: str) -> Optional[UserInDB]:
    user_data = await db["users"].find_one({"email": email})
    if user_data:
        return UserInDB(**user_data)
    return None

async def verify_user(email: str, password: str) -> bool:
    user = await get_user_by_email(email)
    if not user:
        return False
    return verify_password(password, user.hashed_password)
