"""
models/test.py
==============
Test / evaluate the trained symptom-classifier and the OCR prescription
pipeline.  Run this after train.py has produced the model artefacts.

Usage
-----
  # From the project root
  python models/test.py

Sections
--------
  1. Model evaluation on held-out symptom phrases
  2. Interactive symptom prediction (CLI demo)
  3. OCR smoke-test (optional — requires a sample image path)
"""

import os
import sys
import json
import logging
from pathlib import Path

# ── Path setup ──────────────────────────────────────────────────────────────
ROOT    = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "backend"
SAVED   = Path(__file__).resolve().parent / "saved"

sys.path.insert(0, str(BACKEND))

import joblib
import numpy as np
from dotenv import load_dotenv
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from pymongo import MongoClient

load_dotenv(BACKEND / ".env")
logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
log = logging.getLogger(__name__)

# ── Console colours (degrades gracefully on Windows) ────────────────────────
try:
    from colorama import Fore, Style, init as _init
    _init(autoreset=True)
    GREEN = Fore.GREEN
    RED   = Fore.RED
    CYAN  = Fore.CYAN
    RESET = Style.RESET_ALL
except ImportError:
    GREEN = RED = CYAN = RESET = ""


# ────────────────────────────────────────────────────────────────────────────
# Load artefacts
# ────────────────────────────────────────────────────────────────────────────
def load_artefacts():
    model_path = SAVED / "symptom_classifier.pkl"
    le_path    = SAVED / "label_encoder.pkl"
    meta_path  = SAVED / "metadata.json"

    if not model_path.exists():
        log.error(
            "Model not found at %s. Run 'python models/train.py' first.", model_path
        )
        sys.exit(1)

    pipeline = joblib.load(model_path)
    le       = joblib.load(le_path)

    meta = {}
    if meta_path.exists():
        with open(meta_path) as f:
            meta = json.load(f)

    log.info("Model loaded from %s", model_path)
    if meta.get("trained_at"):
        log.info("Trained at    : %s", meta["trained_at"])
    if meta.get("accuracy"):
        log.info("Train accuracy: %.2f%%", meta["accuracy"] * 100)

    return pipeline, le, meta


# ────────────────────────────────────────────────────────────────────────────
# 1. Evaluate on data from DB (re-fetch the same pool)
# ────────────────────────────────────────────────────────────────────────────
def evaluate_on_db(pipeline, le):
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    db_name   = os.getenv("DB_NAME", "ai_prescription")

    client = MongoClient(mongo_uri)
    db     = client[db_name]
    cursor = db["recommendations"].find({}, {"symptoms": 1, "condition": 1})

    texts, true_labels = [], []
    for doc in cursor:
        condition = doc.get("condition", "").strip()
        for symptom in doc.get("symptoms", []):
            symptom = symptom.strip()
            if symptom and condition:
                texts.append(symptom)
                true_labels.append(condition)
    client.close()

    if not texts:
        log.warning("No data found in DB. Skipping DB evaluation.")
        return

    # Encode true labels (handle unseen labels gracefully)
    known = set(le.classes_)
    mask  = [l in known for l in true_labels]
    texts_f  = [t for t, m in zip(texts, mask) if m]
    labels_f = [l for l, m in zip(true_labels, mask) if m]

    if not texts_f:
        log.warning("All labels in DB are unknown to the model — re-train first.")
        return

    y_true = le.transform(labels_f)
    y_pred = pipeline.predict(texts_f)

    acc = accuracy_score(y_true, y_pred)
    report = classification_report(
        y_true, y_pred, target_names=le.classes_, zero_division=0
    )

    print(f"\n{CYAN}{'─'*60}")
    print("  DB Evaluation Results")
    print(f"{'─'*60}{RESET}")
    print(f"  Samples evaluated : {len(texts_f)}")
    print(f"  Accuracy          : {GREEN}{acc*100:.1f}%{RESET}")
    print(f"\n{report}")


# ────────────────────────────────────────────────────────────────────────────
# 2. Predict a symptom phrase (used programmatically by the backend)
# ────────────────────────────────────────────────────────────────────────────
def predict(pipeline, le, symptom_text: str) -> dict:
    """Return condition label + confidence dict."""
    proba = pipeline.predict_proba([symptom_text])[0]
    idx   = int(np.argmax(proba))
    return {
        "condition":  le.classes_[idx],
        "confidence": round(float(proba[idx]), 4),
        "top3": [
            {"condition": le.classes_[i], "confidence": round(float(p), 4)}
            for i, p in sorted(enumerate(proba), key=lambda x: -x[1])[:3]
        ],
    }


# ────────────────────────────────────────────────────────────────────────────
# 3. OCR smoke-test
# ────────────────────────────────────────────────────────────────────────────
def ocr_smoke_test(image_path: str):
    """Run the OCR engine on a sample image and print extracted text."""
    try:
        from app.ai.ocr_engine import extract_text_from_image
        with open(image_path, "rb") as f:
            content = f.read()
        text = extract_text_from_image(content)
        print(f"\n{CYAN}{'─'*60}")
        print(f"  OCR Smoke Test: {image_path}")
        print(f"{'─'*60}{RESET}")
        print(text[:1000] if len(text) > 1000 else text)
    except Exception as e:
        log.error("OCR smoke test failed: %s", e)


# ────────────────────────────────────────────────────────────────────────────
# Interactive CLI demo
# ────────────────────────────────────────────────────────────────────────────
def interactive_demo(pipeline, le):
    print(f"\n{CYAN}{'─'*60}")
    print("  Interactive Symptom Predictor")
    print(f"  Type 'quit' to exit")
    print(f"{'─'*60}{RESET}")

    while True:
        try:
            user_input = input(f"\n{CYAN}Enter symptoms:{RESET} ").strip()
        except (EOFError, KeyboardInterrupt):
            break

        if user_input.lower() in ("quit", "exit", "q"):
            break

        if not user_input:
            continue

        result = predict(pipeline, le, user_input)
        print(f"  {GREEN}Predicted condition :{RESET} {result['condition']}")
        print(f"  Confidence           : {result['confidence']*100:.1f}%")
        print(f"  Top-3 predictions:")
        for item in result["top3"]:
            bar = "█" * int(item["confidence"] * 20)
            print(f"    • {item['condition']:<30} {bar} {item['confidence']*100:.1f}%")


# ────────────────────────────────────────────────────────────────────────────
# Entry point
# ────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Test the AI Prescription System model")
    parser.add_argument("--ocr-image", type=str, default=None,
                        help="Path to a prescription image for OCR smoke-test")
    parser.add_argument("--interactive", action="store_true",
                        help="Launch interactive symptom prediction CLI")
    args = parser.parse_args()

    pipeline, le, meta = load_artefacts()

    # ── Section 1: DB evaluation ─────────────────────────────────────────────
    evaluate_on_db(pipeline, le)

    # ── Section 2: Quick sanity checks ──────────────────────────────────────
    sample_inputs = [
        "fever headache cough",
        "stomach pain nausea vomiting",
        "chest pain shortness of breath",
        "skin rash itching",
        "joint pain swelling",
    ]
    print(f"\n{CYAN}{'─'*60}")
    print("  Quick Prediction Checks")
    print(f"{'─'*60}{RESET}")
    for inp in sample_inputs:
        res = predict(pipeline, le, inp)
        print(f"  [{inp:<35}] → {GREEN}{res['condition']}{RESET} ({res['confidence']*100:.0f}%)")

    # ── Section 3: OCR smoke-test (optional) ─────────────────────────────────
    if args.ocr_image:
        ocr_smoke_test(args.ocr_image)

    # ── Section 4: Interactive mode ──────────────────────────────────────────
    if args.interactive:
        interactive_demo(pipeline, le)

    print(f"\n{GREEN}All tests complete.{RESET}")
