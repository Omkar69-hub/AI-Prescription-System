"""
reset_auth.py
Run this ONCE to wipe all users so you start with a clean slate.
Usage:  python reset_auth.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI     = "mongodb://127.0.0.1:27017"
DATABASE_NAME = "ai_prescription"

async def main():
    client = AsyncIOMotorClient(MONGO_URI)
    db     = client[DATABASE_NAME]
    result = await db["users"].delete_many({})
    print(f"[OK] Deleted {result.deleted_count} user(s) from '{DATABASE_NAME}.users'")
    print("[OK] Users collection is now empty. You can create a fresh account.")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
