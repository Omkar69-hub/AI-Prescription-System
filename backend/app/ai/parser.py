# backend/app/ai/parser.py

import re

def parse_dosage_and_timing(text: str, brand_name: str) -> dict:
    """
    Extract frequency, timing, and duration for a specific medicine from OCR text.
    Uses regex context analysis to identify specific medical instruction patterns.
    """
    # ── Context Extraction ──────────────────────────────────────────────────
    lines = text.split('\n')
    relevant_context = ""
    for i, line in enumerate(lines):
        if brand_name.lower() in line.lower():
            # Current line + next 3 lines often contain the dosage instructions
            relevant_context = " ".join(lines[i:i+4]).lower()
            break
            
    if not relevant_context:
        relevant_context = text.lower()

    # ── 1. Dosage Detection (e.g., 500mg, 10ml, 1 tab) ───────────────────────
    dosage = "As specified"
    dosage_match = re.search(r"(\d+\s*(mg|ml|mcg|tab|cap|gm))", relevant_context)
    if dosage_match:
        dosage = dosage_match.group(1)

    # ── 2. Frequency / Timing (Morning, Afternoon, Evening, Night) ──────────
    # Look for 1-0-1 or keyword patterns
    freq_parts = []
    
    # Morning check
    if re.search(r"(morning|breakfast|1-\d-\d|od\b|bid\b|tid\b)", relevant_context):
        freq_parts.append("Morning")
    
    # Afternoon check
    if re.search(r"(afternoon|lunch|\d-1-\d|tid\b|qid\b)", relevant_context):
        freq_parts.append("Afternoon")
        
    # Evening check
    if re.search(r"(evening|tea|\d-\d-1|bid\b|tid\b|qid\b)", relevant_context):
        freq_parts.append("Evening")
        
    # Night check
    if re.search(r"(night|bed|sleep|hs\b|\d-\d-\d-1|qid\b)", relevant_context):
        freq_parts.append("Night")

    frequency = " / ".join(freq_parts) if freq_parts else "As directed"

    # ── 3. Meal Instructions (Before / After) ────────────────────────────────
    timing = "As directed"
    if re.search(r"(before|empty|stomach|ac\b|a\.c\.)", relevant_context):
        timing = "Before meals"
    elif re.search(r"(after|pc\b|p\.c\.)", relevant_context):
        timing = "After meals"

    # ── 4. Duration (e.g., 5 days, 1 month) ──────────────────────────────────
    duration = "N/A"
    duration_match = re.search(r"(for|x)\s*(\d+)\s*(day|mon|week|yr|d\b|m\b|w\b|y\b)", relevant_context)
    if duration_match:
        val = duration_match.group(2)
        unit = duration_match.group(3)
        if unit.startswith('d'): duration = f"{val} days"
        elif unit.startswith('m'): duration = f"{val} months"
        elif unit.startswith('w'): duration = f"{val} weeks"
        else: duration = f"{val} {unit}"

    return {
        "dosage":    dosage,
        "frequency": frequency,
        "timing":    timing,
        "duration":  duration
    }
