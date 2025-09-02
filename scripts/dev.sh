#!/bin/bash

# LinkedIn Recruiter Assistant 开发模式启动脚本

echo "🚀 启动 LinkedIn Recruiter Assistant 开发模式..."

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动开发模式
echo "🔧 启动开发模式..."
echo "📝 修改代码后会自动重新构建"
echo "🔄 按 Ctrl+C 停止开发服务器"
echo ""

npm run dev
