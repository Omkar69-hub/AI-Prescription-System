import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(".env")
client = MongoClient(os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017"))
db = client[os.getenv("DATABASE_NAME", "ai_prescription")]

# Common medicines to populate the database for OCR matching
MEDICINES = [
    {"brand_name": "Pan-D", "generic_name": "Pantoprazole + Domperidone", "dosage": "40mg/30mg"},
    {"brand_name": "Crocin 650", "generic_name": "Paracetamol", "dosage": "650mg"},
    {"brand_name": "Dolo 650", "generic_name": "Paracetamol", "dosage": "650mg"},
    {"brand_name": "Allegra", "generic_name": "Fexofenadine", "dosage": "120mg"},
    {"brand_name": "Glycomet 500", "generic_name": "Metformin", "dosage": "500mg"},
    {"brand_name": "Thyronorm", "generic_name": "Levothyroxine", "dosage": "50mcg"},
    {"brand_name": "Stemetil", "generic_name": "Prochlorperazine", "dosage": "5mg"},
    {"brand_name": "Combiflam", "generic_name": "Ibuprofen + Paracetamol", "dosage": "400mg/325mg"},
    {"brand_name": "Strepsils", "generic_name": "Amylmetacresol", "dosage": "Lozenge"},
    {"brand_name": "Benadryl", "generic_name": "Cough Syrup", "dosage": "10ml"},
    {"brand_name": "Asthalin", "generic_name": "Salbutamol", "dosage": "100mcg"},
    {"brand_name": "Zyrtec", "generic_name": "Cetirizine", "dosage": "10mg"},
    {"brand_name": "Meftal Spas", "generic_name": "Mefenamic Acid", "dosage": "250mg"},
    {"brand_name": "Stomach Ache Relief", "generic_name": "Antacid", "dosage": "N/A"},
    # Added from the user's example receipt
    {"brand_name": "Glynax", "generic_name": "Gliclazide", "dosage": "80mg"},
    {"brand_name": "Cyanogem-Safe", "generic_name": "Cyanocobalamin", "dosage": "1500mcg"},
    {"brand_name": "Par-Sol", "generic_name": "Vitamin D3", "dosage": "60k"},
]

def seed():
    db.medicines.delete_many({})
    db.medicines.insert_many(MEDICINES)
    print(f"Seeded {len(MEDICINES)} medicines into the database.")

if __name__ == "__main__":
    seed()
