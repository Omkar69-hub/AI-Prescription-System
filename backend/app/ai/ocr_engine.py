import pytesseract

# Set path to your Tesseract executable
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


import pytesseract
from PIL import Image
import io
from app.utils.image_preprocess import preprocess_image

def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Extract text from prescription image bytes using OCR
    """
    try:
        # Load image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Preprocess image (grayscale, thresholding, etc.)
        processed_image = preprocess_image(image)
        
        # OCR extraction
        text = pytesseract.image_to_string(processed_image)
        
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"OCR extraction failed: {str(e)}")
