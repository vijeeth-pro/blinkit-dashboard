module.exports = {
  apps: [
    {
      name: 'blinkit-backend',
      script: './backend/dist/server.js',
      instances: 1, // Single instance tuned for 1GB RAM AWS Free Tier EC2 (t2.micro / t3.micro)
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
      watch: false,
      max_memory_restart: '300M', // Auto-restart if memory exceeds 300MB
    },
  ],
};
