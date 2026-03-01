# backend/app/routes/auth.py
"""
Authentication routes — Signup, Login (all roles), and a /me endpoint.

On every successful login a non-blocking welcome notification is sent
via the notifications service (email and/or SMS depending on .env config).
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
    """Case-insensitive email lookup (regex fallback, no collation required)."""
    return {"email": {"$regex": f"^{re.escape(email.strip())}$", "$options": "i"}}


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
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Register a new account (patient / doctor / admin).
    Returns the user_id of the newly created record.
    """
    existing = await db["users"].find_one(_email_query(user.email))
    if existing:
        raise HTTPException(
            status_code=400,
            detail=(
                "An account with this email already exists. "
                "Please sign in or use a different email address."
            ),
        )

    user_doc = {
        "email":           user.email.strip().lower(),
        "full_name":       (user.full_name or "").strip(),
        "phone":           (user.phone or "").strip(),
        "role":            user.role,
        "hashed_password": get_password_hash(user.password),
    }
    result = await db["users"].insert_one(user_doc)
    return {
        "message":  "Account created successfully.",
        "user_id":  str(result.inserted_id),
        "role":     user.role,
        "redirect": ROLE_REDIRECT.get(user.role, "/user/symptom-search"),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Login
# ─────────────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email:    str
    password: str


@router.post("/login")
async def login(
    login_data:  LoginRequest,
    background:  BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Authenticate any role (admin / doctor / patient) with email + password.

    On success:
      • Returns a JWT access token + user object + role-specific redirect path.
      • Fires a background welcome notification (email and/or SMS).

    On failure:
      • Returns HTTP 401 with a safe, non-enumerable error message.
    """
    email = login_data.email.strip()

    # ── Lookup (case-insensitive) ─────────────────────────────────────────
    user = await db["users"].find_one(_email_query(email))

    # Uniform failure — prevents email enumeration
    _INVALID = HTTPException(
        status_code=401,
        detail="Invalid email or password. Please check your credentials and try again.",
    )

    if not user:
        raise _INVALID

    stored_hash = user.get("hashed_password", "")
    if not stored_hash or not stored_hash.startswith("$2"):
        # Legacy / broken hash guard
        raise HTTPException(
            status_code=401,
            detail=(
                "This account cannot be authenticated — the stored password "
                "is in an unsupported format. Please reset your account."
            ),
        )

    if not verify_password(login_data.password, stored_hash):
        raise _INVALID

    # ── Build JWT ─────────────────────────────────────────────────────────
    role = user.get("role", "patient")
    token_data = {
        "user_id": str(user["_id"]),
        "role":    role,
        "email":   user.get("email", ""),
    }
    access_token = create_access_token(token_data)

    # ── Fire-and-forget welcome notification ──────────────────────────────
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
# /me — current user info (used by frontend guards)
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
    from bson import ObjectId  # noqa: PLC0415

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


# ─────────────────────────────────────────────────────────────────────────────
# Google OAuth Login / Register
# ─────────────────────────────────────────────────────────────────────────────
class GoogleLoginRequest(BaseModel):
    access_token: str                     # token from @react-oauth/google
    role: Optional[str] = "patient"       # role selected on the form


@router.post("/google")
async def google_login(
    payload:    GoogleLoginRequest,
    background: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Verify a Google access_token by calling Google's userinfo endpoint.
    - If user exists  → log them in (return JWT).
    - If user is new  → auto-create account, then log them in.
    """
    import urllib.request
    import json as _json

    # ── 1. Fetch user info from Google ────────────────────────────────────
    try:
        req = urllib.request.Request(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {payload.access_token}"},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            g_user = _json.loads(resp.read())
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Could not verify Google token. Please try again.",
        )

    g_email      = g_user.get("email", "").strip().lower()
    g_name       = g_user.get("name", "") or g_user.get("given_name", "")
    g_picture    = g_user.get("picture", "")
    g_verified   = g_user.get("email_verified", False)

    if not g_email:
        raise HTTPException(status_code=400, detail="Google account has no email address.")
    if not g_verified:
        raise HTTPException(status_code=400, detail="Google email address is not verified.")

    # ── 2. Find or create user ────────────────────────────────────────────
    role  = (payload.role or "patient").lower().strip()
    if role not in ALLOWED_ROLES:
        role = "patient"

    user = await db["users"].find_one(_email_query(g_email))

    if not user:
        # Auto-register
        user_doc = {
            "email":           g_email,
            "full_name":       g_name,
            "phone":           "",
            "role":            role,
            "hashed_password": "",          # no password for Google users
            "avatar":          g_picture,
            "auth_provider":   "google",
        }
        result = await db["users"].insert_one(user_doc)
        user   = await db["users"].find_one({"_id": result.inserted_id})

    # ── 3. Issue JWT ──────────────────────────────────────────────────────
    user_role    = user.get("role", role)
    token_data   = {
        "user_id": str(user["_id"]),
        "role":    user_role,
        "email":   user.get("email", ""),
    }
    access_token = create_access_token(token_data)

    # ── 4. Fire welcome SMS if phone exists ───────────────────────────────
    background.add_task(
        send_login_notification,
        email=user.get("email"),
        phone=user.get("phone"),
        full_name=user.get("full_name", g_email),
        role=user_role,
        db=db,
    )

    return {
        "access_token": access_token,
        "token_type":   "bearer",
        "role":         user_role,
        "redirect":     ROLE_REDIRECT.get(user_role, "/user/symptom-search"),
        "user": {
            "id":        str(user["_id"]),
            "email":     user.get("email", ""),
            "full_name": user.get("full_name", ""),
            "phone":     user.get("phone", ""),
            "role":      user_role,
        },
    }

