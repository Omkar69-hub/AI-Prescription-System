# backend/app/ai/ocr_engine.py

import pytesseract
from PIL import Image
import io
import re
import os
import sys

from rapidfuzz import process, fuzz
from app.utils.image_preprocess import preprocess_image
from app.ai.parser import parse_dosage_and_timing

# ─────────────────────────────────────────────────
# Tesseract path — auto-detect across environments
# ─────────────────────────────────────────────────
def _find_tesseract() -> str:
    """Return the path to the tesseract executable."""
    candidates = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        r"C:\Users\Asus\AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
        "/usr/bin/tesseract",
        "/usr/local/bin/tesseract",
    ]
    for path in candidates:
        if os.path.isfile(path):
            return path
    # Fall back to PATH lookup (Linux/Mac CI environments)
    return "tesseract"

pytesseract.pytesseract.tesseract_cmd = _find_tesseract()


# ─────────────────────────────────────────────────
# PyMuPDF — optional dependency guard
# ─────────────────────────────────────────────────
try:
    import fitz  # PyMuPDF
    _FITZ_AVAILABLE = True
except ImportError:
    _FITZ_AVAILABLE = False


# ─────────────────────────────────────────────────
# Helper: multi-pass OCR for best text extraction
# ─────────────────────────────────────────────────
def _ocr_image(pil_image: Image.Image) -> str:
    """
    Run Tesseract with multiple Page Segmentation Modes and return
    the longest (richest) result — handles both printed and handwritten rx.
    """
    processed = preprocess_image(pil_image)

    results = []
    for psm in (6, 11, 3):
        try:
            config = f"--psm {psm} --oem 3"
            text = pytesseract.image_to_string(processed, config=config, lang="eng")
            results.append(text.strip())
        except Exception:
            pass

    # Also try on the raw (un-processed) image as a fallback
    try:
        raw_text = pytesseract.image_to_string(pil_image, config="--psm 6 --oem 3", lang="eng")
        results.append(raw_text.strip())
    except Exception:
        pass

    # Return the longest extraction; it usually captures the most content
    if not results:
        raise RuntimeError("Tesseract produced no output. Check Tesseract installation.")

    return max(results, key=len)


# ─────────────────────────────────────────────────
# PDF extraction
# ─────────────────────────────────────────────────
def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF using PyMuPDF and OCR for scanned pages."""
    if not _FITZ_AVAILABLE:
        raise RuntimeError(
            "PyMuPDF is not installed. Run: pip install PyMuPDF"
        )
    text_parts = []
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            page_text = page.get_text().strip()
            if page_text:
                text_parts.append(page_text)
            else:
                # Scanned page → rasterize and OCR
                pix = page.get_pixmap(dpi=300)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                text_parts.append(_ocr_image(img))
        doc.close()
    except Exception as e:
        raise RuntimeError(f"PDF processing failed: {e}")

    combined = "\n".join(text_parts).strip()
    if not combined:
        raise RuntimeError(
            "No text could be extracted from the PDF. "
            "Ensure the file is a valid, legible prescription."
        )
    return combined


# ─────────────────────────────────────────────────
# Image extraction
# ─────────────────────────────────────────────────
def extract_text_from_image(image_bytes: bytes) -> str:
    """Extract text from image bytes using multi-pass OCR."""
    try:
        image = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise RuntimeError(f"Cannot open image: {e}")

    text = _ocr_image(image)

    if not text:
        raise RuntimeError(
            "No text could be extracted from the image. "
            "Please upload a clearer photo of the prescription."
        )
    return text


# ─────────────────────────────────────────────────
# Medicine detection from extracted text
# ─────────────────────────────────────────────────
def detect_medicines(text: str, available_medicines: list) -> list:
    """
    Match extracted text against the medicine database using fuzzy matching.

    Strategy:
      1. Build a flat list of brand names.
      2. Tokenise the OCR text into overlapping 1-word and 2-word phrases.
      3. For every token/phrase, use rapidfuzz WRatio scorer with a
         configurable threshold (default 78).
      4. Deduplicate and return structured results.
    """
    if not available_medicines:
        return []

    brand_names = [med["brand_name"] for med in available_medicines]

    # Build query tokens: individual words (≥4 chars) + two-word phrases
    words = re.findall(r"\b\w{3,}\b", text)
    tokens = set(words)
    for i in range(len(words) - 1):
        tokens.add(f"{words[i]} {words[i+1]}")

    THRESHOLD = 78  # lower than before to catch partial spellings in handwriting
    seen_brands: set = set()
    detected: list = []

    for token in tokens:
        match = process.extractOne(token, brand_names, scorer=fuzz.WRatio)
        if match and match[1] >= THRESHOLD:
            matched_brand = match[0]
            if matched_brand not in seen_brands:
                seen_brands.add(matched_brand)
                med_obj = next(
                    (m for m in available_medicines if m["brand_name"] == matched_brand),
                    None,
                )
                if med_obj is None:
                    continue
                instructions = parse_dosage_and_timing(text, matched_brand)
                detected.append({
                    "brand":     med_obj["brand_name"],
                    "generic":   med_obj["generic_name"],
                    "dosage":    med_obj.get("dosage", "N/A"),
                    "frequency": instructions["frequency"],
                    "timing":    instructions["timing"],
                    "duration":  instructions["duration"],
                })

    return detected
