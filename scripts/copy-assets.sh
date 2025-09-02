#!/bin/bash

# 复制资源文件脚本

echo "📋 开始复制资源文件..."

# 确保dist目录存在
if [ ! -d "dist" ]; then
    echo "❌ dist 目录不存在，请先运行构建脚本"
    exit 1
fi

# 确保CSS文件被复制
echo "🎨 复制CSS文件..."
if [ -f "src/content/content.css" ]; then
    cp src/content/content.css dist/ 2>/dev/null || echo "⚠️  content.css 复制失败"
else
    echo "❌ src/content/content.css 文件不存在"
fi

# 修复CSS文件命名问题
echo "🎨 修复CSS文件命名..."
if [ -f "dist/style.css" ] && [ ! -f "dist/popup.css" ]; then
    echo "🔄 将 style.css 重命名为 popup.css..."
    mv dist/style.css dist/popup.css
    echo "✅ popup.css 已创建"
elif [ -f "dist/popup.css" ]; then
    echo "✅ popup.css 已存在"
else
    echo "⚠️  未找到popup相关的CSS文件"
fi

# 复制图标文件到根目录（如果不存在）
echo "🎨 复制图标文件到根目录..."
icon_files=("icon16.png" "icon32.png" "icon48.png" "icon128.png")
for icon in "${icon_files[@]}"; do
    if [ -f "icons/$icon" ] && [ ! -f "dist/$icon" ]; then
        cp "icons/$icon" "dist/"
        echo "✅ $icon 已复制到根目录"
    fi
done

# 确保图标目录存在
if [ ! -d "dist/icons" ]; then
    echo "🎨 创建图标目录..."
    mkdir -p dist/icons
    cp -r icons/* dist/icons/
    echo "✅ 图标目录已创建并复制"
fi

# 验证复制结果
echo ""
echo "🔍 验证复制结果..."
if [ -f "dist/content.css" ]; then
    echo "✅ content.css 存在"
else
    echo "❌ content.css 仍然缺失"
fi

echo "🎉 资源文件复制完成！"
