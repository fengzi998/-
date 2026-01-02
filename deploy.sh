#!/bin/bash

# =================================================================
# 医疗美容 AI 营销 SaaS - 腾讯云轻量应用服务器部署脚本
# =================================================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 root 用户或 sudo 运行此脚本"
        exit 1
    fi
}

# 检查系统类型
check_system() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        log_info "检测到操作系统: $PRETTY_NAME"
    else
        log_error "无法检测操作系统类型"
        exit 1
    fi
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt update && apt upgrade -y
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        yum update -y
    fi
}

# 安装 Docker
install_docker() {
    if command -v docker &> /dev/null; then
        log_info "Docker 已安装，版本: $(docker --version)"
        return
    fi

    log_info "安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
    user -aG docker $USER

    log_info "Docker 安装完成: $(docker --version)"
}

# 安装 Node.js 20
install_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            log_info "Node.js 已安装，版本: $(node -v)"
            return
        fi
    fi

    log_info "安装 Node.js 20..."
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    fi

    log_info "Node.js 安装完成: $(node -v)"
}

# 安装 PM2
install_pm2() {
    if command -v pm2 &> /dev/null; then
        log_info "PM2 已安装"
        return
    fi

    log_info "安装 PM2..."
    npm install -g pm2

    log_info "PM2 安装完成: $(pm2 -v)"
}

# 安装 Nginx
install_nginx() {
    if command -v nginx &> /dev/null; then
        log_info "Nginx 已安装"
        return
    fi

    log_info "安装 Nginx..."
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt install -y nginx
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        yum install -y nginx
    fi

    systemctl start nginx
    systemctl enable nginx

    log_info "Nginx 安装完成"
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."

    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
        log_info "UFW 防火墙配置完成"
    elif command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-port=22/tcp
        firewall-cmd --permanent --add-port=80/tcp
        firewall-cmd --permanent --add-port=443/tcp
        firewall-cmd --reload
        log_info "Firewalld 防火墙配置完成"
    fi
}

# 创建项目目录
setup_project_dir() {
    PROJECT_DIR="/var/www/medical-aesthetic-saas"
    log_info "创建项目目录: $PROJECT_DIR"

    mkdir -p $PROJECT_DIR
    mkdir -p /var/log/pm2

    # 复制项目文件（假设脚本在项目根目录）
    if [ -f "./package.json" ]; then
        log_info "复制项目文件..."
        cp -r . $PROJECT_DIR/
        cd $PROJECT_DIR
    else
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
}

# 安装项目依赖
install_dependencies() {
    log_info "安装项目依赖..."
    cd /var/www/medical-aesthetic-saas

    npm install --legacy-peer-deps
}

# 生成 Prisma Client
generate_prisma() {
    log_info "生成 Prisma Client..."
    cd /var/www/medical-aesthetic-saas

    npx prisma generate
}

# 构建项目
build_project() {
    log_info "构建 Next.js 项目..."
    cd /var/www/medical-aesthetic-saas

    npm run build
}

# 设置环境变量
setup_env() {
    log_info "设置环境变量..."

    if [ ! -f "/var/www/medical-aesthetic-saas/.env.production" ]; then
        log_warn "未找到 .env.production 文件，请手动配置环境变量"
        log_warn "所需环境变量:"
        log_warn "  - DATABASE_URL"
        log_warn "  - COS_SECRET_ID"
        log_warn "  - COS_SECRET_KEY"
        log_warn "  - COS_BUCKET"
        log_warn "  - COS_REGION"
        log_warn "  - DIFY_API_KEY"
        log_warn "  - REPLICATE_API_TOKEN"
    fi
}

# 启动应用（使用 PM2）
start_app() {
    log_info "启动应用..."

    cd /var/www/medical-aesthetic-saas

    # 停止旧进程
    pm2 stop medical-aesthetic-saas 2>/dev/null || true
    pm2 delete medical-aesthetic-saas 2>/dev/null || true

    # 启动新进程
    pm2 start ecosystem.config.js

    # 保存 PM2 配置
    pm2 save

    # 设置开机自启
    pm2 startup systemd -u root --hp /root

    log_info "应用启动成功"
}

# 配置 Nginx
configure_nginx() {
    log_info "配置 Nginx..."

    # 复制 Nginx 配置
    cp /var/www/medical-aesthetic-saas/nginx.conf /etc/nginx/sites-available/medical-aesthetic-saas

    # 创建软链接
    ln -sf /etc/nginx/sites-available/medical-aesthetic-saas /etc/nginx/sites-enabled/

    # 删除默认配置
    rm -f /etc/nginx/sites-enabled/default

    # 测试配置
    nginx -t

    # 重启 Nginx
    systemctl restart nginx

    log_info "Nginx 配置完成"
}

# 设置 SSL 证书（使用 Let's Encrypt）
setup_ssl() {
    read -p "是否配置 SSL 证书？(y/n): " setup_ssl

    if [ "$setup_ssl" = "y" ] || [ "$setup_ssl" = "Y" ]; then
        read -p "请输入您的域名: " domain

        if [ -z "$domain" ]; then
            log_warn "未输入域名，跳过 SSL 配置"
            return
        fi

        log_info "安装 Certbot..."
        if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
            apt install -y certbot python3-certbot-nginx
        elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
            yum install -y certbot python3-certbot-nginx
        fi

        log_info "获取 SSL 证书..."
        certbot --nginx -d $domain

        log_info "配置自动续期..."
        (crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet") | crontab -

        log_info "SSL 证书配置完成"
    fi
}

# 显示部署信息
show_info() {
    echo ""
    log_info "=========================================="
    log_info "部署完成！"
    log_info "=========================================="
    echo ""
    log_info "应用信息:"
    log_info "  - 项目目录: /var/www/medical-aesthetic-saas"
    log_info "  - PM2 状态: pm2 status"
    log_info "  - PM2 日志: pm2 logs"
    log_info "  - Nginx 配置: /etc/nginx/sites-available/medical-aesthetic-saas"
    echo ""
    log_warn "请确保:"
    log_warn "  1. 已配置 .env.production 文件"
    log_warn "  2. 已配置腾讯云数据库连接"
    log_warn "  3. 已配置域名解析（如需要）"
    echo ""
    log_info "常用命令:"
    log_info "  - 查看应用状态: pm2 status"
    log_info "  - 查看应用日志: pm2 logs medical-aesthetic-saas"
    log_info "  - 重启应用: pm2 restart medical-aesthetic-saas"
    log_info "  - 停止应用: pm2 stop medical-aesthetic-saas"
    log_info "  - 重启 Nginx: systemctl restart nginx"
    echo ""
}

# 主函数
main() {
    log_info "开始部署医疗美容 AI 营销 SaaS..."
    echo ""

    check_root
    check_system
    update_system
    install_docker
    install_nodejs
    install_pm2
    install_nginx
    configure_firewall
    setup_project_dir
    install_dependencies
    generate_prisma
    build_project
    setup_env
    start_app
    configure_nginx
    setup_ssl
    show_info

    log_info "部署脚本执行完成！"
}

# 执行主函数
main
