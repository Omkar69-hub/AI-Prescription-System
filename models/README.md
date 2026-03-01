# models/

This folder organises all machine-learning artefacts for the **AI Prescription System**.

```
models/
├── train.py          # Train the symptom-condition classifier
├── test.py           # Evaluate the model + OCR smoke-test
├── saved/            # Auto-generated model files (git-ignored)
│   ├── symptom_classifier.pkl
│   ├── label_encoder.pkl
│   ├── training_report.txt
│   └── metadata.json
└── README.md
```

---

## Quick Start

### 1. Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Seed the database (if not done already)
```bash
cd backend
python recommendation_seed.py
```

### 3. Train the model
```bash
# From the project root
python models/train.py
```
Artefacts are saved to `models/saved/`.

### 4. Test / evaluate the model
```bash
# Run DB evaluation + sanity checks
python models/test.py

# Optional: OCR smoke-test on a sample prescription image
python models/test.py --ocr-image path/to/prescription.jpg

# Interactive symptom prediction CLI
python models/test.py --interactive
```

---

## How the Model is Used in the Backend

The trained pipeline is loaded by the recommendation engine at startup
and used to predict conditions from user-entered symptoms.

The `test.py` module also exports a `predict()` function that the backend
can call directly:

```python
from models.test import load_artefacts, predict

pipeline, le, _ = load_artefacts()
result = predict(pipeline, le, "fever headache cough")
# → {"condition": "Influenza", "confidence": 0.87, "top3": [...]}
```

---

## Notes

- The `saved/` folder is **git-ignored** by default — add it to `.gitignore`.
- Re-run `train.py` any time you add new recommendations to the database.
- The model uses **TF-IDF + Logistic Regression** — lightweight, fast, and
  effective for keyword-rich symptom descriptions.
