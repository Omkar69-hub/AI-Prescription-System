# backend/app/ai/llm_reasoner.py

def recommend_medicines(symptoms: list) -> dict:
    """
    Dummy AI reasoning for medicine recommendations
    """
    # Replace with actual LLM integration (OpenAI, local LLM, etc.)
    recommendations = []
    for symptom in symptoms:
        if symptom == "fever":
            recommendations.append({"medicine": "Paracetamol", "dose": "500mg", "generic": "Acetaminophen"})
        elif symptom == "cough":
            recommendations.append({"medicine": "Dextromethorphan", "dose": "10mg", "generic": "Dextromethorphan"})
        else:
            recommendations.append({"medicine": "Multivitamin", "dose": "1 tablet", "generic": "Vitamin Mix"})
    return {"symptoms": symptoms, "recommendations": recommendations}
