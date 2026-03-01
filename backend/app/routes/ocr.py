from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.ai.ocr_engine import extract_text_from_image, extract_text_from_pdf, detect_medicines
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

@router.post("/upload")
async def upload_prescription(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Upload prescription image or PDF and extract structured medicine data
    """
    filename = file.filename.lower()
    if not filename.endswith((".png", ".jpg", ".jpeg", ".pdf")):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PNG, JPG, JPEG, and PDF allowed.")
    
    try:
        content = await file.read()
        
        # 1. Extract Text based on file type
        if filename.endswith(".pdf"):
            extracted_text = extract_text_from_pdf(content)
        else:
            extracted_text = extract_text_from_image(content)
            
        # 2. Fetch medicines for matching
        medicines_cursor = db.medicines.find({})
        available_medicines = await medicines_cursor.to_list(length=1000)
        
        # 3. Detect medicines in text
        detected_medicines = detect_medicines(extracted_text, available_medicines)
        
        return JSONResponse({
            "extracted_text": extracted_text,
            "medicines": detected_medicines
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"OCR or Detection failed: {str(e)}")
