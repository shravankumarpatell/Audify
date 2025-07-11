// Global variables
let selectedFile = null;
let processingId = null;
let enhancedFilename = null;
let displayedProgress = 0;
const API_BASE = 'https://audify-vlol.onrender.com'; // Empty string to use same origin as Flask server

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
    // if (!file) return;

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
    if (!selectedFile) return;

    const enhanceBtn = document.getElementById('enhanceBtn');
    const progressContainer = document.getElementById('progressContainer');
    const statusMessage = document.getElementById('statusMessage');

    // Disable button and show progress
    enhanceBtn.disabled = true;
    enhanceBtn.innerHTML = '<span class="spinning">⚙️</span> Processing...';
    progressContainer.style.display = 'block';

    try {
        // Upload file
        const formData = new FormData();
        formData.append('audio', selectedFile);

        const response = await fetch(`${API_BASE}/enhance`, {
            method: 'POST',
            body: formData
        });

        console.log('Response:', response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log('Enhancement result:', result);
            processingId = result.processing_id;
            showStatus('Processing audio...', 'processing');

            // Start polling for status
            pollProcessingStatus();
        } else {
            throw new Error(result.error || 'Upload failed');
        }

    } catch (error) {
        console.error('Error:', error);
        showStatus(`Error: ${error.message}`, 'error');
        resetUI();
    }
}

async function pollProcessingStatus() {
    if (!processingId) return;

    try {
        const response = await fetch(`${API_BASE}/status/${processingId}`);
        const status = await response.json();

        if (status.status === 'completed') {
            console.log('Processing completed:', status);
            handleProcessingComplete(status.result);
        } else if (status.status === 'error') {
            throw new Error(status.error || 'Processing failed');
        } else {
            // Update progress
            updateProgress(status.progress);

            // Continue polling
            setTimeout(pollProcessingStatus, 1000);
        }

    } catch (error) {
        console.error('Error polling status:', error);
        showStatus(`Error: ${error.message}`, 'error');
        resetUI();
    }
}

function handleProcessingComplete(result) {
    console.log('Processing result:', result);
    if (result.success) {
        enhancedFilename = result.output_filename;

        // Show enhanced audio
        const enhancedAudio = document.getElementById('enhancedAudio');
        enhancedAudio.src = `${API_BASE}/download/${enhancedFilename}`;
        console.log('Enhanced audio URL:', enhancedAudio.src);
        document.getElementById('enhancedAudioSection').style.display = 'block';

        // Update duration when loaded
        enhancedAudio.addEventListener('loadedmetadata', () => {
            document.getElementById('enhancedDuration').textContent = formatDuration(enhancedAudio.duration);
        });

        // Show metrics
        // if (result.metrics) {
        //     showMetrics(result.metrics);
        // }

        document.getElementById('resultsSection').style.display = 'block';

        showStatus('Enhancement completed successfully!', 'success');
        updateProgress(100);

    } else {
        throw new Error(result.error || 'Enhancement failed');
    }

    resetUI();
}

function showMetrics(metrics) {
    const metricsGrid = document.getElementById('metricsGrid');
    //     if (!metricsGrid) {
    //     // nothing to do
    //     return;
    //   }
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
        if (metricConfigs[key]) {
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

    // If the new target is lower, just jump
    if (newProgress <= displayedProgress) {
        displayedProgress = newProgress;
        progressFill.style.width = `${displayedProgress}%`;
        progressText.textContent = `Processing... ${displayedProgress}%`;
        return;
    }

    // Otherwise, animate a little at a time
    const start = displayedProgress;
    const end = newProgress;
    const duration = 500;              // total ms to animate between steps
    const stepTime = 20;               // update every 20ms
    const steps = Math.ceil(duration / stepTime);
    const delta = (end - start) / steps;
    let current = start;
    let count = 0;

    const iv = setInterval(() => {
        count++;
        current += delta;
        if (count >= steps) {
            current = end;
            clearInterval(iv);
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

// const player = new Plyr('#player', {
//       controls: ['play', 'progress', 'current-time', 'mute', 'volume']
//     });

function resetUI() {
    const enhanceBtn = document.getElementById('enhanceBtn');
    enhanceBtn.disabled = false;
    enhanceBtn.innerHTML = '<span>🚀</span> Enhance Audio';

    setTimeout(() => {
        document.getElementById('progressContainer').style.display = 'none';
    }, 2000);
}

async function downloadEnhanced() {
    if (!enhancedFilename) return;

    try {
        const response = await fetch(`${API_BASE}/outputs/${enhancedFilename}`);
        if (!response.ok) throw new Error('Download failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = enhancedFilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error('Download error:', error);
        showStatus('Download failed. Please try again.', 'error');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initFileUpload();

    // Test API connection
    fetch(`${API_BASE}/health`)
        .then(response => response.json())
        .then(data => {
            console.log('API connected:', data);
        })
        .catch(error => {
            console.error('API connection error:', error);
            showStatus('Unable to connect to the enhancement server. Please ensure the backend is running.', 'error');
        });
});