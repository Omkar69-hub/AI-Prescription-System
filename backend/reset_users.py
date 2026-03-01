"""
backend/reset_users.py
======================
Clears ALL existing user records from the database and inserts
fresh demo accounts for Admin, Doctor, and Patient roles — each
with a properly bcrypt-hashed password.

Run from the backend/ directory:
    python reset_users.py

Demo credentials after reset:
─────────────────────────────────────────────────────────────────
 Role     │ Email                    │ Password
──────────┼──────────────────────────┼─────────────────────────
 Admin    │ admin@aiprescription.com  │ Admin@123
 Doctor   │ doctor@aiprescription.com │ Doctor@123
 Patient  │ patient@aiprescription.com│ Patient@123
─────────────────────────────────────────────────────────────────
You can also register new accounts normally via the signup form.
"""

import asyncio
import sys
import os
from pathlib import Path

# ── Path setup so we can import app modules ──────────────────────────────────
sys.path.insert(0, str(Path(__file__).resolve().parent))

from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

MONGO_URI     = os.getenv("MONGO_URI",     "mongodb://127.0.0.1:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ai_prescription")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


DEMO_USERS = [
    {
        "full_name":       "Admin User",
        "email":           "admin@aiprescription.com",
        "password_plain":  "Admin@123",
        "phone":           "9000000001",
        "role":            "admin",
    },
    {
        "full_name":       "Dr. Sarah Johnson",
        "email":           "doctor@aiprescription.com",
        "password_plain":  "Doctor@123",
        "phone":           "9000000002",
        "role":            "doctor",
    },
    {
        "full_name":       "Patient Demo",
        "email":           "patient@aiprescription.com",
        "password_plain":  "Patient@123",
        "phone":           "9000000003",
        "role":            "patient",
    },
]


async def reset():
    print("\n🔄  Connecting to MongoDB …")
    client = AsyncIOMotorClient(MONGO_URI)
    db     = client[DATABASE_NAME]

    # Quick connectivity test
    try:
        await client.admin.command("ping")
        print(f"✅  Connected → {MONGO_URI}  (db: {DATABASE_NAME})")
    except Exception as e:
        print(f"❌  Cannot connect to MongoDB: {e}")
        print("    Make sure mongod is running and MONGO_URI in .env is correct.")
        client.close()
        return

    # ── 1. Wipe all existing users ───────────────────────────────────────────
    result = await db["users"].delete_many({})
    print(f"\n🗑️   Deleted {result.deleted_count} existing user record(s).")

    # ── 2. Also wipe history so orphaned records don't cause FK-style issues ─
    await db["history"].delete_many({})
    print("🗑️   Cleared history collection.")

    # ── 3. Drop any duplicate-email index that might conflict ────────────────
    try:
        await db["users"].drop_index("email_1")
        print("🗑️   Dropped old email index (will be recreated).")
    except Exception:
        pass  # index may not exist — fine

    # ── 4. Create a proper unique index on email (case-insensitive) ──────────
    await db["users"].create_index(
        "email",
        unique=True,
        collation={"locale": "en", "strength": 2},   # case-insensitive
    )
    print("📑  Created unique case-insensitive email index.")

    # ── 5. Insert fresh demo users with real bcrypt hashes ───────────────────
    print("\n👤  Creating demo accounts …\n")
    for u in DEMO_USERS:
        hashed = pwd_context.hash(u["password_plain"])
        doc = {
            "full_name":       u["full_name"],
            "email":           u["email"],
            "phone":           u["phone"],
            "role":            u["role"],
            "hashed_password": hashed,
        }
        await db["users"].insert_one(doc)
        print(f"    ✅  {u['role'].upper():<8}  {u['email']:<36}  password: {u['password_plain']}")

    print("\n🎉  Reset complete!  You can now log in with the credentials above.")
    print("    Or register a brand-new account via the Signup page.\n")
    client.close()


if __name__ == "__main__":
    asyncio.run(reset())
