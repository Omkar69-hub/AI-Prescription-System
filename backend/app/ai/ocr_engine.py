# backend/app/ai/ocr_engine.py

import pytesseract
from PIL import Image
import io
import fitz  # PyMuPDF
import re
from rapidfuzz import process, fuzz
from app.utils.image_preprocess import preprocess_image
from app.ai.parser import parse_dosage_and_timing

# Set path to your Tesseract executable
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF using PyMuPDF and OCR for images within PDF"""
    text = ""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            page_text = page.get_text()
            if page_text.strip():
                text += page_text + "\n"
            else:
                pix = page.get_pixmap()
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                processed_img = preprocess_image(img)
                text += pytesseract.image_to_string(processed_img) + "\n"
        doc.close()
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"PDF OCR extraction failed: {str(e)}")

def extract_text_from_image(image_bytes: bytes) -> str:
    """Extract text from image bytes using OCR"""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        processed_image = preprocess_image(image)
        # PSM 11: Sparse text. Find as much text as possible in no particular order.
        # Often better for handwriting scattered across a page.
        text = pytesseract.image_to_string(processed_image, config="--psm 11")
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"Image OCR extraction failed: {str(e)}")

def detect_medicines(text: str, available_medicines: list) -> list:
    """
    Match extracted text against a list of available medicines using fuzzy matching.
    """
    detected = []
    # Tokenize text into words / short phrases to check against DB
    tokens = re.findall(r"\b\w{4,}\b", text) # Only check words with 4+ characters
    
    brand_names = [med["brand_name"] for med in available_medicines]
    
    seen_brands = set()

    for token in tokens:
        # Fuzzy match each token against the entire brand database
        match = process.extractOne(token, brand_names, scorer=fuzz.WRatio)
        
        if match and match[1] > 80: # Confidence threshold
            matched_brand = match[0]
            if matched_brand not in seen_brands:
                seen_brands.add(matched_brand)
                
                # Find the full medicine object
                med_obj = next(m for m in available_medicines if m["brand_name"] == matched_brand)
                
                # Parse dosage and timing from the full context
                instructions = parse_dosage_and_timing(text, matched_brand)
                
                detected.append({
                    "brand": med_obj["brand_name"],
                    "generic": med_obj["generic_name"],
                    "dosage": med_obj.get("dosage", "N/A"),
                    "frequency": instructions["frequency"],
                    "timing": instructions["timing"],
                    "duration": instructions["duration"]
                })
            
    return detected
