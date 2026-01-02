#!/bin/bash

# =================================================================
# 医疗美容 AI 营销 SaaS - 腾讯云轻量应用服务器部署脚本（简化版）
# 使用 PM2 直接运行 Next.js
# =================================================================

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 项目配置
PROJECT_DIR="/var/www/medical-aesthetic-saas"
REPO_URL="https://github.com/fengzi998/-.git"  # 替换为您的仓库地址

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
    log_error "请使用 root 用户或 sudo 运行"
    exit 1
fi

# 1. 安装系统依赖
log_info "步骤 1: 安装系统依赖..."
apt update
apt install -y curl git nginx

# 2. 安装 Node.js 20
log_info "步骤 2: 安装 Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
node -v && npm -v

# 3. 安装 PM2
log_info "步骤 3: 安装 PM2..."
npm install -g pm2

# 4. 克隆项目
log_info "步骤 4: 克隆项目..."
if [ -d "$PROJECT_DIR" ]; then
    log_warn "项目目录已存在，更新代码..."
    cd $PROJECT_DIR
    git pull origin main
else
    mkdir -p $PROJECT_DIR
    git clone $REPO_URL $PROJECT_DIR
    cd $PROJECT_DIR
fi

# 5. 安装项目依赖
log_info "步骤 5: 安装项目依赖..."
cd $PROJECT_DIR
npm install --legacy-peer-deps

# 6. 配置环境变量
log_info "步骤 6: 配置环境变量..."
if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    log_warn "未找到 .env.production，请手动创建并配置以下环境变量:"
    log_warn "  DATABASE_URL, COS_SECRET_ID, COS_SECRET_KEY, COS_BUCKET"
    log_warn "  COS_REGION, DIFY_API_KEY, REPLICATE_API_TOKEN"
    read -p "按 Enter 继续..."
fi

# 7. 生成 Prisma Client
log_info "步骤 7: 生成 Prisma Client..."
cd $PROJECT_DIR
npx prisma generate

# 8. 构建项目
log_info "步骤 8: 构建 Next.js 项目..."
cd $PROJECT_DIR
npm run build

# 9. 启动应用
log_info "步骤 9: 启动应用..."
cd $PROJECT_DIR

# 停止旧进程
pm2 stop medical-aesthetic-saas 2>/dev/null || true
pm2 delete medical-aesthetic-saas 2>/dev/null || true

# 启动新进程
pm2 start npm --name "medical-aesthetic-saas" -- start

# 保存 PM2 配置
pm2 save
pm2 startup systemd -u root --hp /root

# 10. 配置 Nginx
log_info "步骤 10: 配置 Nginx..."
cat > /etc/nginx/sites-available/medical-aesthetic-saas << 'EOF'
server {
    listen 80;
    server_name _;

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
EOF

ln -sf /etc/nginx/sites-available/medical-aesthetic-saas /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 11. 配置防火墙
log_info "步骤 11: 配置防火墙..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
fi

# 完成
echo ""
log_info "=========================================="
log_info "部署完成！"
log_info "=========================================="
echo ""
log_info "访问地址: http://$(curl -s ifconfig.me)"
log_info "项目目录: $PROJECT_DIR"
echo ""
log_info "常用命令:"
log_info "  查看状态: pm2 status"
log_info "  查看日志: pm2 logs medical-aesthetic-saas"
log_info "  重启应用: pm2 restart medical-aesthetic-saas"
log_info "  更新代码: cd $PROJECT_DIR && git pull && npm run build && pm2 restart medical-aesthetic-saas"
echo ""
