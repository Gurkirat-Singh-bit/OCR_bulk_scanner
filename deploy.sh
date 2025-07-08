#!/bin/bash

# Production deployment script for OCR Scanner

set -e

echo "🚀 Starting OCR Scanner deployment..."

# Configuration
APP_NAME="ocr-scanner"
APP_DIR="/var/www/ocr-scanner"
BACKUP_DIR="/backups"
NGINX_CONF="/etc/nginx/sites-available/ocr-scanner"
SUPERVISOR_CONF="/etc/supervisor/conf.d/ocr-scanner.conf"

# Create backup directory
sudo mkdir -p $BACKUP_DIR

# Function to create backup
create_backup() {
    if [ -d "$APP_DIR" ]; then
        echo "📦 Creating backup..."
        sudo cp -r $APP_DIR $BACKUP_DIR/ocr-scanner-$(date +%Y%m%d-%H%M%S)
    fi
}

# Function to install system dependencies
install_dependencies() {
    echo "📋 Installing system dependencies..."
    sudo apt update
    sudo apt install -y python3 python3-pip python3-venv nginx git curl supervisor
    
    # Install uv package manager
    if ! command -v uv &> /dev/null; then
        curl -LsSf https://astral.sh/uv/install.sh | sh
        source ~/.bashrc
    fi
}

# Function to setup MongoDB
setup_mongodb() {
    echo "🗄️ Setting up MongoDB..."
    if ! command -v mongod &> /dev/null; then
        wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
        sudo apt update
        sudo apt install -y mongodb-org
    fi
    
    sudo systemctl start mongod
    sudo systemctl enable mongod
}

# Function to setup application
setup_application() {
    echo "🐍 Setting up application..."
    
    # Create application directory
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
    
    # Clone or update repository
    if [ ! -d "$APP_DIR/.git" ]; then
        cd $APP_DIR
        git clone https://github.com/your-username/OCR_scanner_script.git .
    else
        cd $APP_DIR
        git pull origin main
    fi
    
    # Create virtual environment and install dependencies
    uv venv --python 3.12
    source .venv/bin/activate
    uv pip install -e .
    
    # Create necessary directories
    mkdir -p static/uploads static/results logs
    sudo chown -R www-data:www-data static logs
}

# Function to configure Nginx
configure_nginx() {
    echo "🌐 Configuring Nginx..."
    
    # Copy Nginx configuration
    sudo cp nginx.conf $NGINX_CONF
    
    # Enable site
    sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
    
    # Remove default site if exists
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
}

# Function to configure Supervisor
configure_supervisor() {
    echo "🔧 Configuring Supervisor..."
    
    # Copy supervisor configuration
    sudo cp supervisor.conf $SUPERVISOR_CONF
    
    # Update and start service
    sudo supervisorctl reread
    sudo supervisorctl update
    sudo supervisorctl start ocr-scanner
}

# Function to setup SSL with Let's Encrypt
setup_ssl() {
    echo "🔒 Setting up SSL certificate..."
    
    read -p "Enter your domain name (e.g., example.com): " DOMAIN
    
    if [ ! -z "$DOMAIN" ]; then
        # Install Certbot
        sudo apt install -y certbot python3-certbot-nginx
        
        # Get SSL certificate
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        # Test auto-renewal
        sudo certbot renew --dry-run
    fi
}

# Function to configure firewall
configure_firewall() {
    echo "🔥 Configuring firewall..."
    
    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
}

# Function to verify deployment
verify_deployment() {
    echo "✅ Verifying deployment..."
    
    sleep 5
    
    if curl -f http://localhost:5000/health; then
        echo "✅ Application is running successfully!"
        echo "🌐 Access your application at: http://your-domain.com"
    else
        echo "❌ Deployment verification failed!"
        exit 1
    fi
}

# Main deployment flow
main() {
    echo "Starting deployment process..."
    
    create_backup
    install_dependencies
    setup_mongodb
    setup_application
    configure_nginx
    configure_supervisor
    configure_firewall
    
    # Ask if user wants to setup SSL
    read -p "Do you want to setup SSL certificate? (y/n): " setup_ssl_choice
    if [ "$setup_ssl_choice" = "y" ]; then
        setup_ssl
    fi
    
    verify_deployment
    
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update your .env file with production values"
    echo "2. Configure your domain DNS to point to this server"
    echo "3. Test the application thoroughly"
    echo "4. Set up monitoring and backups"
}

# Run deployment
main "$@"
