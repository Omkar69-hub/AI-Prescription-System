# backend/app/utils/image_preprocess.py

from PIL import Image, ImageFilter, ImageOps

def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Preprocess image to improve OCR accuracy:
    - Convert to grayscale
    - Apply thresholding
    - Optional: sharpen or denoise
    """
    # Convert to grayscale
    image = ImageOps.grayscale(image)
    
    # Enhance edges / sharpen
    image = image.filter(ImageFilter.SHARPEN)
    
    # Optionally, apply thresholding (binarization)
    image = image.point(lambda x: 0 if x < 128 else 255, '1')
    
    return image
