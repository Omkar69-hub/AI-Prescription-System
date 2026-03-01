"""
models/train.py
===============
Train a TF-IDF + Logistic Regression classifier that maps symptom text
to medical conditions stored in the MongoDB `recommendations` collection.

Usage
-----
  # From the project root (one level above 'backend/')
  python models/train.py

The trained model artefacts are saved to models/saved/:
  • symptom_classifier.pkl   – fitted LogisticRegression pipeline
  • label_encoder.pkl        – fitted LabelEncoder for condition names
  • training_report.txt      – classification metrics

Requirements
------------
  pip install scikit-learn joblib pymongo python-dotenv
"""

import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime

# ── Path setup ──────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent        # project root
BACKEND = ROOT / "backend"
SAVED   = Path(__file__).resolve().parent / "saved"
SAVED.mkdir(parents=True, exist_ok=True)

sys.path.insert(0, str(BACKEND))

# ── Third-party imports ─────────────────────────────────────────────────────
import joblib
import numpy as np
from dotenv import load_dotenv
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# ── MongoDB (synchronous PyMongo for offline script) ────────────────────────
from pymongo import MongoClient

load_dotenv(BACKEND / ".env")
logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
log = logging.getLogger(__name__)


# ────────────────────────────────────────────────────────────────────────────
# 1. Fetch training data from MongoDB
# ────────────────────────────────────────────────────────────────────────────
def fetch_training_data(mongo_uri: str, db_name: str = "ai_prescription"):
    """
    Pull all recommendation documents and build a flat list of
    (symptom_phrase, condition_label) pairs.
    """
    client = MongoClient(mongo_uri)
    db = client[db_name]
    cursor = db["recommendations"].find({}, {"symptoms": 1, "condition": 1})

    texts, labels = [], []
    for doc in cursor:
        condition = doc.get("condition", "").strip()
        for symptom in doc.get("symptoms", []):
            symptom = symptom.strip()
            if symptom and condition:
                texts.append(symptom)
                labels.append(condition)

    client.close()
    log.info("Fetched %d labelled symptom–condition pairs.", len(texts))
    return texts, labels


# ────────────────────────────────────────────────────────────────────────────
# 2. Augment data with simple phrase combinations (cheap data augmentation)
# ────────────────────────────────────────────────────────────────────────────
def augment(texts, labels, factor: int = 3):
    """
    For each label group, generate `factor` extra samples by concatenating
    2-3 random symptom phrases from the same condition bucket.
    """
    from collections import defaultdict
    import random

    bucket = defaultdict(list)
    for t, l in zip(texts, labels):
        bucket[l].append(t)

    extra_t, extra_l = [], []
    for condition, phrases in bucket.items():
        if len(phrases) < 2:
            continue
        for _ in range(factor * len(phrases)):
            combo = random.sample(phrases, k=min(3, len(phrases)))
            extra_t.append(", ".join(combo))
            extra_l.append(condition)

    texts  = texts  + extra_t
    labels = labels + extra_l
    log.info("After augmentation: %d samples across %d conditions.",
             len(texts), len(set(labels)))
    return texts, labels


# ────────────────────────────────────────────────────────────────────────────
# 3. Build & train pipeline
# ────────────────────────────────────────────────────────────────────────────
def train(texts, labels):
    le = LabelEncoder()
    y  = le.fit_transform(labels)

    X_train, X_test, y_train, y_test = train_test_split(
        texts, y, test_size=0.20, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 3),
            min_df=1,
            sublinear_tf=True,
            strip_accents="unicode",
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            C=2.0,
            solver="lbfgs",
        )),
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    acc    = accuracy_score(y_test, y_pred)
    report = classification_report(
        y_test, y_pred, target_names=le.classes_, zero_division=0
    )

    log.info("Accuracy: %.3f", acc)
    log.info("\n%s", report)

    return pipeline, le, acc, report, (X_test, y_test, y_pred)


# ────────────────────────────────────────────────────────────────────────────
# 4. Persist artefacts
# ────────────────────────────────────────────────────────────────────────────
def save_artefacts(pipeline, le, acc, report):
    model_path = SAVED / "symptom_classifier.pkl"
    le_path    = SAVED / "label_encoder.pkl"
    report_path = SAVED / "training_report.txt"
    meta_path  = SAVED / "metadata.json"

    joblib.dump(pipeline, model_path)
    joblib.dump(le, le_path)

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(f"Training date : {datetime.utcnow().isoformat()}Z\n")
        f.write(f"Training accuracy : {acc:.4f}\n\n")
        f.write(report)

    meta = {
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "accuracy":   round(acc, 4),
        "classes":    list(le.classes_),
        "model_file": str(model_path),
        "encoder_file": str(le_path),
    }
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    log.info("Model saved  → %s", model_path)
    log.info("Encoder saved → %s", le_path)
    log.info("Report saved  → %s", report_path)


# ────────────────────────────────────────────────────────────────────────────
# Entry point
# ────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    db_name   = os.getenv("DB_NAME", "ai_prescription")

    log.info("Connecting to MongoDB at: %s (db: %s)", mongo_uri, db_name)

    texts, labels = fetch_training_data(mongo_uri, db_name)

    if len(set(labels)) < 2:
        log.error(
            "Not enough distinct conditions in the database to train a classifier. "
            "Seed the 'recommendations' collection first: python backend/recommendation_seed.py"
        )
        sys.exit(1)

    texts, labels = augment(texts, labels)
    pipeline, le, acc, report, _ = train(texts, labels)
    save_artefacts(pipeline, le, acc, report)

    log.info("Training complete. Accuracy: %.2f%%", acc * 100)
