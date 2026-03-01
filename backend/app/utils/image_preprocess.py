# backend/app/utils/image_preprocess.py

import cv2
import numpy as np
from PIL import Image

def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Refined preprocessing for handwritten text:
    - Increase contrast
    - Grayscale
    - Lighter Gaussian Blur
    - Larger block size for Adaptive Thresholding
    """
    # Convert PIL to OpenCV format
    img_np = np.array(image.convert("RGB"))
    img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
    
    # 1. Increase Contrast (Handwriting is often faint)
    alpha = 1.5 # Contrast control
    beta = 0    # Brightness control
    img_contrast = cv2.convertScaleAbs(img_bgr, alpha=alpha, beta=beta)
    
    # 2. Grayscale
    gray = cv2.cvtColor(img_contrast, cv2.COLOR_BGR2GRAY)
    
    # 3. Denoising
    denoised = cv2.GaussianBlur(gray, (3, 3), 0)
    
    # 4. Adaptive Thresholding
    # Larger block size (21 instead of 11) helps with larger handwritten letters
    thresh = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 21, 5
    )
    
    # Convert back to PIL Image
    return Image.fromarray(thresh)
