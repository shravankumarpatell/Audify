# Audify Deployment Guide

This directory contains deployment configurations for both frontend and backend services.

## Deployment Options

### 1. Docker Compose (Recommended for Development)

```bash
# Start both services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 2. Separate Deployments (Production)

#### Backend Deployment Options:

**Heroku:**
```bash
# In backend directory
heroku create your-audify-backend
git subtree push --prefix=backend heroku main
```

**Railway:**
```bash
# Connect your GitHub repo and deploy backend folder
```

**Render:**
```bash
# Create new web service, connect repo, set build/start commands
```

**DigitalOcean App Platform:**
```bash
# Create app, connect repo, configure backend service
```

#### Frontend Deployment Options:

**Netlify:**
```bash
# Drag and drop frontend folder to Netlify dashboard
# Or connect GitHub repo with build settings:
# Build command: echo "Static site"
# Publish directory: frontend
```

**Vercel:**
```bash
# In frontend directory
vercel --prod
```

**GitHub Pages:**
```bash
# Push frontend folder to gh-pages branch
```

**Cloudflare Pages:**
```bash
# Connect GitHub repo, set build output to frontend folder
```

### 3. Manual Server Deployment

#### Backend on Ubuntu/CentOS:

```bash
# Install dependencies
sudo apt update
sudo apt install python3 python3-pip nginx

# Clone and setup
git clone your-repo
cd audify/backend
pip3 install -r requirements.txt

# Train model
python3 train.py

# Start with gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 2 app:app

# Setup systemd service (optional)
sudo cp audify-backend.service /etc/systemd/system/
sudo systemctl enable audify-backend
sudo systemctl start audify-backend
```

#### Frontend on CDN/Static Host:

```bash
# Upload frontend folder contents to:
# - AWS S3 + CloudFront
# - Google Cloud Storage
# - Azure Blob Storage
# - Any static hosting service
```

## Environment Configuration

### Backend Environment Variables:
```bash
FLASK_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Frontend Configuration:
Update `CONFIG.API_BASE_URL` in `script.js`:
```javascript
API_BASE_URL: 'https://your-backend-domain.com'
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Using Cloudflare:
1. Add your domain to Cloudflare
2. Enable "Full (strict)" SSL mode
3. Enable "Always Use HTTPS"

## Monitoring and Logging

### Health Checks:
- Backend: `GET /health`
- Frontend: `GET /health` (nginx)

### Log Locations:
- Backend: `/var/log/audify/backend.log`
- Frontend: `/var/log/nginx/access.log`

## Scaling Considerations

### Backend Scaling:
- Use multiple gunicorn workers
- Implement Redis for session storage
- Add load balancer (nginx/HAProxy)
- Use container orchestration (Kubernetes)

### Frontend Scaling:
- Use CDN for static assets
- Enable gzip compression
- Implement caching headers
- Use multiple edge locations

## Security Checklist

- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] File upload limits set
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] Database credentials protected (if applicable)
- [ ] Regular security updates