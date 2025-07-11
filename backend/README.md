# Audify Backend API

This is the backend API server for Audify AI Speech Enhancement tool.

## Features

- RESTful API for audio enhancement
- Real-time processing status updates
- Quality metrics calculation (PESQ, STOI, SNR)
- File upload and download handling
- CORS support for frontend integration

## Setup

### Prerequisites
- Python 3.10+
- Trained AI model (run training first)

### Installation
```bash
# Install dependencies
pip install -r requirements.txt

# Train the model (one-time setup)
python train.py

# Start the server
python app.py
```

### Production Deployment

#### Option 1: Using Gunicorn
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Option 2: Using Waitress
```bash
waitress-serve --host=0.0.0.0 --port=5000 app:app
```

#### Option 3: Docker
```bash
docker build -t audify-backend .
docker run -p 5000:5000 audify-backend
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and model availability.

### Enhance Audio
```
POST /enhance
Content-Type: multipart/form-data

Body: audio file (WAV, MP3, FLAC, OGG, M4A)
```
Starts audio enhancement process and returns processing ID.

### Check Status
```
GET /status/{processing_id}
```
Returns processing status and progress.

### Download Enhanced Audio
```
GET /outputs/{filename}
```
Downloads the enhanced audio file.

## Configuration

### CORS Settings
Update the allowed origins in `app.py`:

```python
CORS(app, origins=[
    "http://localhost:3000",
    "https://your-frontend-domain.com"
])
```

### File Limits
- Maximum file size: 30MB
- Supported formats: WAV, MP3, FLAC, OGG, M4A
- Processing timeout: 5 minutes

## Model Training

Before running the server, you need to train the AI model:

1. Prepare dataset:
   ```
   dataset/
   ├── clean/     # Clean audio files
   └── noisy/     # Noisy audio files
   ```

2. Train the model:
   ```bash
   python train.py
   ```

3. Model files will be saved to:
   - `models/frame_model.keras`
   - `models/norm_stats.json`

## File Structure

```
backend/
├── app.py                 # Main Flask application
├── api.py                 # API endpoints
├── train.py              # Model training script
├── requirements.txt      # Python dependencies
├── Dockerfile           # Docker configuration
├── data/
│   └── features.py      # Audio feature extraction
├── models/
│   ├── frame_model.py   # Model architecture and training
│   ├── frame_model.keras # Trained model (generated)
│   └── norm_stats.json  # Normalization stats (generated)
├── metrics/
│   └── quality.py       # Audio quality metrics
└── README.md           # This file
```

## Environment Variables

- `FLASK_ENV`: Set to 'production' for production deployment
- `PORT`: Server port (default: 5000)
- `HOST`: Server host (default: 0.0.0.0)

## Monitoring

The API provides health checks and status endpoints for monitoring:

- Health: `GET /health`
- API Info: `GET /api/info`

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 400: Bad Request (invalid file, etc.)
- 404: Not Found
- 500: Internal Server Error