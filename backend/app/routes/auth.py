# backend/app/routes/auth.py
"""
Authentication routes — Signup and Login only.
Google OAuth has been removed. Only registered users may access the system.

Signup behaviour:
  • Email duplicate  → HTTP 400 error (hard block)
  • Name  duplicate  → account is still created; response includes a soft warning
  • Password hashed with bcrypt via passlib

Login behaviour:
  • Accepts email + password only
  • Returns JWT access-token + role-based redirect path
"""

from __future__ import annotations

import re
from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional

from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.database import get_database
from app.utils.notifications import send_login_notification
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────
def _email_query(email: str) -> dict:
    """Case-insensitive email lookup."""
    return {"email": {"$regex": f"^{re.escape(email.strip())}$", "$options": "i"}}

def _name_query(name: str) -> dict:
    """Case-insensitive full_name lookup."""
    return {"full_name": {"$regex": f"^{re.escape(name.strip())}$", "$options": "i"}}


ALLOWED_ROLES = {"patient", "doctor", "admin"}

ROLE_REDIRECT = {
    "admin":   "/admin/dashboard",
    "doctor":  "/doctor/history",
    "patient": "/user/symptom-search",
}


# ─────────────────────────────────────────────────────────────────────────────
# Signup
# ─────────────────────────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    email:     EmailStr
    password:  str
    full_name: Optional[str] = None
    phone:     Optional[str] = None
    role:      Optional[str] = "patient"

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long.")
        return v

    @field_validator("role")
    @classmethod
    def role_valid(cls, v: str) -> str:
        v = (v or "patient").lower().strip()
        if v not in ALLOWED_ROLES:
            raise ValueError(f"Role must be one of: {', '.join(ALLOWED_ROLES)}")
        return v


@router.post("/signup", status_code=201)
async def signup(
    user: SignupRequest,
    background: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Register a new account.

    Rules:
      - Email already used      → 400 error (hard block)
      - Name already used       → account created + soft warning in response
      - Everything else         → account created silently, JWT returned
    """
    # ── Hard block: duplicate email ───────────────────────────────────────
    if await db["users"].find_one(_email_query(user.email)):
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists. Please log in instead.",
        )

    normalized_email = user.email.strip().lower()
    full_name        = (user.full_name or "").strip()
    phone            = (user.phone or "").strip()

    # ── Soft check: duplicate name (warn, but still create) ───────────────
    name_already_taken = False
    if full_name and await db["users"].find_one(_name_query(full_name)):
        name_already_taken = True

    # ── Create account ────────────────────────────────────────────────────
    user_doc = {
        "email":           normalized_email,
        "full_name":       full_name,
        "phone":           phone,
        "role":            user.role,
        "hashed_password": get_password_hash(user.password),
    }
    result  = await db["users"].insert_one(user_doc)
    user_id = str(result.inserted_id)

    # ── Issue JWT for immediate auto-login ────────────────────────────────
    token_data   = {"user_id": user_id, "role": user.role, "email": normalized_email}
    access_token = create_access_token(token_data)

    # ── Welcome notification (background) ─────────────────────────────────
    background.add_task(
        send_login_notification,
        email=normalized_email,
        phone=phone,
        full_name=full_name or normalized_email,
        role=user.role,
        db=db,
    )

    response = {
        "message":      "Account created successfully.",
        "user_id":      user_id,
        "role":         user.role,
        "redirect":     ROLE_REDIRECT.get(user.role, "/user/symptom-search"),
        "access_token": access_token,
        "token_type":   "bearer",
        "user": {
            "id":        user_id,
            "email":     normalized_email,
            "full_name": full_name,
            "phone":     phone,
            "role":      user.role,
        },
    }

    # Attach soft warning if name was already in use
    if name_already_taken:
        response["name_warning"] = (
            f"Note: Another user named \"{full_name}\" is already registered. "
            "Your account has been created — please make sure you're not "
            "accidentally duplicating an existing account."
        )

    return response


# ─────────────────────────────────────────────────────────────────────────────
# Login
# ─────────────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email:    str
    password: str


@router.post("/login")
async def login(
    login_data: LoginRequest,
    background: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Authenticate with email + password.
    Returns JWT access-token, user profile, and role-based redirect path.
    """
    email = login_data.email.strip()

    _INVALID = HTTPException(
        status_code=401,
        detail="Invalid email or password. Please check your credentials.",
    )

    user = await db["users"].find_one(_email_query(email))
    if not user:
        raise _INVALID

    stored_hash = user.get("hashed_password", "")
    if not stored_hash or not stored_hash.startswith("$2"):
        raise HTTPException(
            status_code=401,
            detail="This account has a corrupted password. Please contact support.",
        )

    if not verify_password(login_data.password, stored_hash):
        raise _INVALID

    role       = user.get("role", "patient")
    token_data = {
        "user_id": str(user["_id"]),
        "role":    role,
        "email":   user.get("email", ""),
    }
    access_token = create_access_token(token_data)

    background.add_task(
        send_login_notification,
        email=user.get("email"),
        phone=user.get("phone"),
        full_name=user.get("full_name", user.get("email", "User")),
        role=role,
        db=db,
    )

    return {
        "access_token": access_token,
        "token_type":   "bearer",
        "role":         role,
        "redirect":     ROLE_REDIRECT.get(role, "/user/symptom-search"),
        "user": {
            "id":        str(user["_id"]),
            "email":     user.get("email", ""),
            "full_name": user.get("full_name", ""),
            "phone":     user.get("phone", ""),
            "role":      role,
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# /me — current user info
# ─────────────────────────────────────────────────────────────────────────────
from app.core.security import get_current_user  # noqa: E402


@router.get("/me")
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Return the authenticated user's profile."""
    from bson import ObjectId
    user = await db["users"].find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {
        "id":        str(user["_id"]),
        "email":     user.get("email", ""),
        "full_name": user.get("full_name", ""),
        "phone":     user.get("phone", ""),
        "role":      user.get("role", "patient"),
    }
