from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv(".env")
client = MongoClient(os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017"))
db = client[os.getenv("DATABASE_NAME", "ai_prescription")]

u = db["users"].delete_many({})
h = db["history"].delete_many({})
n = db["notifications"].delete_many({})

print(f"Deleted {u.deleted_count} user(s)")
print(f"Deleted {h.deleted_count} history record(s)")
print(f"Deleted {n.deleted_count} notification(s)")
print("Database is now clean. No users exist.")
client.close()
