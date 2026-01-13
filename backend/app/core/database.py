# backend/app/core/database.py

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = None  # MongoDB client
db = None      # Database reference

# ----------------------------
# Connect to MongoDB
# ----------------------------
async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DATABASE_NAME_]()
