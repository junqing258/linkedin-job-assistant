#!/bin/bash

# LinkedIn Recruiter Assistant 构建脚本

echo "🚀 开始构建 LinkedIn Recruiter Assistant..."

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 清理之前的构建
echo "🧹 清理之前的构建..."
npm run clean

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ -d "dist" ]; then
    echo "✅ 构建成功！"
    
    # 复制必要文件
    echo "📋 复制必要文件..."
    cp manifest.json dist/ 2>/dev/null || echo "⚠️  manifest.json 复制失败"
    
    # 运行资源复制脚本
    echo "🎨 复制资源文件..."
    # 确保图标目录存在
    if [ ! -d "dist/icons" ]; then
        echo "🎨 复制图标文件..."
        cp -r icons dist/
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

    # 修复popup.html
    echo "🎨 修复popup.html..."
    if [ -f "dist/src/popup/index.html" ]; then
        mv "dist/src/popup/index.html" "dist/popup.html"
        rm -r "dist/src/"
        echo "✅ popup.html 已创建"
    fi
    
    # Service Worker 特殊处理
    echo "🔧 处理Service Worker..."
    if [ -f "dist/background.js" ]; then
        echo "✅ background.js 已构建"
        
        # 检查Service Worker文件大小
        file_size=$(wc -c < "dist/background.js")
        echo "📊 background.js 文件大小: ${file_size} 字节"
        
        # 如果文件过大，尝试优化
        if [ $file_size -gt 50000 ]; then
            echo "⚠️  background.js 文件较大，建议检查依赖"
        fi
        
        # 验证Service Worker语法
        echo "🔍 验证Service Worker语法..."
        if command -v node &> /dev/null; then
            if node -c "dist/background.js" 2>/dev/null; then
                echo "✅ background.js 语法检查通过"
            else
                echo "❌ background.js 语法检查失败"
            fi
        else
            echo "⚠️  Node.js 不可用，跳过语法检查"
        fi
    else
        echo "❌ background.js 文件不存在"
    fi
    
    # 验证关键文件是否存在
    echo "🔍 验证构建结果..."
    required_files=("dist/manifest.json" "dist/background.js" "dist/content.js" "dist/content.css" "dist/popup.js")
    missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        echo "✅ 所有必要文件都已构建完成"
    else
        echo "❌ 缺少以下文件："
        for file in "${missing_files[@]}"; do
            echo "   - $file"
        done
        echo "请检查构建配置"
    fi
    
    echo "📁 构建输出目录: dist/"
    echo ""
    echo "📋 下一步操作："
    echo "1. 在Chrome浏览器中打开 chrome://extensions/"
    echo "2. 开启'开发者模式'"
    echo "3. 点击'加载已解压的扩展程序'"
    echo "4. 选择项目的 dist/ 目录"
    echo ""
    echo "🎉 插件安装完成！"
    
    # 运行验证脚本
    echo ""
    echo "🔍 运行构建验证..."
    if [ -f "scripts/verify-build.sh" ]; then
        ./scripts/verify-build.sh
    else
        echo "⚠️  验证脚本未找到"
    fi
    
else
    echo "❌ 构建失败！"
    exit 1
fi
