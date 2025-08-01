#!/bin/bash

# Resilience Solutions - Hetzner Cloud Server Setup Script
# Run this script on your fresh Ubuntu 22.04 Hetzner VPS
# Usage: curl -sSL https://your-repo.com/scripts/setup-server.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}$1${NC}"
}

print_header "🚀 Setting up Hetzner Cloud server for Resilience Solutions"

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
apt install -y curl wget git unzip software-properties-common ufw fail2ban nginx certbot python3-certbot-nginx

# Install Node.js 20
print_status "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 globally
print_status "Installing PM2..."
npm install -g pm2

# Create deploy user
print_status "Creating deploy user..."
if ! id "deploy" &>/dev/null; then
    useradd -m -s /bin/bash deploy
    usermod -aG sudo deploy
    
    # Setup SSH for deploy user
    mkdir -p /home/deploy/.ssh
    chmod 700 /home/deploy/.ssh
    chown deploy:deploy /home/deploy/.ssh
    
    print_warning "Don't forget to add your SSH public key to /home/deploy/.ssh/authorized_keys"
fi

# Configure UFW (firewall)
print_status "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Configure fail2ban
print_status "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s

[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true

[nginx-noproxy]
enabled = true
EOF

systemctl enable fail2ban
systemctl start fail2ban

# Setup NGINX
print_status "Configuring NGINX..."
# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Create basic NGINX configuration
cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
    use epoll;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# Test NGINX configuration
nginx -t

# Install PostgreSQL
print_status "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
print_status "Setting up PostgreSQL database..."
sudo -u postgres psql << 'EOF'
CREATE DATABASE resilience_solutions;
CREATE USER resilience_user WITH ENCRYPTED PASSWORD 'change_this_password';
GRANT ALL PRIVILEGES ON DATABASE resilience_solutions TO resilience_user;
ALTER USER resilience_user CREATEDB;
\q
EOF

# Configure PostgreSQL for remote connections (optional)
print_status "Configuring PostgreSQL..."
PG_VERSION=$(pg_config --version | awk '{print $2}' | cut -d. -f1,2)
PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"

# Allow connections from localhost
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" "$PG_CONFIG_DIR/postgresql.conf"

# Setup log rotation
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/resilience-solutions << 'EOF'
/opt/resilience-solutions/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 deploy deploy
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create application directory
print_status "Creating application directory..."
mkdir -p /opt/resilience-solutions
chown deploy:deploy /opt/resilience-solutions

# Setup environment file template
print_status "Creating environment file template..."
cat > /opt/resilience-solutions/.env.template << 'EOF'
# Copy this to .env and fill in your values
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://resilience_user:change_this_password@localhost:5432/resilience_solutions
SENDGRID_API_KEY=your_sendgrid_api_key_here
ADMIN_EMAIL=danieljuliusstein@gmail.com
FROM_EMAIL=noreply@yourdomain.com
SESSION_SECRET=generate_a_secure_random_string_here
EOF

chown deploy:deploy /opt/resilience-solutions/.env.template

# Enable services
systemctl enable nginx
systemctl enable postgresql

print_header "✅ Server setup completed!"
echo ""
print_status "Next steps:"
echo "1. Add your SSH public key to /home/deploy/.ssh/authorized_keys"
echo "2. Change the PostgreSQL password in the database and .env file"
echo "3. Configure your domain DNS to point to this server"
echo "4. Upload and deploy your application using the deploy script"
echo "5. Set up SSL certificates with: certbot --nginx -d yourdomain.com"
echo ""
print_warning "Important files:"
echo "- Database config: $PG_CONFIG_DIR/postgresql.conf"
echo "- Application directory: /opt/resilience-solutions"
echo "- NGINX config: /etc/nginx/sites-available/"
echo "- Environment template: /opt/resilience-solutions/.env.template"
echo ""
print_status "Server is ready for deployment!"