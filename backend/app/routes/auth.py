# backend/app/routes/auth.py

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from app.models.user import UserCreate, UserOut, db
from app.core.security import create_access_token

router = APIRouter()

# ----------------------------
# Password hashing
# ----------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ----------------------------
# Signup
# ----------------------------
@router.post("/signup", response_model=UserOut)
async def signup(user: UserCreate):
    # Check if user already exists
    existing_user = await db["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
    
    hashed_pw = hash_password(user.password)
    user_dict = user.dict()
    user_dict["password"] = hashed_pw
    
    result = await db["users"].insert_one(user_dict)
    user_out = UserOut(**user_dict, id=result.inserted_id)
    return user_out

# ----------------------------
# Login
# ----------------------------
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db["users"].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = {"user_id": str(user["_id"])}
    access_token = create_access_token(token_data)
    
    return {"access_token": access_token, "token_type": "bearer", "user": UserOut(**user, id=user["_id"])}
