import json
import asyncio
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


async def seed_database():
    print("🚀 Starting database seeding...")

    # ----------------------------
    # MongoDB Connection
    # ----------------------------
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DATABASE_NAME]

    try:
        # Test connection
        await client.admin.command("ping")
        print("✅ MongoDB connection successful")
    except Exception as e:
        print("❌ MongoDB connection failed")
        print(e)
        return

    # ----------------------------
    # Load JSON file (SAFE PATH)
    # ----------------------------
    base_dir = Path(__file__).resolve().parent
    json_path = base_dir.parent / "database" / "sample_data.json"

    if not json_path.exists():
        print(f"❌ sample_data.json not found at: {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # ----------------------------
    # USERS
    # ----------------------------
    if "users" in data:
        await db.users.delete_many({})
        await db.users.insert_many(data["users"])
        print("✅ Users inserted")

    # ----------------------------
    # MEDICINES
    # ----------------------------
    if "medicines" in data:
        await db.medicines.delete_many({})
        await db.medicines.insert_many(data["medicines"])
        print("✅ Medicines inserted")

    # ----------------------------
    # PRESCRIPTIONS
    # ----------------------------
    if "prescriptions" in data:
        await db.prescriptions.delete_many({})
        await db.prescriptions.insert_many(data["prescriptions"])
        print("✅ Prescriptions inserted")

    # ----------------------------
    # HISTORY
    # ----------------------------
    if "history" in data:
        await db.history.delete_many({})
        await db.history.insert_many(data["history"])
        print("✅ History inserted")

    print("🎉 Database seeding completed successfully")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
