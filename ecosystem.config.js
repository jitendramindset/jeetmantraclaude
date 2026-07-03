module.exports = {
  apps: [
    {
      name: 'jeetmantra-api',
      script: 'backend/server.js',
      cwd: __dirname,
      instances: 'max',          // cluster mode — one worker per CPU core
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      // Restart policy
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      // Logging
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-err.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 8000,
      // Zero-downtime reload
      wait_ready: true,
      // Source maps (for better error traces)
      source_map_support: false,
    },
  ],
};
