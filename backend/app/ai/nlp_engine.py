# backend/app/ai/nlp_engine.py

import re

def extract_symptoms_from_text(text: str) -> list:
    """
    Dummy symptom extraction from text
    """
    # Example: simple keyword matching (replace with real NLP later)
    symptom_keywords = ["fever", "cough", "headache", "nausea", "fatigue"]
    text_lower = text.lower()
    return [word for word in symptom_keywords if word in text_lower]

def extract_medicines_from_text(text: str) -> list:
    """
    Dummy medicine extraction from text
    """
    # Example: detect capitalized words followed by dosage
    pattern = r"([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*)\s\d*mg"
    matches = re.findall(pattern, text)
    return matches
