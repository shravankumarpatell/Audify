"""
Main Flask application server for Audify.
Production-ready API server for audio enhancement.
"""
import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

# Import API functions
from api import enhance, get_status, download_file, processing_status, processing_lock

# Create main Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app, origins=[
    "http://localhost:3000",  # Local development
    "http://localhost:8080",  # Local preview
    "https://your-frontend-domain.com",  # Replace with your frontend domain
    # Add more allowed origins as needed
])

# Check if model exists on startup
MODEL_PATH = "backend/models/frame_model.keras"
STATS_PATH = "backend/models/norm_stats.json"

def check_model_availability():
    """Check if trained model exists"""
    return os.path.exists(MODEL_PATH) and os.path.exists(STATS_PATH)

@app.route('/health')
def health():
    """Health check endpoint"""
    model_available = check_model_availability()
    return jsonify({
        "status": "healthy",
        "model_loaded": model_available,
        "model_path": MODEL_PATH,
        "stats_path": STATS_PATH
    })

@app.route('/api/info')
def api_info():
    """API information endpoint"""
    return jsonify({
        "name": "Audify API",
        "version": "1.0.0",
        "description": "AI Speech Enhancement API"
    })

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

# Register API routes
app.add_url_rule('/enhance', 'enhance', enhance, methods=['POST'])
app.add_url_rule('/status/<processing_id>', 'get_status', get_status, methods=['GET'])
app.add_url_rule('/outputs/<filename>', 'download_file', download_file, methods=['GET'])

if __name__ == '__main__':
    # Check model availability on startup
    if not check_model_availability():
        print("❌ ERROR: Trained model not found!")
        print("Please run 'python backend/train.py' first to train the model.")
        print(f"Expected files:")
        print(f"  - {MODEL_PATH}")
        print(f"  - {STATS_PATH}")
        sys.exit(1)
    
    print("🚀 Starting Audify API server...")
    print("🔗 API available at http://localhost:5000")
    print("📋 Health check: http://localhost:5000/health")
    
    # Create necessary directories
    os.makedirs('temp', exist_ok=True)
    os.makedirs('outputs', exist_ok=True)
    