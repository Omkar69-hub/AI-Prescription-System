# backend/create_test_prescription.py

from PIL import Image, ImageDraw, ImageFont
import os

def create_prescription():
    # Create a white image
    img = Image.new('RGB', (800, 1000), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    
    # Try to load a font, otherwise use default
    try:
        font = ImageFont.truetype("arial.ttf", 40)
        font_small = ImageFont.truetype("arial.ttf", 30)
    except:
        font = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Header
    d.text((50, 50), "Dr. Smith's Medical Center", fill=(0, 0, 0), font=font)
    d.text((50, 100), "Date: 01/03/2026", fill=(0, 0, 0), font_small=font_small)
    
    # Prescription items
    d.text((50, 250), "Thyronorm 50ug", fill=(0, 0, 0), font=font)
    d.text((70, 300), "Take once daily", fill=(50, 50, 50), font_small=font_small)
    d.text((70, 340), "Before breakfast / Empty stomach", fill=(50, 50, 50), font_small=font_small)
    d.text((70, 380), "for 3 months", fill=(50, 50, 50), font_small=font_small)

    d.text((50, 500), "Cabupotin 0.25mg", fill=(0, 0, 0), font=font)
    d.text((70, 550), "twice a week", fill=(50, 50, 50), font_small=font_small)
    d.text((70, 590), "after meals", fill=(50, 50, 50), font_small=font_small)

    img.save('test_prescription.png')
    print("Test prescription image created: test_prescription.png")

if __name__ == "__main__":
    create_prescription()
