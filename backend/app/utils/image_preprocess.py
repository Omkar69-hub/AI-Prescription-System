# backend/app/utils/image_preprocess.py

import cv2
import numpy as np
from PIL import Image

def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Advanced preprocessing for handwritten text using OpenCV:
    - Grayscale
    - Denoising (Gaussian Blur)
    - Adaptive Thresholding (Crucial for varying lights in prescription photos)
    - Optional: Dilate/Erode to clean up lines
    """
    # Convert PIL to OpenCV format (numpy array)
    img_np = np.array(image.convert("RGB"))
    
    # Convert RGB to BGR (OpenCV default)
    img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
    
    # 1. Grayscale
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    # 2. Denoising
    # Gaussian blur helps remove high-frequency noise (graininess)
    denoised = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # 3. Adaptive Thresholding
    # This handles uneven lighting much better than global thresholding (128)
    thresh = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 11, 2
    )
    
    # 4. Optional: Morphological operations to clean up small dots
    kernel = np.ones((1, 1), np.uint8)
    img_final = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

    # Convert back to PIL Image
    return Image.fromarray(img_final)
