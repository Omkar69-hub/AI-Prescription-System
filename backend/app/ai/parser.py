# backend/app/ai/parser.py

import re

def parse_dosage_and_timing(text: str, brand_name: str) -> dict:
    """
    Extract frequency, timing, and duration for a specific medicine from OCR text.
    In a production app, this would use a more sophisticated NLP model.
    """
    # Find the line containing the brand name to limit search context
    lines = text.split('\n')
    relevant_context = ""
    for i, line in enumerate(lines):
        if brand_name.lower() in line.lower():
            # Take current line + next 2 lines for context
            relevant_context = " ".join(lines[i:i+3]).lower()
            break
            
    if not relevant_context:
        relevant_context = text.lower()

    # 1. Frequency Patterns
    frequency = "N/A"
    if re.search(r"once (a|daily|every day)|od\b", relevant_context):
        frequency = "Once daily"
    elif re.search(r"twice (a|daily)|bid\b|b\.i\.d\b|1-0-1|1-1-1", relevant_context):
        frequency = "Twice daily"
    elif re.search(r"thrice (a|daily)|tid\b|t\.i\.d\b", relevant_context):
        frequency = "Three times daily"
    elif re.search(r"four times (a|daily)|qid\b|q\.i\.d\b", relevant_context):
        frequency = "Four times daily"
    elif re.search(r"weekly|twice weekly", relevant_context):
        frequency = "Weekly / As directed"

    # 2. Timing Patterns
    timing = "As directed"
    if re.search(r"befor|breakf|lunch|dinner|empty|stomach|ac\b", relevant_context):
        timing = "Before meals"
    elif re.search(r"after|pc\b", relevant_context):
        timing = "After meals"
    elif re.search(r"night|bed|sleep|hs\b", relevant_context):
        timing = "At night"

    # 3. Duration Patterns
    duration = "N/A"
    # Match things like "3 mon", "5 d", "1 wk"
    duration_match = re.search(r"for (\d+) (day|mon|week|yr|d\b|m\b|w\b)", relevant_context)
    if duration_match:
        val = duration_match.group(1)
        unit = duration_match.group(2)
        if unit.startswith('d'): duration = f"{val} days"
        elif unit.startswith('m'): duration = f"{val} months"
        elif unit.startswith('w'): duration = f"{val} weeks"
        else: duration = f"{val} {unit}"
    elif re.search(r"x (\d+) (day|mon|week|d\b|m\b|w\b)", relevant_context):
        m = re.search(r"x (\d+) (day|mon|week|d\b|m\b|w\b)", relevant_context)
        duration = f"{m.group(1)} {m.group(2)}"

    return {
        "frequency": frequency,
        "timing": timing,
        "duration": duration
    }
