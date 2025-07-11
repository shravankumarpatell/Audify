#!/usr/bin/env python3
"""
Audify - AI Speech Enhancement Tool
Main application launcher that serves both frontend and backend
"""

import os
import sys
import threading
import time
import webbrowser
from pathlib import Path

# Add backend to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        import flask
        import numpy
        import librosa
        import tensorflow
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def check_model():
    """Check if the AI model is trained and available"""
    model_path = os.path.join('backend', 'models', 'frame_model.keras')
    stats_path = os.path.join('backend', 'models', 'norm_stats.json')
    
    if os.path.exists(model_path) and os.path.exists(stats_path):
        print("✅ AI model is ready")
        return True
    else:
        print("❌ AI model not found!")
        print("Please run: python backend/train.py")
        return False

def start_backend():
    """Start the Flask backend server"""
    try:
        from backend.app import app
        print("🚀 Starting backend server on http://localhost:5000")
        app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
    except Exception as e:
        print(f"❌ Backend server failed to start: {e}")
        sys.exit(1)

def start_frontend():
    """Start the frontend server"""
    import http.server
    import socketserver
    import os
    
    # Change to frontend directory
    frontend_dir = os.path.join(os.path.dirname(__file__), 'frontend')
    os.chdir(frontend_dir)
    
    PORT = 3000
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"🌐 Starting frontend server on http://localhost:{PORT}")
            httpd.serve_forever()
    except Exception as e:
        print(f"❌ Frontend server failed to start: {e}")
        sys.exit(1)

def open_browser():
    """Open the application in the default browser"""
    time.sleep(2)  # Wait for servers to start
    try:
        webbrowser.open('http://localhost:3000')
        print("🌍 Opening application in browser...")
    except Exception as e:
        print(f"⚠️  Could not open browser automatically: {e}")
        print("Please manually open: http://localhost:3000")

def main():
    """Main application launcher"""
    print("=" * 50)
    print("🎵 AUDIFY - AI Speech Enhancement Tool")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check if model is trained
    if not check_model():
        print("\n📚 Training the AI model...")
        try:
            import subprocess
            result = subprocess.run([sys.executable, 'backend/train.py'], 
                                  capture_output=True, text=True)
            if result.returncode != 0:
                print(f"❌ Model training failed: {result.stderr}")
                sys.exit(1)
            print("✅ Model training completed!")
        except Exception as e:
            print(f"❌ Could not train model: {e}")
            sys.exit(1)
    
    # Create necessary directories
    os.makedirs('temp', exist_ok=True)
    os.makedirs('outputs', exist_ok=True)
    
    print("\n🚀 Starting Audify servers...")
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Wait a moment for backend to start
    time.sleep(3)
    
    # Open browser in a separate thread
    browser_thread = threading.Thread(target=open_browser, daemon=True)
    browser_thread.start()
    
    print("\n" + "=" * 50)
    print("🎉 Audify is running!")
    print("📱 Frontend: http://localhost:3000")
    print("🔧 Backend API: http://localhost:5000")
    print("❤️  Health Check: http://localhost:5000/health")
    print("=" * 50)
    print("\n💡 Tips:")
    print("   • Upload audio files up to 30MB")
    print("   • Supported formats: WAV, MP3, FLAC, OGG, M4A")
    print("   • Press Ctrl+C to stop the application")
    print("\n🔄 Starting frontend server...")
    
    try:
        # Start frontend (this will block)
        start_frontend()
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down Audify...")
        print("Thank you for using Audify!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Application error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()