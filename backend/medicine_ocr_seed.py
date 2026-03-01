# backend/medicine_ocr_seed.py

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ai_prescription")

ocr_medicines = [
    {
        "brand_name": "Thyronorm",
        "generic_name": "Levothyroxine Sodium",
        "dosage": "50mcg",
        "description": "Used to treat an underactive thyroid gland (hypothyroidism)."
    },
    {
        "brand_name": "Cabupotin",
        "generic_name": "Cabergoline",
        "dosage": "0.25mg",
        "description": "Used to treat high levels of prolactin hormone."
    },
    {
        "brand_name": "Dallychn 60K",
        "generic_name": "Cholecalciferol (Vitamin D3)",
        "dosage": "60,000 IU",
        "description": "High-dose Vitamin D supplement."
    },
    {
        "brand_name": "Allegra",
        "generic_name": "Fexofenadine",
        "dosage": "120mg",
        "description": "Antihistamine used for allergy symptoms."
    }
]

async def seed_db():
    print(f"Connecting to MongoDB at {MONGO_URI}...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    
    # Check if they exist or just update
    for med in ocr_medicines:
        print(f"Ensuring {med['brand_name']} exists...")
        await db["medicines"].update_one(
            {"brand_name": med["brand_name"]},
            {"$set": med},
            upsert=True
        )
    
    print("Medicine seeding for OCR completed!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_db())
