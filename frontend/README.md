# Audify Frontend

This is the frontend application for Audify AI Speech Enhancement tool.

## Features

- Modern, responsive web interface
- Drag & drop file upload
- Real-time processing progress
- Audio playback and comparison
- Quality metrics display
- Dark/Light theme toggle

## Setup

### Development
```bash
# Serve locally using Python
python -m http.server 3000

# Or using Node.js (if you have it installed)
npx serve . -p 3000
```

### Production Deployment

#### Option 1: Static Hosting (Netlify, Vercel, GitHub Pages)
1. Upload the `frontend` folder contents to your static hosting service
2. Update the `API_BASE_URL` in `script.js` to point to your backend URL
3. Deploy

#### Option 2: CDN Deployment
1. Upload files to your CDN
2. Configure CORS on your backend to allow requests from your frontend domain
3. Update API configuration

## Configuration

Update the `CONFIG` object in `script.js`:

```javascript
const CONFIG = {
    // Update this with your backend URL
    API_BASE_URL: 'https://your-backend-domain.com',
    MAX_FILE_SIZE: 30 * 1024 * 1024, // 30MB
    SUPPORTED_TYPES: ['audio/wav', 'audio/mpeg', 'audio/flac', 'audio/ogg', 'audio/mp4']
};
```

## File Structure

```
frontend/
├── index.html          # Main HTML file
├── style.css          # Styles and themes
├── script.js          # Frontend logic and API calls
├── package.json       # Project metadata
└── README.md          # This file
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## API Integration

The frontend communicates with the backend through these endpoints:

- `GET /health` - Check backend status
- `POST /enhance` - Upload audio for enhancement
- `GET /status/{id}` - Check processing status
- `GET /outputs/{filename}` - Download enhanced audio