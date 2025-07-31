module.exports = {
  apps: [{
    name: 'resilience-solutions',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Restart policy
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',
    
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Monitoring
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git'],
    
    // Advanced settings
    kill_timeout: 5000,
    listen_timeout: 8000,
    wait_ready: true
  }]
};