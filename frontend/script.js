// Configuration - Update this with your backend URL
const CONFIG = {
    // For development: 'http://localhost:5000'
    // For production: 'https://your-backend-domain.com'
    API_BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://audify-vlol.onrender.com',
    
    // Maximum file size (30MB)
    MAX_FILE_SIZE: 30 * 1024 * 1024,
    
    // Supported file types
    SUPPORTED_TYPES: ['audio/wav', 'audio/mpeg', 'audio/flac', 'audio/ogg', 'audio/mp4']
};

// Global variables
let selectedFile = null;
let processingId = null;
let enhancedFilename = null;
let displayedProgress = 0;

// Theme management
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');

    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.textContent = '🌑';
        themeText.textContent = 'Dark Mode';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
        localStorage.setItem('theme', 'dark');
    }
}

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-icon').textContent = '☀️';
        document.getElementById('theme-text').textContent = 'Light Mode';
    }
}

// File upload handling
function initFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('click', e => e.stopPropagation());
    
    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());

    // File selection
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect({ target: { files } });
        }
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!CONFIG.SUPPORTED_TYPES.includes(file.type) && !file.name.match(/\.(wav|mp3|flac|ogg|m4a)$/i)) {
        showStatus('Unsupported file type. Please upload WAV, MP3, FLAC, OGG, or M4A files.', 'error');
        return;
    }

    // Validate file size
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showStatus('File too large. Please upload files smaller than 30MB.', 'error');
        return;
    }

    selectedFile = file;

    // Show file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').style.display = 'flex';

    // Enable enhance button
    document.getElementById('enhanceBtn').disabled = false;

    // Show original audio
    const originalAudio = document.getElementById('originalAudio');
    originalAudio.src = URL.createObjectURL(file);
    document.getElementById('originalAudioSection').style.display = 'block';

    // Update duration when loaded
    originalAudio.addEventListener('loadedmetadata', () => {
        document.getElementById('originalDuration').textContent = formatDuration(originalAudio.duration);
    });

    // Clear any previous status messages
    document.getElementById('statusMessage').style.display = 'none';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Audio enhancement
async function enhanceAudio() {
    displayedProgress = 0;
    updateProgress(0);
    
    if (!selectedFile) {
        showStatus('Please select an audio file first.', 'error');
        return;
    }

    const enhanceBtn = document.getElementById('enhanceBtn');
    const progressContainer = document.getElementById('progressContainer');

    // Disable button and show progress
    enhanceBtn.disabled = true;
    enhanceBtn.innerHTML = '<span class="spinning">⚙️</span> Processing...';
    progressContainer.style.display = 'block';

    try {
        // Upload file
        const formData = new FormData();
        formData.append('audio', selectedFile);

        showStatus('Uploading file...', 'processing');

        const response = await fetch(`${CONFIG.API_BASE_URL}/enhance`, {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type header - let browser set it with boundary for FormData
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            processingId = result.processing_id;
            showStatus('Processing audio...', 'processing');

            // Start polling for status
            pollProcessingStatus();
        } else {
            throw new Error(result.error || 'Upload failed');
        }

    } catch (error) {
        console.error('Enhancement error:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showStatus('Unable to connect to the server. Please check your internet connection and try again.', 'error');
        } else {
            showStatus(`Error: ${error.message}`, 'error');
        }
        
        resetUI();
    }
}

async function pollProcessingStatus() {
    if (!processingId) return;

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/status/${processingId}`);
        
        if (!response.ok) {
            throw new Error(`Status check failed: ${response.status}`);
        }

        const status = await response.json();

        if (status.status === 'completed') {
            handleProcessingComplete(status.result);
        } else if (status.status === 'error') {
            throw new Error(status.error || 'Processing failed');
        } else if (status.status === 'not_found') {
            throw new Error('Processing session not found');
        } else {
            // Update progress
            updateProgress(status.progress || 0);

            // Continue polling
            setTimeout(pollProcessingStatus, 1000);
        }

    } catch (error) {
        console.error('Status polling error:', error);
        showStatus(`Error: ${error.message}`, 'error');
        resetUI();
    }
}

function handleProcessingComplete(result) {
    if (result && result.success) {
        enhancedFilename = result.output_filename;

        // Show enhanced audio
        const enhancedAudio = document.getElementById('enhancedAudio');
        enhancedAudio.src = `${CONFIG.API_BASE_URL}/outputs/${enhancedFilename}`;
        document.getElementById('enhancedAudioSection').style.display = 'block';

        // Update duration when loaded
        enhancedAudio.addEventListener('loadedmetadata', () => {
            document.getElementById('enhancedDuration').textContent = formatDuration(enhancedAudio.duration);
        });

        // Show metrics if available
        if (result.metrics) {
            showMetrics(result.metrics);
        }

        document.getElementById('resultsSection').style.display = 'block';
        showStatus('Enhancement completed successfully!', 'success');
        updateProgress(100);

    } else {
        throw new Error(result?.error || 'Enhancement failed');
    }

    resetUI();
}

function showMetrics(metrics) {
    const metricsGrid = document.getElementById('metricsGrid');
    if (!metricsGrid) return;
    
    metricsGrid.innerHTML = '';

    // Define metric display configurations
    const metricConfigs = {
        'segmental_snr': { label: 'Segmental SNR', unit: 'dB', decimals: 2 },
        'pesq': { label: 'PESQ Score', unit: '', decimals: 2 },
        'stoi': { label: 'STOI Score', unit: '', decimals: 3 },
        'snr': { label: 'SNR', unit: 'dB', decimals: 2 },
        'signal_length': { label: 'Duration', unit: 's', decimals: 2 },
        'signal_rms': { label: 'RMS Level', unit: '', decimals: 4 }
    };

    Object.entries(metrics).forEach(([key, value]) => {
        if (metricConfigs[key] && typeof value === 'number') {
            const config = metricConfigs[key];
            const metricCard = document.createElement('div');
            metricCard.className = 'metric-card';
            metricCard.innerHTML = `
                <div class="metric-value">${value.toFixed(config.decimals)}${config.unit}</div>
                <div class="metric-label">${config.label}</div>
            `;
            metricsGrid.appendChild(metricCard);
        }
    });

    document.getElementById('metricsSection').style.display = 'block';
}

function updateProgress(newProgress) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    // Ensure progress is within bounds
    newProgress = Math.max(0, Math.min(100, newProgress));

    // If the new target is lower, just jump
    if (newProgress <= displayedProgress) {
        displayedProgress = newProgress;
        progressFill.style.width = `${displayedProgress}%`;
        progressText.textContent = `Processing... ${displayedProgress}%`;
        return;
    }

    // Otherwise, animate smoothly
    const start = displayedProgress;
    const end = newProgress;
    const duration = 500;
    const stepTime = 20;
    const steps = Math.ceil(duration / stepTime);
    const delta = (end - start) / steps;
    let current = start;
    let count = 0;

    const interval = setInterval(() => {
        count++;
        current += delta;
        if (count >= steps) {
            current = end;
            clearInterval(interval);
        }
        displayedProgress = Math.round(current);
        progressFill.style.width = `${displayedProgress}%`;
        progressText.textContent = `Processing... ${displayedProgress}%`;
    }, stepTime);
}

function showStatus(message, type) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.style.display = 'block';
}

function resetUI() {
    const enhanceBtn = document.getElementById('enhanceBtn');
    enhanceBtn.disabled = false;
    enhanceBtn.innerHTML = '<span>🚀</span> Enhance Audio';

    setTimeout(() => {
        document.getElementById('progressContainer').style.display = 'none';
    }, 2000);
}

async function downloadEnhanced() {
    if (!enhancedFilename) {
        showStatus('No enhanced audio available for download.', 'error');
        return;
    }

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/outputs/${enhancedFilename}`);
        
        if (!response.ok) {
            throw new Error('Download failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = enhancedFilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showStatus('Download completed successfully!', 'success');

    } catch (error) {
        console.error('Download error:', error);
        showStatus('Download failed. Please try again.', 'error');
    }
}

// API health check
async function checkAPIHealth() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('API Health Check:', data);
            
            if (!data.model_loaded) {
                showStatus('Backend model not loaded. Please ensure the AI model is properly trained and available.', 'error');
            }
        } else {
            throw new Error(`Health check failed: ${response.status}`);
        }
    } catch (error) {
        console.error('API Health Check Error:', error);
        showStatus('Unable to connect to the enhancement server. Please check if the backend is running.', 'error');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initFileUpload();
    
    // Check API health
    checkAPIHealth();
    
    console.log('Audify Frontend Initialized');
    console.log('API Base URL:', CONFIG.API_BASE_URL);
});