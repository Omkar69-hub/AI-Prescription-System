# backend/app/core/database.py

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
from fastapi import Depends

# ----------------------------
# Global MongoDB client & database
# ----------------------------
client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None

# ----------------------------
# Connect to MongoDB
# ----------------------------
async def connect_db():
    """
    Initialize MongoDB connection using settings from config.py
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

# ----------------------------
# Dependency for FastAPI routes
# ----------------------------
def get_database() -> AsyncIOMotorDatabase:
    """
    Returns the MongoDB database instance for routes
    """
    if db is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return db
