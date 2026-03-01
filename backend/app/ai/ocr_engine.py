import pytesseract
from PIL import Image
import io
import fitz  # PyMuPDF
import re
from app.utils.image_preprocess import preprocess_image

# Set path to your Tesseract executable
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF using PyMuPDF and OCR for images within PDF"""
    text = ""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            
            # First try direct text extraction (if it's a searchable PDF)
            page_text = page.get_text()
            if page_text.strip():
                text += page_text + "\n"
            else:
                # If no text, render page as image and use OCR
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
        text = pytesseract.image_to_string(processed_image)
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"Image OCR extraction failed: {str(e)}")

def detect_medicines(text: str, available_medicines: list) -> list:
    """
    Match extracted text against a list of available medicines (brand names)
    and return a list of detections with their generic names.
    """
    detected = []
    text_lower = text.lower()
    
    for med in available_medicines:
        # Simple word boundary matching for brand names
        brand_pattern = rf"\b{re.escape(med['brand_name'].lower())}\b"
        if re.search(brand_pattern, text_lower):
            detected.append({
                "brand": med["brand_name"],
                "generic": med["generic_name"],
                "dosage": med.get("dosage", "N/A")
            })
            
    return detected
