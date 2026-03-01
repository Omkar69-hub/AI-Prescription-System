from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.ai.ocr_engine import extract_text_from_image, extract_text_from_pdf, detect_medicines
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
import traceback

router = APIRouter()

ALLOWED_EXTENSIONS = (".png", ".jpg", ".jpeg", ".pdf")
MAX_FILE_SIZE_MB = 10


@router.post("/upload")
async def upload_prescription(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Upload a prescription image or PDF and extract structured medicine data via OCR.
    """
    filename = (file.filename or "").lower()

    # ── Validate file type ──────────────────────────────────────────────────
    if not filename.endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid file type. Only PNG, JPG, JPEG, and PDF files are supported."
            ),
        )

    try:
        content = await file.read()

        # ── Validate file size ───────────────────────────────────────────────
        if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB} MB.",
            )

        if len(content) == 0:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty. Please upload a valid prescription.",
            )

        # ── Extract text via OCR ─────────────────────────────────────────────
        if filename.endswith(".pdf"):
            extracted_text = extract_text_from_pdf(content)
        else:
            extracted_text = extract_text_from_image(content)

        # ── Fetch medicines for fuzzy matching ───────────────────────────────
        medicines_cursor = db.medicines.find({})
        available_medicines = await medicines_cursor.to_list(length=2000)

        # ── Detect medicines in extracted text ───────────────────────────────
        detected_medicines = detect_medicines(extracted_text, available_medicines)

        return JSONResponse(
            {
                "extracted_text": extracted_text,
                "medicines": detected_medicines,
                "medicine_count": len(detected_medicines),
            }
        )

    except HTTPException:
        raise  # re-raise HTTP errors unchanged

    except RuntimeError as e:
        # User-facing OCR / file-reading errors
        raise HTTPException(status_code=422, detail=str(e))

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=(
                "An unexpected error occurred while processing your prescription. "
                "Please ensure the image is clear and try again."
            ),
        )
