import json
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from app.core.config import settings

async def seed_database():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]

    # Load JSON file
    with open("../database/sample_data.json", "r") as f:
        data = json.load(f)

    # Insert data
    if "users" in data:
        await db.users.insert_many(data["users"])
        print("✅ Users inserted")

    if "medicines" in data:
        await db.medicines.insert_many(data["medicines"])
        print("✅ Medicines inserted")

    if "prescriptions" in data:
        await db.prescriptions.insert_many(data["prescriptions"])
        print("✅ Prescriptions inserted")

    if "history" in data:
        await db.history.insert_many(data["history"])
        print("✅ History inserted")

    print("🎉 Database seeding completed")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
