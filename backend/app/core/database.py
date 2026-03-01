from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


# ----------------------------
# Connect to MongoDB
# ----------------------------
async def connect_db():
    global client, database
    client = AsyncIOMotorClient(settings.MONGO_URI)
    database = client[settings.DATABASE_NAME]
    print(f"[OK] MongoDB connected: {settings.DATABASE_NAME}")

# Global access (will be None until connect_db is called)
def get_db() -> AsyncIOMotorDatabase:
    return database


# ----------------------------
# Disconnect MongoDB
# ----------------------------
async def close_db():
    global client
    if client:
        client.close()
        print("[INFO] MongoDB disconnected")


# ----------------------------
# Dependency getter
# ----------------------------
def get_database() -> AsyncIOMotorDatabase:
    if database is None:
        raise RuntimeError("Database not initialized")
    return database
