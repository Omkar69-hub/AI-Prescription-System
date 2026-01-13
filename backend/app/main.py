# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import routes
from app.routes import auth, ocr, nlp, recommend, history

# Import database connection (MongoDB)
from app.core.database import connect_db, close_db

app = FastAPI(
    title="AI Prescription System",
    description="Backend API for AI-based prescription and medicine recommendations",
    version="1.0.0"
)

# ----------------------------
# CORS Middleware
# ----------------------------
origins = [
    "http://localhost:5173",  # Frontend (Vite/React default)
    "http://localhost:3000",  # React dev server
    "*",                      # Optional: allow all origins (dev only)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Startup / Shutdown Events
# ----------------------------
@app.on_event("startup")
async def startup_db():
    await connect_db()
    print("Database connected!")

@app.on_event("shutdown")
async def shutdown_db():
    await close_db()
    print("Database disconnected!")

# ----------------------------
# Include Routers
# ----------------------------
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
app.include_router(nlp.router, prefix="/api/nlp", tags=["NLP"])
app.include_router(recommend.router, prefix="/api/symptoms", tags=["Recommendations"])
app.include_router(history.router, prefix="/api/history", tags=["History"])

# ----------------------------
# Root Endpoint
# ----------------------------
@app.get("/")
async def root():
    return JSONResponse({"message": "Welcome to AI Prescription System API!"})

# ----------------------------
# Run with: uvicorn main:app --reload
# ----------------------------
