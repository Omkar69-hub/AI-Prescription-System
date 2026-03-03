# backend/app/utils/image_preprocess.py

import cv2
import numpy as np
from PIL import Image

def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Refined preprocessing for handwritten text on colored or textured paper:
    1. Grayscale
    2. Rescale (DPI adjustment simulation)
    3. Contrast & Sharpness enhancement
    4. Noise removal
    5. Morphological closing to join broken handwritten strokes
    6. Adaptive thresholding
    """
    # Convert PIL to BGR OpenCV format
    img_np = np.array(image.convert("RGB"))
    img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

    # 1. Resize if too small (Tesseract needs enough pixels for character features)
    h, w = img_bgr.shape[:2]
    if h < 1000 or w < 1000:
        factor = 2000.0 / max(h, w)
        img_bgr = cv2.resize(img_bgr, None, fx=factor, fy=factor, interpolation=cv2.INTER_CUBIC)

    # 2. Grayscale
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 3. Enhance Contrast (CLAHE - Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # 4. Noise Removal (Fast Non-Local Means Denoising)
    # This is more effective than Gaussian Blur for handwritten text
    denoised = cv2.fastNlMeansDenoising(enhanced, None, 10, 7, 21)

    # 5. Adaptive Thresholding
    # Use a large block size for handwriting
    thresh = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 31, 10
    )

    # 6. Optional: Dilation/Erosion to fix broken strokes (Closing)
    # kernel = np.ones((2, 2), np.uint8)
    # thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    return Image.fromarray(thresh)
