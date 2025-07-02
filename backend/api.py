from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
import os

from backend.models.frame_model import (
    load_trained_model,
    enhance_audio as enhance_func
)

app = FastAPI()

# CORS: allow your deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # frontend URL
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "Audify backend up"}

# Load model on startup
model, mean, std = load_trained_model()
if model is None:
    raise RuntimeError("No trained model found! Run 'python backend/train.py'.")

@app.post("/enhance")
async def enhance(file: UploadFile = File(...)):
    data = await file.read()
    tmp_in = "temp_noisy.wav"
    with open(tmp_in, "wb") as f:
        f.write(data)

    buffer = io.BytesIO()
    try:
        enhance_func(model, tmp_in, mean, std, output_buffer=buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="audio/wav")