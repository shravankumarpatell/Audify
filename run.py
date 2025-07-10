#!/usr/bin/env python3
"""
Main launcher script for Audify AI Speech Enhancement.
Checks model availability and starts the Flask server.
"""
import os
import sys
import webbrowser
import time
import socket
from contextlib import closing

def check_model_availability():
    """Check if trained model and stats files exist"""
    model_path = "backend/models/frame_model.keras"
    stats_path = "backend/models/norm_stats.json"
    
    model_exists = os.path.exists(model_path)
    stats_exists = os.path.exists(stats_path)
    
    return model_exists and stats_exists, model_path, stats_path

def check_port_available(port):
    """Check if port is available"""
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
        return sock.connect_ex(('localhost', port)) != 0

def print_training_instructions():
    """Print clear instructions for training the model"""
    print("\n" + "="*60)
    print("🤖 AUDIFY AI SPEECH ENHANCEMENT")
    print("="*60)
    print("\n❌ ERROR: Trained model not found!")
    print("\n📋 SETUP REQUIRED:")
    print("1. Prepare your dataset:")
    print("   - Add clean audio files to: dataset/clean/")
    print("   - Add noisy audio files to: dataset/noisy/")
    print("   - Files should have matching names (e.g., audio1.wav in both folders)")
    print("   - Supported formats: WAV, MP3, FLAC")
    print("\n2. Train the model (one-time setup):")
    print("   python backend/train.py")
    print("\n3. Then run this script again:")
    print("   python run.py")
    print("\n💡 Training typically takes 5-15 minutes depending on dataset size.")
    print("="*60)

def print_startup_banner():
    """Print startup banner with server info"""
    print("\n" + "="*60)
    print("🚀 AUDIFY AI SPEECH ENHANCEMENT")
    print("="*60)
    print("✅ Model loaded successfully!")
    print("🌐 Starting Flask server...")
    print("📱 Server URL: http://localhost:5000")
    print("💡 Press Ctrl+C to stop the server")
    print("="*60)

# def prompt_browser_open():
#     """Ask user if they want to open browser"""
#     try:
#         response = input("\n🌐 Open browser automatically? (y/n): ").lower().strip()
#         return response in ['y', 'yes', '']
#     except KeyboardInterrupt:
#         print("\nStarting server without browser...")
#         return False

def open_browser_delayed(url, delay=1):
    """Open browser after a delay"""
    def delayed_open():
        time.sleep(delay)
        try:
            webbrowser.open(url)
            print(f"🌐 Browser opened: {url}")
        except Exception as e:
            print(f"⚠️  Could not open browser: {e}")
    
    import threading
    thread = threading.Thread(target=delayed_open)
    thread.daemon = True
    thread.start()

def main():
    """Main function to start Audify"""
    try:
        # Check if model exists
        model_available, model_path, stats_path = check_model_availability()
        
        if not model_available:
            print_training_instructions()
            print(f"\n📁 Expected files:")
            print(f"   - {model_path}")
            print(f"   - {stats_path}")
            sys.exit(1)
        
        # Check if port 5000 is available
        if not check_port_available(5000):
            print("❌ ERROR: Port 5000 is already in use!")
            print("💡 Please stop any other applications using port 5000 or kill the process.")
            print("   On Windows: netstat -ano | findstr :5000")
            print("   On Mac/Linux: lsof -i :5000")
            sys.exit(1)
        
        # Print startup banner
        print_startup_banner()
        
        # Ask about browser
        open_browser = True
        
        # Create necessary directories
        os.makedirs('temp', exist_ok=True)
        os.makedirs('outputs', exist_ok=True)
        
        # Import and start Flask app
        try:
    # Add backend to Python path
            sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
            from app import app
            
            # Open browser if requested
            if open_browser:
                open_browser_delayed('http://localhost:5000')
            
            # Start Flask server
            print("\n🚀 Starting server...")
            app.run(host='0.0.0.0', port=5000, debug=False)
            
        except ImportError as e:
            print(f"❌ ERROR: Failed to import Flask app: {e}")
            print("💡 Make sure all dependencies are installed:")
            print("   pip install -r requirements.txt")
            sys.exit(1)
            
        except Exception as e:
            print(f"❌ ERROR: Failed to start server: {e}")
            sys.exit(1)
    
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user. Goodbye!")
        sys.exit(0)
    
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        print("💡 Please check the error message above and try again.")
        sys.exit(1)

if __name__ == '__main__':
    main()