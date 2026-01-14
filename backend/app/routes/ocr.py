from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from app.ai.ocr_engine import extract_text_from_image

router = APIRouter()

@router.post("/upload")
async def upload_prescription(file: UploadFile = File(...)):
    """
    Upload prescription image and extract text using OCR
    """
    if not file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PNG, JPG, JPEG allowed.")
    
    try:
        content = await file.read()
        extracted_text = extract_text_from_image(content)
        return JSONResponse({"text": extracted_text})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")
