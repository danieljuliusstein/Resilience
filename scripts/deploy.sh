#!/bin/bash

# Resilience Solutions - Hetzner Cloud Deployment Script
# Usage: ./scripts/deploy.sh [server-ip] [ssh-key-path]

set -e

# Configuration
SERVER_IP=${1:-"your-server-ip"}
SSH_KEY=${2:-"~/.ssh/id_rsa"}
PROJECT_NAME="resilience-solutions"
DEPLOY_USER="deploy"
APP_DIR="/opt/resilience-solutions"

echo "🚀 Starting deployment to Hetzner Cloud..."
echo "Server: $SERVER_IP"
echo "SSH Key: $SSH_KEY"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if server IP is provided
if [ "$SERVER_IP" = "your-server-ip" ]; then
    print_error "Please provide your server IP address"
    echo "Usage: ./scripts/deploy.sh [server-ip] [ssh-key-path]"
    exit 1
fi

# Create deployment archive
print_status "Creating deployment archive..."
npm run build
tar -czf resilience-solutions.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log \
    --exclude=logs \
    --exclude=.env \
    --exclude=.env.* \
    dist package*.json ecosystem.config.js nginx.conf Dockerfile .env.production.template

# Upload to server
print_status "Uploading application to server..."
scp -i "$SSH_KEY" resilience-solutions.tar.gz "$DEPLOY_USER@$SERVER_IP:/tmp/"

# Deploy on server
print_status "Deploying application on server..."
ssh -i "$SSH_KEY" "$DEPLOY_USER@$SERVER_IP" << 'EOF'
set -e

# Create application directory
sudo mkdir -p /opt/resilience-solutions
cd /opt/resilience-solutions

# Extract application
sudo tar -xzf /tmp/resilience-solutions.tar.gz -C /opt/resilience-solutions --strip-components=0
sudo chown -R deploy:deploy /opt/resilience-solutions

# Install dependencies
npm ci --only=production

# Setup PM2 if not already running
if ! pm2 list | grep -q "resilience-solutions"; then
    pm2 start ecosystem.config.js
else
    pm2 reload ecosystem.config.js
fi

# Save PM2 configuration
pm2 save
pm2 startup systemd -u deploy --hp /home/deploy

# Setup NGINX configuration (if not already configured)
if [ ! -f /etc/nginx/sites-available/resilience-solutions ]; then
    sudo cp nginx.conf /etc/nginx/sites-available/resilience-solutions
    sudo ln -sf /etc/nginx/sites-available/resilience-solutions /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
fi

# Create logs directory
mkdir -p logs

echo "✅ Deployment completed successfully!"
EOF

# Cleanup
rm resilience-solutions.tar.gz

print_status "Deployment completed! Your application should be running on https://$SERVER_IP"
print_warning "Don't forget to:"
print_warning "1. Configure your .env file on the server"
print_warning "2. Set up SSL certificates"
print_warning "3. Configure your database connection"
print_warning "4. Test the email integration"

echo ""
echo "To check application status:"
echo "ssh -i $SSH_KEY $DEPLOY_USER@$SERVER_IP 'pm2 status'"
echo ""
echo "To view logs:"
echo "ssh -i $SSH_KEY $DEPLOY_USER@$SERVER_IP 'pm2 logs resilience-solutions'"