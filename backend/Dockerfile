# Use an official Python runtime (3.10) as a parent image
FROM python:3.10-slim

# Set environment variables to reduce Python output
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    FLASK_ENV=production

# Create and switch to the app directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    libnss-systemd \
 && rm -rf /var/lib/apt/lists/*

# Copy requirements before code (leverages Docker cache)
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy backend code into container
COPY . ./

# Create necessary directories
RUN mkdir -p temp outputs models

# Expose Flask default port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/health')" || exit 1

# Launch the app via gunicorn for production