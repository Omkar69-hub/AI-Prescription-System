# test_config.py
from app.core.config import settings

print("Mongo URI:", settings.MONGO_URI)
print("Secret Key:", settings.SECRET_KEY)
