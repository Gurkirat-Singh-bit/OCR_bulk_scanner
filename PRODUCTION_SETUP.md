# 🚀 Production Deployment Quick Guide

## 🎯 Quick VPS Deployment

### 1. One-Command Deployment
```bash
# Run the automated deployment script
sudo ./deploy.sh
```

### 2. Manual Setup (if needed)

#### Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3 python3-pip python3-venv nginx git curl supervisor
```

#### MongoDB Setup
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Application Setup
```bash
# Create app directory
sudo mkdir -p /var/www/ocr-scanner
sudo chown $USER:$USER /var/www/ocr-scanner
cd /var/www/ocr-scanner

# Clone repository
git clone https://github.com/your-username/OCR_scanner_script.git .

# Install uv and dependencies
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc
uv venv --python 3.12
source .venv/bin/activate
uv pip install -e .
uv pip install -e ".[production]"  # Install production dependencies
```

#### Configuration
```bash
# Copy production environment
cp .env.production .env
# Edit .env with your actual values:
# - GEMINI_API_KEY
# - SECRET_KEY
# - Domain settings
```

#### Nginx Configuration
```bash
# Copy and enable site
sudo cp nginx.conf /etc/nginx/sites-available/ocr-scanner
sudo ln -s /etc/nginx/sites-available/ocr-scanner /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

#### Supervisor Configuration
```bash
# Setup process management
sudo cp supervisor.conf /etc/supervisor/conf.d/ocr-scanner.conf
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start ocr-scanner
```

#### SSL Certificate
```bash
# Install Certbot and get SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 🔄 Using Docker (Alternative)

### Docker Compose Deployment
```bash
# Set environment variables
export GEMINI_API_KEY=your-key-here
export SECRET_KEY=your-secret-key-here

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f web
```

## 📊 Production Features Enabled

✅ Environment-based configuration  
✅ Production logging with rotation  
✅ Security headers and validation  
✅ Database connection pooling  
✅ Health check endpoints  
✅ System metrics monitoring  
✅ File size and type validation  
✅ Error handling and recovery  
✅ SSL/HTTPS support  
✅ Process management with Supervisor  

## 🔧 Environment Variables

```env
# Required
GEMINI_API_KEY=your-gemini-api-key
SECRET_KEY=your-secure-secret-key

# Optional (with defaults)
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DATABASE=visiting_card_production
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5000
```

## 📋 Post-Deployment Checklist

- [ ] Application responds at http://your-domain.com/health
- [ ] SSL certificate is working (HTTPS)
- [ ] File uploads work correctly
- [ ] MongoDB is storing data
- [ ] Logs are being written
- [ ] Monitoring is active
- [ ] Backups are configured

## 🚨 Troubleshooting

### Check Service Status
```bash
sudo systemctl status nginx
sudo systemctl status mongod
sudo supervisorctl status ocr-scanner
```

### View Logs
```bash
sudo tail -f /var/log/ocr-scanner.log
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u mongod -f
```

### Restart Services
```bash
sudo supervisorctl restart ocr-scanner
sudo systemctl restart nginx
sudo systemctl restart mongod
```

## 📞 Support

For issues or questions:
1. Check the logs first
2. Verify all services are running
3. Test the health endpoint: `curl http://localhost:5000/health`
4. Check system resources: `htop`, `df -h`

---

🎉 **Your OCR Scanner is now production-ready!**
