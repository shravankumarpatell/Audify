from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
import os

from backend.models.frame_model import train_model, enhance_audio as enhance_func

app = FastAPI()

# Enable CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Train model once at startup
model, mean, std = train_model(os.path.join('dataset', 'clean'),
                                os.path.join('dataset', 'noisy'))

@app.post('/enhance')
async def enhance(file: UploadFile = File(...)):
    # Read uploaded audio bytes
    data = await file.read()
    # Save to temp file
    tmp_in = 'temp_noisy.wav'
    with open(tmp_in, 'wb') as f:
        f.write(data)

    # Enhance and write to buffer
    buffer = io.BytesIO()
    enhance_func(model, tmp_in, mean, std, output_path=None, output_buffer=buffer)
    buffer.seek(0)

    return StreamingResponse(buffer, media_type='audio/wav')