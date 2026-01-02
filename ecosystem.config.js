// PM2 生态系统配置文件
// 用于管理 Next.js 应用的进程

module.exports = {
  apps: [
    {
      name: 'medical-aesthetic-saas',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/medical-aesthetic-saas',
      instances: 1, // 可以设置为 'max' 来使用所有 CPU 核心
      exec_mode: 'cluster', // 使用 cluster 模式
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/medical-aesthetic-saas-error.log',
      out_file: '/var/log/pm2/medical-aesthetic-saas-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
