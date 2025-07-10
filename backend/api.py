from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import io
import os
import uuid
import threading
import time
import json
from werkzeug.utils import secure_filename
import soundfile as sf
import numpy as np

from models.frame_model import (
    load_trained_model,
    enhance_audio as enhance_func
)
from metrics.quality import segmental_snr, compute_pesq, compute_stoi

app = Flask(__name__, static_folder='../outputs', static_url_path='/outputs')
CORS(app)

# Global storage for processing status
processing_status = {}
processing_lock = threading.Lock()

# Load model on startup
model, mean, std = load_trained_model()
if model is None:
    print("WARNING: No trained model found! Please run 'python backend/train.py' first.")

# Create necessary directories
os.makedirs('temp', exist_ok=True)
os.makedirs('outputs', exist_ok=True)

@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('../', 'index.html')

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None
    })

@app.route('/enhance', methods=['POST'])
def enhance():
    """Start audio enhancement process"""
    if 'audio' not in request.files:
        return jsonify({'success': False, 'error': 'No audio file provided'}), 400
    
    if model is None:
        return jsonify({'success': False, 'error': 'Model not loaded. Please train the model first.'}), 500
    
    file = request.files['audio']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400
    
    try:
        # Generate unique processing ID
        processing_id = str(uuid.uuid4())
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        temp_path = os.path.join('temp', f"{processing_id}_{filename}")
        file.save(temp_path)
        
        # Initialize processing status
        with processing_lock:
            processing_status[processing_id] = {
                'status': 'processing',
                'progress': 0,
                'error': None,
                'result': None
            }
        
        # Start processing in background thread
        thread = threading.Thread(target=process_audio, args=(processing_id, temp_path))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'processing_id': processing_id
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def process_audio(processing_id, input_path):
    """Background processing function"""
    try:
        # Update progress
        update_progress(processing_id, 25)
        
        # Generate output filename
        output_filename = f"enhanced_{processing_id}.wav"
        output_path = os.path.join('outputs', output_filename)
        
        # Create output buffer for metrics calculation
        output_buffer = io.BytesIO()
        
        # Update progress
        update_progress(processing_id, 50)
        
        # Enhance audio
        enhance_func(model, input_path, mean, std, 
                    output_path=output_path, 
                    output_buffer=output_buffer)
        
        # Update progress
        update_progress(processing_id, 75)
        
        # Load original and enhanced audio for metrics
        original_audio, sr = sf.read(input_path)
        enhanced_audio, _ = sf.read(output_path)
        
        # Calculate quality metrics
        metrics = calculate_metrics(original_audio, enhanced_audio, sr)
        
        # Update progress
        update_progress(processing_id, 100)
        
        # Mark as completed
        with processing_lock:
            processing_status[processing_id] = {
                'status': 'completed',
                'progress': 100,
                'error': None,
                'result': {
                    'success': True,
                    'output_filename': output_filename,
                    'metrics': metrics
                }
            }
        
        # Clean up temp file
        try:
            os.remove(input_path)
        except:
            pass
            
    except Exception as e:
        with processing_lock:
            processing_status[processing_id] = {
                'status': 'error',
                'progress': 0,
                'error': str(e),
                'result': None
            }

def update_progress(processing_id, progress):
    """Update processing progress"""
    with processing_lock:
        if processing_id in processing_status:
            processing_status[processing_id]['progress'] = progress

def calculate_metrics(original, enhanced, sr):
    """Calculate quality metrics"""
    try:
        # Ensure same length
        min_len = min(len(original), len(enhanced))
        original = original[:min_len]
        enhanced = enhanced[:min_len]
        
        # Calculate metrics
        seg_snr = segmental_snr(original, enhanced)
        pesq_score = compute_pesq(original, enhanced, sr)
        stoi_score = compute_stoi(original, enhanced, sr)
        
        # Additional metrics
        snr = 10 * np.log10(np.mean(original**2) / np.mean((original - enhanced)**2 + 1e-10))
        signal_length = len(enhanced) / sr
        signal_rms = np.sqrt(np.mean(enhanced**2))
        
        return {
            'segmental_snr': float(seg_snr),
            'pesq': float(pesq_score),
            'stoi': float(stoi_score),
            'snr': float(snr),
            'signal_length': float(signal_length),
            'signal_rms': float(signal_rms)
        }
    except Exception as e:
        print(f"[calculate_metrics] failed: {e}")
        return {
            'segmental_snr': 0.0,
            'pesq': 0.0,
            'stoi': 0.0,
            'snr': 0.0,
            'signal_length': 0.0,
            'signal_rms': 0.0
        }

@app.route('/status/<processing_id>')
def get_status(processing_id):
    """Get processing status"""
    with processing_lock:
        if processing_id in processing_status:
            return jsonify(processing_status[processing_id])
        else:
            return jsonify({'status': 'not_found'}), 404

@app.route('/download/<filename>')
def download_file(filename):
    """Download enhanced audio file"""
    try:
        return send_from_directory('outputs', filename, as_attachment=False)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)