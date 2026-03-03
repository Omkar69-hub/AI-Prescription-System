# backend/app/routes/auth.py
"""
Authentication — Signup & Login (rebuilt from scratch).

Signup:
  - Duplicate email → HTTP 409
  - Otherwise create user, issue JWT, return user object

Login:
  - Find by email (case-insensitive), verify bcrypt hash
  - Return JWT + user object + role-based redirect

All routes always return HTTP 200/201 on success.
Errors use plain detail strings — no nested objects.
"""

from __future__ import annotations

import re
import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger("auth")
router = APIRouter()

# ─── Role → redirect map ──────────────────────────────────────────────────────
ROLE_REDIRECT = {
    "admin":   "/admin/dashboard",
    "doctor":  "/doctor/history",
    "patient": "/user/symptom-search",
}
ALLOWED_ROLES = set(ROLE_REDIRECT.keys())


# ─── Helpers ──────────────────────────────────────────────────────────────────
def _by_email(email: str) -> dict:
    """Case-insensitive email query."""
    return {"email": {"$regex": f"^{re.escape(email.strip().lower())}$", "$options": "i"}}


def _build_user_response(user_id: str, email: str, full_name: str,
                          phone: str, role: str) -> dict:
    access_token = create_access_token(
        {"user_id": user_id, "role": role, "email": email}
    )
    return {
        "access_token": access_token,
        "token_type":   "bearer",
        "role":         role,
        "redirect":     ROLE_REDIRECT.get(role, "/user/symptom-search"),
        "user": {
            "id":        user_id,
            "email":     email,
            "full_name": full_name,
            "phone":     phone,
            "role":      role,
        },
    }


# ─── Signup ───────────────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    email:        EmailStr
    password:     str
    full_name:    Optional[str] = ""
    phone:        Optional[str] = ""
    role:         Optional[str] = "patient"


@router.post("/signup", status_code=201)
async def signup(
    body: SignupRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    email     = body.email.strip().lower()
    full_name = (body.full_name or "").strip()
    phone     = (body.phone or "").strip()
    role      = (body.role or "patient").strip().lower()

    # ── Validate role ─────────────────────────────────────────────────────────
    if role not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(ALLOWED_ROLES)}")

    # ── Validate password length ──────────────────────────────────────────────
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    # ── Duplicate email check ─────────────────────────────────────────────────
    existing = await db["users"].find_one(_by_email(email))
    if existing:
        raise HTTPException(
            status_code=409,
            detail="This email is already registered. Please sign in instead.",
        )

    # ── Create user ───────────────────────────────────────────────────────────
    hashed = get_password_hash(body.password)
    doc = {
        "email":           email,
        "full_name":       full_name,
        "phone":           phone,
        "role":            role,
        "hashed_password": hashed,
    }
    result  = await db["users"].insert_one(doc)
    user_id = str(result.inserted_id)

    logger.info("Signup OK: %s (%s)", email, role)
    return _build_user_response(user_id, email, full_name, phone, role)


# ─── Login ────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email:    str
    password: str


@router.post("/login")
async def login(
    body: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    email = body.email.strip().lower()

    # ── Find user ─────────────────────────────────────────────────────────────
    user = await db["users"].find_one(_by_email(email))
    if not user:
        raise HTTPException(status_code=401, detail="No account found with that email. Please sign up first.")

    # ── Verify password ───────────────────────────────────────────────────────
    stored_hash = user.get("hashed_password", "")
    if not stored_hash:
        raise HTTPException(status_code=401, detail="Account has no password set. Please contact support.")

    if not verify_password(body.password, stored_hash):
        raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")

    # ── Build response ────────────────────────────────────────────────────────
    role      = user.get("role", "patient")
    user_id   = str(user["_id"])
    full_name = user.get("full_name", "")
    phone     = user.get("phone", "")

    logger.info("Login OK: %s (%s)", email, role)
    return _build_user_response(user_id, email, full_name, phone, role)


# ─── /me — current user profile ──────────────────────────────────────────────
from app.core.security import get_current_user  # noqa: E402
from bson import ObjectId                        # noqa: E402


@router.get("/me")
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
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


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone:     Optional[str] = None


@router.patch("/me")
async def update_me(
    body: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    update_data = {}
    if body.full_name is not None:
        update_data["full_name"] = body.full_name.strip()
    if body.phone is not None:
        # Basic digits validation for phone if provided
        phone = body.phone.strip()
        if phone and not re.match(r"^\d+$", phone):
             raise HTTPException(status_code=400, detail="Phone number must contain only digits.")
        update_data["phone"] = phone

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update.")

    result = await db["users"].update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")

    # Return updated user
    user = await db["users"].find_one({"_id": ObjectId(current_user["user_id"])})
    return {
        "id":        str(user["_id"]),
        "email":     user.get("email", ""),
        "full_name": user.get("full_name", ""),
        "phone":     user.get("phone", ""),
        "role":      user.get("role", "patient"),
    }
