#!/bin/bash

# 网站自动部署脚本
# 使用方法：在服务器上运行 ./deploy.sh

echo "🚀 开始部署..."

# 进入项目目录
cd /var/www/my-diary || exit

# 拉取最新代码（如果使用 Git）
if [ -d ".git" ]; then
    echo "📥 拉取最新代码..."
    git pull
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 重启 PM2 应用
echo "🔄 重启应用..."
pm2 restart my-diary || pm2 start npm --name "my-diary" -- start

# 等待几秒
sleep 3

# 检查状态
echo "✅ 检查应用状态..."
pm2 status my-diary

echo "🎉 部署完成！"
echo "📊 查看日志: pm2 logs my-diary"
