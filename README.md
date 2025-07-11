@@ .. @@
-# Audify AI Speech Enhancement
+# Audify AI Speech Enhancement - Production Ready
 
-A powerful AI-driven speech enhancement tool that removes noise and improves audio quality using deep learning.
+A powerful AI-driven speech enhancement tool with separated frontend and backend for production deployment.
 
-## Features
+## Architecture
 
-- **Advanced AI Model**: Deep neural network trained for speech enhancement
-- **Real-time Processing**: Fast audio enhancement with progress tracking
-- **Quality Metrics**: Comprehensive evaluation with PESQ, STOI, and SNR
-- **Modern Web Interface**: Intuitive drag-and-drop interface with dark/light themes
-- **Multiple Formats**: Supports WAV, MP3, FLAC, OGG, and M4A files
+```
+┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
+│                 │    Requests      │                 │
+│    Frontend     │◄────────────────►│   Backend API   │
+│   (Static Web)  │                  │   (Flask/ML)    │
+│                 │                  │                 │
+└─────────────────┘                  └─────────────────┘
+```
 
-## Quick Start
+### Frontend
+- Modern responsive web interface
+- Drag & drop file upload
+- Real-time progress tracking
+- Audio playback and comparison
+- Quality metrics display
+- Dark/Light theme toggle
 
-### Prerequisites
-- Python 3.10+
-- 4GB+ RAM recommended
-- Audio files for training (clean + noisy pairs)
+### Backend
+- RESTful API server
+- AI model for speech enhancement
+- File processing and management
+- Quality metrics calculation
+- CORS support for cross-origin requests
 
-### Installation
+## Quick Start
 
-1. **Clone the repository**
+### 1. Backend Setup
 ```bash
-git clone <repository-url>
-cd audify
+cd backend
+
+# Install dependencies
+pip install -r requirements.txt
+
+# Train the model (one-time setup)
+python train.py
+
+# Start the API server
+python app.py
 ```
 
-2. **Install dependencies**
+### 2. Frontend Setup
 ```bash
-pip install -r requirements.txt
+cd frontend
+
+# Update API URL in script.js if needed
+# Then serve the static files
+python -m http.server 3000
 ```
 
-3. **Prepare your dataset**
+### 3. Access the Application
+- Frontend: http://localhost:3000
+- Backend API: http://localhost:5000
+- Health Check: http://localhost:5000/health
+
+## Production Deployment
+
+### Option 1: Separate Hosting (Recommended)
+
+**Frontend (Static Hosting):**
+- Netlify, Vercel, GitHub Pages
+- AWS S3 + CloudFront
+- Any CDN or static hosting service
+
+**Backend (Server Hosting):**
+- Heroku, Railway, Render
+- AWS EC2, Google Cloud, DigitalOcean
+- Docker containers
+
+### Option 2: Docker Compose
 ```bash
-# Create dataset directories
-mkdir -p dataset/clean dataset/noisy
+# Deploy both services together
+cd deployment
+docker-compose up -d
+```
 
-# Add your audio files:
-# - Clean audio files in dataset/clean/
-# - Corresponding noisy files in dataset/noisy/
-# - Files should have matching names
+### Option 3: Manual Server Setup
+
+**Backend on Ubuntu:**
+```bash
+# Install system dependencies
+sudo apt update
+sudo apt install python3 python3-pip nginx
+
+# Setup backend
+cd backend
+pip3 install -r requirements.txt
+python3 train.py
+gunicorn --bind 0.0.0.0:5000 app:app
 ```
 
-4. **Train the model**
+**Frontend via nginx:**
 ```bash
-python backend/train.py
+# Copy frontend files to web directory
+sudo cp -r frontend/* /var/www/html/
+
+# Configure nginx to serve static files
+sudo systemctl restart nginx
 ```
 
-5. **Start the application**
+## Configuration
+
+### Frontend Configuration
+Update `CONFIG` in `frontend/script.js`:
+```javascript
+const CONFIG = {
+    API_BASE_URL: 'https://your-backend-domain.com',
+    MAX_FILE_SIZE: 30 * 1024 * 1024,
+    SUPPORTED_TYPES: ['audio/wav', 'audio/mpeg', 'audio/flac', 'audio/ogg', 'audio/mp4']
+};
+```
+
+### Backend Configuration
+Update CORS origins in `backend/app.py`:
+```python
+CORS(app, origins=[
+    "https://your-frontend-domain.com",
+    "http://localhost:3000"  # For development
+])
+```
+
+## API Documentation
+
+### Endpoints
+
+**Health Check**
+```
+GET /health
+Response: {"status": "healthy", "model_loaded": true}
+```
+
+**Enhance Audio**
+```
+POST /enhance
+Content-Type: multipart/form-data
+Body: audio file
+Response: {"success": true, "processing_id": "uuid"}
+```
+
+**Check Status**
+```
+GET /status/{processing_id}
+Response: {"status": "completed", "progress": 100, "result": {...}}
+```
+
+**Download Enhanced Audio**
+```
+GET /outputs/{filename}
+Response: Audio file download
+```
+
+## Development
+
+### Dataset Preparation
 ```bash
-python run.py
+# Create dataset structure
+mkdir -p dataset/clean dataset/noisy
+
+# Add matching audio files:
+# dataset/clean/audio1.wav
+# dataset/noisy/audio1.wav
 ```
 
-The application will be available at `http://localhost:5000`
+### Model Training
+```bash
+cd backend
+python train.py
+```
 
-## Usage
+### Local Development
+```bash
+# Terminal 1: Start backend
+cd backend && python app.py
 
-1. **Upload Audio**: Drag and drop or click to select an audio file
-2. **Enhance**: Click the "Enhance Audio" button to start processing
-3. **Compare**: Listen to both original and enhanced audio
-4. **Download**: Save the enhanced audio file
-5. **Metrics**: View quality improvement metrics
+# Terminal 2: Start frontend
+cd frontend && python -m http.server 3000
+```
 
-## Supported Formats
+## Features
 
-- **Input**: WAV, MP3, FLAC, OGG, M4A
-- **Output**: WAV (16kHz, 16-bit)
-- **Maximum file size**: 30MB
-- **Recommended duration**: Under 30 seconds for optimal performance
+### Audio Processing
+- Advanced AI model for speech enhancement
+- Support for multiple audio formats
+- Real-time processing with progress tracking
+- Quality metrics calculation (PESQ, STOI, SNR)
 
-## Technical Details
+### Web Interface
+- Modern, responsive design
+- Drag & drop file upload
+- Audio playback and comparison
+- Dark/Light theme toggle
+- Mobile-friendly interface
 
-### Model Architecture
-- **Type**: Frame-wise Deep Neural Network
-- **Input**: Magnitude spectrogram (dB scale)
-- **Output**: Enhanced magnitude spectrogram
-- **Training**: Supervised learning on clean/noisy pairs
+### Production Features
+- Separated frontend/backend architecture
+- RESTful API design
+- CORS support for cross-origin requests
+- Docker containerization
+- Health monitoring endpoints
+- Error handling and logging
 
-### Audio Processing Pipeline
-1. **Feature Extraction**: STFT → Magnitude → dB conversion
-2. **Normalization**: Z-score normalization using training statistics
-3. **Enhancement**: Frame-wise prediction using trained model
-4. **Reconstruction**: Magnitude + Original Phase → ISTFT
-5. **Post-processing**: Low-pass filtering for smoothing
+## File Structure
 
-### Quality Metrics
-- **PESQ**: Perceptual Evaluation of Speech Quality
-- **STOI**: Short-Time Objective Intelligibility
-- **Segmental SNR**: Signal-to-Noise Ratio per segment
+```
+audify/
+├── frontend/              # Static web application
+│   ├── index.html
+│   ├── style.css
+│   ├── script.js
+│   └── README.md
+├── backend/               # Flask API server
+│   ├── app.py            # Main application
+│   ├── api.py            # API endpoints
+│   ├── train.py          # Model training
+│   ├── requirements.txt
+│   ├── Dockerfile
+│   ├── data/             # Feature extraction
+│   ├── models/           # AI model and training
+│   └── metrics/          # Quality evaluation
+├── deployment/           # Deployment configurations
+│   ├── docker-compose.yml
+│   ├── nginx.conf
+│   └── README.md
+└── README.md            # This file
+```
 
-## File Structure
+## Monitoring and Maintenance
 
+### Health Checks
 ```
-audify/
-├── run.py                 # Main application launcher
-├── index.html            # Web interface
-├── style.css             # Styling and themes
-├── script.js             # Frontend logic
-├── requirements.txt      # Python dependencies
-├── Dockerfile           # Container configuration
-├── backend/
-│   ├── app.py           # Flask server
-│   ├── api.py           # API endpoints
-│   ├── train.py         # Model training script
-│   ├── data/
-│   │   └── features.py  # Audio feature extraction
-│   ├── models/
-│   │   ├── frame_model.py      # Model architecture
-│   │   ├── frame_model.keras   # Trained model (generated)
-│   │   └── norm_stats.json     # Normalization stats (generated)
-│   └── metrics/
-│       └── quality.py   # Quality evaluation metrics
-├── dataset/             # Training data (you provide)
-│   ├── clean/          # Clean audio files
-│   └── noisy/          # Noisy audio files
-├── temp/               # Temporary upload files
-└── outputs/            # Enhanced audio outputs
+# Backend health
+curl http://localhost:5000/health
+
+# Frontend health (if using nginx)
+curl http://localhost:3000/health
 ```
 
-## Docker Deployment
+### Logs
+- Backend: Check console output or configure logging
+- Frontend: Browser developer tools
+- Server: nginx/apache access logs
 
+### Performance
+- Monitor CPU/memory usage during processing
+- Implement rate limiting for production
+- Use load balancers for high traffic
+
+## Troubleshooting
+
+### Common Issues
+
+**CORS Errors:**
+- Update allowed origins in backend CORS configuration
+- Ensure frontend URL matches CORS settings
+
+**Model Not Found:**
 ```bash
-# Build and run with Docker
-docker build -t audify .
-docker run -p 5000:5000 audify
+cd backend
+python train.py  # Train the model first
 ```
 
-## Development
+**File Upload Issues:**
+- Check file size limits (30MB default)
+- Verify supported file formats
+- Ensure backend has write permissions
 
-### Adding New Features
-- **Frontend**: Modify `index.html`, `style.css`, `script.js`
-- **Backend**: Update `backend/api.py` for new endpoints
-- **Model**: Enhance `backend/models/frame_model.py`
+**Connection Issues:**
+- Verify backend is running on correct port
+- Check firewall settings
+- Ensure API_BASE_URL is correct in frontend
 
-### Training Custom Models
-- Prepare your dataset in `dataset/clean` and `dataset/noisy`
-- Modify hyperparameters in `backend/models/frame_model.py`
-- Run `python backend/train.py`
+## Contributing
 
-### API Integration
-- The backend provides RESTful endpoints
-- Frontend communicates via AJAX requests
-- Real-time updates using polling mechanism
+1. Fork the repository
+2. Create feature branch
+3. Test both frontend and backend
+4. Submit pull request
 
-## Troubleshooting
+## License
 
-### Common Issues
+MIT License - see LICENSE file for details.
 
-1. **Model not found**: Run `python backend/train.py` first
-2. **Port already in use**: Change port in `run.py` or kill existing process
-3. **Out of memory**: Reduce batch size in training or use smaller audio files
-4. **Poor enhancement quality**: Train with more diverse dataset
-5. **Slow processing**: Ensure sufficient RAM and consider GPU acceleration
+## Support
 
-### Performance Optimization
-- **GPU Support**: Install TensorFlow-GPU for faster processing
-- **Memory Management**: Process shorter audio segments
-- **Caching**: Implement model caching for repeated use
+For issues and questions:
+1. Check the troubleshooting section
+2. Review deployment documentation
+3. Open an issue on GitHub
+4. Check logs for error details
 
-## Contributing
+---
 
-1. Fork the repository
-2. Create a feature branch
-3. Make your changes
-4. Add tests if applicable
-5. Submit a pull request
+**Note**: This is a production-ready setup with separated frontend and backend services. For development, you can run both services locally. For production, deploy them to separate hosting services for better scalability and maintenance.