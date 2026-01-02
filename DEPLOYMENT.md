# 腾讯云轻量应用服务器部署指南

## 目录
- [准备工作](#准备工作)
- [方案一：自动化部署脚本（推荐）](#方案一自动化部署脚本推荐)
- [方案二：手动部署](#方案二手动部署)
- [方案三：Docker 部署](#方案三docker-部署)
- [部署后配置](#部署后配置)
- [常见问题](#常见问题)

---

## 准备工作

### 1. 购买腾讯云轻量应用服务器

**推荐配置：**
- **CPU**: 2核或以上
- **内存**: 4GB 或以上
- **存储**: 40GB SSD 或以上
- **操作系统**: Ubuntu 22.04 LTS
- **带宽**: 5Mbps 或以上

**购买地址**: https://cloud.tencent.com/product/lighthouse

### 2. 配置安全组

在腾讯云控制台配置防火墙规则，开放以下端口：
- **22** - SSH 连接
- **80** - HTTP
- **443** - HTTPS
- **3000** - Next.js 开发端口（可选，用于测试）

### 3. 准备环境变量

创建 `.env.production` 文件，配置以下环境变量：

```env
# 腾讯云 MySQL 数据库
DATABASE_URL="mysql://username:password@host:port/database"

# 腾讯云 COS 对象存储
COS_SECRET_ID="your-secret-id"
COS_SECRET_KEY="your-secret-key"
COS_BUCKET="your-bucket-name"
COS_REGION="ap-guangzhou"
COS_DOMAIN="https://your-bucket.cos.ap-guangzhou.myqcloud.com"

# Dify API
DIFY_API_KEY="your-dify-api-key"
DIFY_API_URL="https://api.dify.ai/v1"

# Replicate API
REPLICATE_API_TOKEN="your-replicate-token"

# 应用配置
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

---

## 方案一：自动化部署脚本（推荐）

### 步骤 1: 连接到服务器

```bash
# 使用 SSH 连接到服务器
ssh root@your-server-ip

# 或使用腾讯云控制台的 Web Shell
```

### 步骤 2: 下载并运行部署脚本

```bash
# 克隆项目
git clone https://github.com/fengzi998/-.git
cd -/my-app

# 赋予执行权限
chmod +x deploy-simple.sh

# 运行部署脚本
sudo ./deploy-simple.sh
```

### 步骤 3: 配置环境变量

```bash
# 在服务器上创建生产环境变量文件
sudo nano /var/www/medical-aesthetic-saas/.env.production

# 粘贴您的环境变量，按 Ctrl+X, Y, Enter 保存
```

### 步骤 4: 重启应用

```bash
# 重启 PM2 应用
pm2 restart medical-aesthetic-saas

# 检查状态
pm2 status
pm2 logs medical-aesthetic-saas
```

### 步骤 5: 访问应用

在浏览器中访问：`http://your-server-ip`

---

## 方案二：手动部署

### 步骤 1: 更新系统并安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl git nginx build-essential
```

### 步骤 2: 安装 Node.js 20

```bash
# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 安装 Node.js
sudo apt install -y nodejs

# 验证安装
node -v  # 应显示 v20.x.x
npm -v
```

### 步骤 3: 安装 PM2

```bash
sudo npm install -g pm2

# 验证安装
pm2 -v
```

### 步骤 4: 克隆项目

```bash
# 创建项目目录
sudo mkdir -p /var/www/medical-aesthetic-saas

# 克隆项目
cd /var/www
sudo git clone https://github.com/fengzi998/-.git medical-aesthetic-saas
cd medical-aesthetic-saas
```

### 步骤 5: 安装项目依赖

```bash
# 安装依赖
sudo npm install --legacy-peer-deps

# 生成 Prisma Client
sudo npx prisma generate

# 构建项目
sudo npm run build
```

### 步骤 6: 配置环境变量

```bash
# 创建生产环境变量文件
sudo nano .env.production

# 添加环境变量（参考准备工作的环境变量列表）
```

### 步骤 7: 使用 PM2 启动应用

```bash
# 启动应用
sudo pm2 start npm --name "medical-aesthetic-saas" -- start

# 保存 PM2 配置
sudo pm2 save

# 设置开机自启
sudo pm2 startup systemd -u root --hp /root
```

### 步骤 8: 配置 Nginx 反向代理

```bash
# 创建 Nginx 配置文件
sudo nano /etc/nginx/sites-available/medical-aesthetic-saas
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为您的域名

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;
    }
}
```

启用配置：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/medical-aesthetic-saas /etc/nginx/sites-enabled/

# 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

## 方案三：Docker 部署

### 步骤 1: 安装 Docker

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
```

### 步骤 2: 克隆项目

```bash
cd /var/www
sudo git clone https://github.com/fengzi998/-.git medical-aesthetic-saas
cd medical-aesthetic-saas
```

### 步骤 3: 创建环境变量文件

```bash
sudo nano .env.production
# 添加环境变量
```

### 步骤 4: 修改 next.config.mjs

为了使用 standalone 输出，需要修改 `next.config.mjs`：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // 添加这行
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.tencentyun.com',
      },
    ],
  },
};

export default nextConfig;
```

### 步骤 5: 构建并运行 Docker 容器

```bash
# 构建镜像
sudo docker build -t medical-aesthetic-saas .

# 运行容器
sudo docker run -d \
  --name medical-aesthetic-saas \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  medical-aesthetic-saas
```

### 步骤 6: 配置 Nginx

参考方案二的 Nginx 配置步骤。

---

## 部署后配置

### 1. 配置 SSL 证书（使用 Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 配置自动续期
sudo crontab -e
# 添加以下行：
0 0 * * * certbot renew --quiet
```

### 2. 配置域名解析

在腾讯云 DNS 控制台添加 A 记录：
- **主机记录**: @ 或 www
- **记录类型**: A
- **记录值**: 您的服务器 IP

### 3. 测试部署

```bash
# 检查应用状态
pm2 status

# 查看应用日志
pm2 logs medical-aesthetic-saas

# 检查 Nginx 状态
sudo systemctl status nginx

# 测试 API
curl http://localhost:3000/api/health
```

---

## 常见问题

### Q1: PM2 进程崩溃重启

```bash
# 查看错误日志
pm2 logs medical-aesthetic-saas --err

# 检查环境变量是否配置正确
cat /var/www/medical-aesthetic-saas/.env.production

# 重启应用
pm2 restart medical-aesthetic-saas
```

### Q2: Nginx 502 错误

```bash
# 检查 Next.js 应用是否运行
pm2 status

# 检查端口 3000 是否被占用
sudo netstat -tlnp | grep 3000

# 重启应用和 Nginx
pm2 restart medical-aesthetic-saas
sudo systemctl restart nginx
```

### Q3: 数据库连接失败

```bash
# 检查环境变量
cat /var/www/medical-aesthetic-saas/.env.production | grep DATABASE_URL

# 测试数据库连接
mysql -h your-host -u your-user -p your-database

# 检查腾讯云安全组是否开放 3306 端口
```

### Q4: 更新应用代码

```bash
# 进入项目目录
cd /var/www/medical-aesthetic-saas

# 拉取最新代码
sudo git pull origin main

# 安装新依赖
sudo npm install --legacy-peer-deps

# 重新构建
sudo npm run build

# 重启应用
pm2 restart medical-aesthetic-saas
```

### Q5: 查看应用日志

```bash
# PM2 日志
pm2 logs medical-aesthetic-saas

# Nginx 日志
sudo tail -f /var/log/nginx/nextjs_access.log
sudo tail -f /var/log/nginx/nextjs_error.log
```

---

## 监控和维护

### 1. 设置监控告警

推荐使用腾讯云云监控服务：
- 配置 CPU、内存、磁盘使用率告警
- 配置应用存活监控

### 2. 定期备份

```bash
# 数据库备份脚本
mysqldump -h your-host -u your-user -p your-database > backup_$(date +%Y%m%d).sql

# 备份到 COS
# 可以使用腾讯云的 rclone 工具
```

### 3. 日志轮转

```bash
# 安装 logrotate
sudo apt install -y logrotate

# 配置 PM2 日志轮转
sudo nano /etc/logrotate.d/pm2
```

添加内容：

```
/var/log/pm2/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 root root
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 成本估算

### 腾讯云轻量应用服务器（月付）
- **2核4GB**: 约 ¥50-70/月
- **4核8GB**: 约 ¥100-150/月

### 其他服务
- **COS 对象存储**: 按使用量计费，约 ¥0.1/GB/月
- **MySQL 数据库**: 自建免费，使用云数据库约 ¥200-500/月

**总成本**: 约 ¥50-200/月（中小规模）

---

## 技术支持

如有问题，请参考：
- [Next.js 文档](https://nextjs.org/docs)
- [PM2 文档](https://pm2.keymetrics.io/docs)
- [腾讯云文档](https://cloud.tencent.com/document/product)
