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

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://audify-gql7.onrender.com/"],  # change in production to your frontend domain
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pre‑trained model and stats
model, mean, std = load_trained_model()
if model is None:
    raise RuntimeError(
        "No trained model found! Please run `python backend/train.py` first."
    )

@app.post("/enhance")
async def enhance(file: UploadFile = File(...)):
    # Read uploaded audio bytes
    data = await file.read()
    tmp_in = "temp_noisy.wav"
    with open(tmp_in, "wb") as f:
        f.write(data)

    # Enhance into memory buffer
    buffer = io.BytesIO()
    enhance_func(model, tmp_in, mean, std, output_buffer=buffer)
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="audio/wav")
