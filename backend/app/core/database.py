# backend/app/core/database.py

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client: AsyncIOMotorClient | None = None  # MongoDB client
db = None                                # Database reference

# ----------------------------
# Connect to MongoDB
# ----------------------------
async def connect_db():
    """
    Initialize MongoDB connection.
    Use settings.MONGO_URI and settings.DATABASE_NAME
    """
    global client, db
    try:
        client = AsyncIOMotorClient(settings.MONGO_URI)
        db = client[settings.DATABASE_NAME]
        print(f"✅ MongoDB connected: {settings.DATABASE_NAME} at {settings.MONGO_URI}")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        raise e

# ----------------------------
# Disconnect MongoDB
# ----------------------------
async def close_db():
    """
    Close MongoDB connection
    """
    global client
    if client:
        client.close()
        print("MongoDB connection closed ✅")
