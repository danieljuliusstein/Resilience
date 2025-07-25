#!/bin/bash

# Resilience Solutions - Database Backup Script
# Run this script regularly to backup your PostgreSQL database

set -e

# Configuration
BACKUP_DIR="/opt/backups/resilience-solutions"
DB_NAME="resilience_solutions"
DB_USER="resilience_user"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/resilience_solutions_$TIMESTAMP.sql"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Starting database backup..."

# Create database backup
if pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_FILE"; then
    print_status "Database backup created: $BACKUP_FILE"
    
    # Compress the backup
    gzip "$BACKUP_FILE"
    print_status "Backup compressed: $BACKUP_FILE.gz"
    
    # Remove old backups (older than RETENTION_DAYS)
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
    print_status "Old backups cleaned (older than $RETENTION_DAYS days)"
    
    # Show backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    print_status "Backup size: $BACKUP_SIZE"
    
    echo ""
    print_status "✅ Backup completed successfully!"
    print_status "Backup location: $BACKUP_FILE.gz"
    
else
    print_error "❌ Database backup failed!"
    exit 1
fi

# Optional: Upload to cloud storage (uncomment and configure as needed)
# print_status "Uploading backup to cloud storage..."
# aws s3 cp "$BACKUP_FILE.gz" "s3://your-backup-bucket/resilience-solutions/"
# print_status "Backup uploaded to S3"