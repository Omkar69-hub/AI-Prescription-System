# backend/app/ai/prompt_templates.py

SYMPTOM_PROMPT = """
You are a medical AI assistant. Given a list of patient symptoms:
{symptoms}

Recommend possible medicines, dosages, and generic alternatives.
Return the result as JSON with keys: "medicine", "dose", "generic".
"""

MEDICINE_PROMPT = """
You are a medical AI assistant. Given a prescription text:
{prescription_text}

Extract medicine names and suggest generic equivalents.
Return JSON array of objects with keys: "brand", "generic".
"""
