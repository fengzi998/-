# 使用官方 Node.js 20 镜像作为基础镜像
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 生成 Prisma Client
RUN npx prisma generate

# 构建 Next.js 应用
RUN npm run build

# 生产运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 更改文件所有者
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["node", "server.js"]
