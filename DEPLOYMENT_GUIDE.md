# Resilience Solutions - Hetzner Cloud Deployment Guide

This guide will help you deploy your Resilience Solutions project to Hetzner Cloud with PostgreSQL database and SendGrid email integration.

## Prerequisites

- Hetzner Cloud account
- Domain name (optional, but recommended)
- SendGrid account and API key
- SSH key pair for server access

## Step 1: Provision Hetzner Cloud VPS

1. **Create a new server:**
   - OS: Ubuntu 22.04 LTS
   - Type: CPX11 (2 vCPU, 4 GB RAM) or larger
   - Location: Choose closest to your users
   - SSH Key: Add your public SSH key

2. **Note down the server IP address**

## Step 2: Initial Server Setup

Run the automated setup script on your server:

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Download and run the setup script
curl -sSL https://raw.githubusercontent.com/your-repo/main/scripts/setup-server.sh | bash
```

Or manually run the setup script:

```bash
# Upload the setup script
scp scripts/setup-server.sh root@YOUR_SERVER_IP:/tmp/
ssh root@YOUR_SERVER_IP 'chmod +x /tmp/setup-server.sh && /tmp/setup-server.sh'
```

This script will:
- Update the system
- Install Node.js 20, PM2, NGINX, PostgreSQL
- Configure firewall (UFW) and fail2ban
- Create a deploy user
- Set up basic security

## Step 3: Configure SSH Access

```bash
# Add your SSH public key to the deploy user
ssh root@YOUR_SERVER_IP
sudo -u deploy mkdir -p /home/deploy/.ssh
sudo -u deploy chmod 700 /home/deploy/.ssh
echo "YOUR_PUBLIC_SSH_KEY" | sudo -u deploy tee /home/deploy/.ssh/authorized_keys
sudo -u deploy chmod 600 /home/deploy/.ssh/authorized_keys
```

## Step 4: Configure Database

```bash
# SSH as deploy user
ssh deploy@YOUR_SERVER_IP

# Connect to PostgreSQL and change the password
sudo -u postgres psql
\password resilience_user
# Enter a strong password when prompted
\q
```

## Step 5: Configure Environment Variables

```bash
# Create production environment file
cd /opt/resilience-solutions
cp .env.template .env
nano .env
```

Fill in your environment variables:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://resilience_user:YOUR_DB_PASSWORD@localhost:5432/resilience_solutions
SENDGRID_API_KEY=your_sendgrid_api_key_here
ADMIN_EMAIL=danieljuliusstein@gmail.com
FROM_EMAIL=noreply@yourdomain.com
SESSION_SECRET=generate_a_very_long_random_string_here
```

## Step 6: Deploy Your Application

From your local machine, run the deployment script:

```bash
# Make the deploy script executable
chmod +x scripts/deploy.sh

# Deploy to your server
./scripts/deploy.sh YOUR_SERVER_IP ~/.ssh/id_rsa
```

This will:
- Build your application locally
- Upload it to the server
- Install dependencies
- Start the application with PM2

## Step 7: Configure NGINX and Domain

### If you have a domain:

```bash
# SSH into your server
ssh deploy@YOUR_SERVER_IP

# Edit the NGINX configuration
sudo nano /etc/nginx/sites-available/resilience-solutions

# Update server_name with your domain
server_name yourdomain.com www.yourdomain.com;

# Test and reload NGINX
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### If using IP address only:

```bash
# Create a simple NGINX config for IP access
sudo tee /etc/nginx/sites-available/resilience-solutions << 'EOF'
server {
    listen 80;
    server_name YOUR_SERVER_IP;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/resilience-solutions /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Step 8: Run Database Migration

```bash
# SSH into your server
ssh deploy@YOUR_SERVER_IP
cd /opt/resilience-solutions

# Run database migration
npm run db:push
```

## Step 9: Test Your Application

1. **Visit your website:**
   - With domain: `https://yourdomain.com`
   - With IP: `http://YOUR_SERVER_IP`

2. **Test email functionality:**
   - Fill out a contact form
   - Check if emails are received at danieljuliusstein@gmail.com

3. **Test admin panel:**
   - Access the admin features
   - Verify database connectivity

## Step 10: Setup Monitoring and Backups

### Setup automatic database backups:

```bash
# Make backup script executable
chmod +x /opt/resilience-solutions/scripts/backup-database.sh

# Test the backup
/opt/resilience-solutions/scripts/backup-database.sh

# Setup daily backups via cron
crontab -e
# Add this line for daily backup at 2 AM:
0 2 * * * /opt/resilience-solutions/scripts/backup-database.sh
```

### Monitor your application:

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs resilience-solutions

# Monitor system resources
htop
```

## Useful Commands

### Application Management:

```bash
# Restart application
pm2 restart resilience-solutions

# View application logs
pm2 logs resilience-solutions --lines 100

# Stop application
pm2 stop resilience-solutions

# Start application
pm2 start resilience-solutions
```

### Database Management:

```bash
# Connect to database
psql -U resilience_user -d resilience_solutions -h localhost

# Backup database manually
pg_dump -U resilience_user -h localhost resilience_solutions > backup.sql

# Restore database
psql -U resilience_user -h localhost resilience_solutions < backup.sql
```

### Server Management:

```bash
# Check NGINX status
sudo systemctl status nginx

# Reload NGINX
sudo systemctl reload nginx

# Check UFW firewall status
sudo ufw status

# View system logs
sudo journalctl -u nginx -f
```

## Security Recommendations

1. **Regular Updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Monitor fail2ban:**
   ```bash
   sudo fail2ban-client status
   sudo fail2ban-client status sshd
   ```

3. **Setup log rotation:**
   - Already configured in setup script
   - Logs are rotated daily and compressed

4. **Database Security:**
   - Use strong passwords
   - Consider restricting PostgreSQL to local connections only
   - Regular backups

5. **SSL/HTTPS:**
   - Always use SSL certificates (Let's Encrypt via certbot)
   - Force HTTPS redirects

## Troubleshooting

### Application won't start:
```bash
# Check PM2 logs
pm2 logs resilience-solutions

# Check environment variables
pm2 env resilience-solutions

# Restart PM2
pm2 restart resilience-solutions
```

### Database connection issues:
```bash
# Test database connection
psql -U resilience_user -d resilience_solutions -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo journalctl -u postgresql -f
```

### Email not working:
- Verify SENDGRID_API_KEY is correct
- Check SendGrid dashboard for delivery status
- Verify FROM_EMAIL is configured in SendGrid

### NGINX issues:
```bash
# Test NGINX configuration
sudo nginx -t

# Check NGINX logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Support

If you encounter issues:
1. Check the logs first (`pm2 logs`, nginx logs, system logs)
2. Verify all environment variables are set correctly
3. Ensure all services are running (`pm2 status`, `systemctl status nginx postgresql`)
4. Check firewall settings (`sudo ufw status`)

Your Resilience Solutions application should now be fully deployed and running on Hetzner Cloud!