module.exports = {
  apps: [
    {
      name: 'susu',
      script: 'backend/app.js',
      cwd: '/www/susu',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
}
