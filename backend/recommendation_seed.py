# backend/recommendation_seed.py

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ai_prescription")

recommendations = [
    {
        "symptoms": ["fever", "cold", "chills", "shivering"],
        "condition": "Common Cold / Viral Fever",
        "description": "A viral infection of your nose and throat (upper respiratory tract). It's usually harmless, though it might not feel that way.",
        "diet": "Stay hydrated with warm water, herbal teas, and soups. Eat citrus fruits rich in Vitamin C.",
        "workout": "Avoid heavy exercise. Rest is crucial. Light stretching is okay if you feel up to it.",
        "medicines": [
            {
                "brand": "Dolo 650",
                "generic": "Paracetamol 650mg",
                "dosage": "1 tablet",
                "timing": "After meals - Morning, Night (if fever persists)"
            },
            {
                "brand": "Allegra",
                "generic": "Fexofenadine",
                "dosage": "1 tablet",
                "timing": "After meals - Night"
            }
        ]
    },
    {
        "symptoms": ["headache", "migraine", "throbbing pain"],
        "condition": "Tension Headache / Migraine",
        "description": "A primary headache disorder characterized by recurrent headaches that are moderate to severe.",
        "diet": "Limit caffeine and alcohol. Stay hydrated. Eat magnesium-rich foods like spinach and almonds.",
        "workout": "Avoid bright lights and loud noises. Gentle neck stretches and deep breathing exercises.",
        "medicines": [
            {
                "brand": "Saridon",
                "generic": "Paracetamol, Propyphenazone, Caffeine",
                "dosage": "1 tablet",
                "timing": "After meals - When pain starts"
            },
            {
                "brand": "Vasograin",
                "generic": "Ergotamine, Caffeine, Paracetamol",
                "dosage": "1 tablet",
                "timing": "After meals - For severe migraine"
            }
        ]
    },
    {
        "symptoms": ["stomach pain", "acidity", "gas", "bloating", "indigestion"],
        "condition": "Gastritis / Indigestion",
        "description": "Inflammation of the protective lining of the stomach. General indigestion can also cause similar symptoms.",
        "diet": "Avoid spicy, oily, and fried foods. Eat small, frequent meals. Drink coconut water or buttermilk.",
        "workout": "Avoid strenuous core exercises. Short, slow walks after meals can help digestion.",
        "medicines": [
            {
                "brand": "Pan 40",
                "generic": "Pantoprazole",
                "dosage": "1 tablet",
                "timing": "Before meals - Morning (Empty stomach)"
            },
            {
                "brand": "Digene",
                "generic": "Antacid (Magnesium Hydroxide)",
                "dosage": "2 spoonfuls",
                "timing": "After meals - Afternoon, Night"
            }
        ]
    },
    {
        "symptoms": ["dry cough", "throat irritation"],
        "condition": "Dry Cough",
        "description": "A cough that doesn't produce any phlegm or mucus. Often caused by viral infections or allergies.",
        "diet": "Honey and ginger tea. Avoid cold drinks and oily foods.",
        "workout": "Light activity is fine, but avoid cardio that causes heavy breathing and further throat irritation.",
        "medicines": [
            {
                "brand": "Ascoril D",
                "generic": "Dextromethorphan",
                "dosage": "10ml",
                "timing": "After meals - Morning, Afternoon, Night"
            }
        ]
    }
]

async def seed_db():
    print(f"Connecting to MongoDB at {MONGO_URI}...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    
    # Clear existing recommendations
    print("Clearing existing recommendations...")
    await db["recommendations"].delete_many({})
    
    # Insert new data
    print(f"Inserting {len(recommendations)} recommendations...")
    await db["recommendations"].insert_many(recommendations)
    
    print("Seeding completed successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_db())
