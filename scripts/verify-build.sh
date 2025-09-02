#!/bin/bash

# LinkedIn Recruiter Assistant 构建验证脚本

echo "🔍 开始验证构建结果..."

# 检查dist目录是否存在
if [ ! -d "dist" ]; then
    echo "❌ dist 目录不存在，请先运行构建脚本"
    exit 1
fi

# 检查关键文件
echo "📋 检查关键文件..."
required_files=(
    "manifest.json"
    "background.js"
    "content.js"
    "content.css"
    "popup.js"
    "popup.html"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ -f "dist/$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 缺失"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "❌ 缺少以下文件："
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    echo "请检查构建配置"
    exit 1
fi

# 验证manifest.json
echo ""
echo "📄 验证 manifest.json..."
if [ -f "dist/manifest.json" ]; then
    # 检查manifest版本
    if grep -q '"manifest_version": 3' "dist/manifest.json"; then
        echo "✅ manifest_version 3 正确"
    else
        echo "❌ manifest_version 不正确"
    fi
    
    # 检查Service Worker配置
    if grep -q '"service_worker": "background.js"' "dist/manifest.json"; then
        echo "✅ Service Worker 配置正确"
    else
        echo "❌ Service Worker 配置不正确"
    fi
    
    # 检查权限配置
    if grep -q '"storage"' "dist/manifest.json"; then
        echo "✅ storage 权限已配置"
    else
        echo "❌ storage 权限未配置"
    fi
fi

# 验证Service Worker
echo ""
echo "🔧 验证 Service Worker..."
if [ -f "dist/background.js" ]; then
    # 检查文件大小
    file_size=$(wc -c < "dist/background.js")
    echo "📊 background.js 文件大小: ${file_size} 字节"
    
    # 检查是否包含必要的代码
    if grep -q "chrome.runtime.onMessage.addListener" "dist/background.js"; then
        echo "✅ 消息监听器已配置"
    else
        echo "❌ 消息监听器未找到"
    fi
    
    if grep -q "chrome.storage.sync" "dist/background.js"; then
        echo "✅ 存储API已配置"
    else
        echo "❌ 存储API未找到"
    fi
    
    if grep -q "console.log" "dist/background.js"; then
        echo "✅ 日志输出已配置"
    else
        echo "❌ 日志输出未找到"
    fi
    
    # 语法检查
    echo "🔍 语法检查..."
    if command -v node &> /dev/null; then
        if node -c "dist/background.js" 2>/dev/null; then
            echo "✅ JavaScript 语法检查通过"
        else
            echo "❌ JavaScript 语法检查失败"
            echo "请检查 background.js 文件"
        fi
    else
        echo "⚠️  Node.js 不可用，跳过语法检查"
    fi
fi

# 验证内容脚本
echo ""
echo "📜 验证内容脚本..."
if [ -f "dist/content.js" ]; then
    content_size=$(wc -c < "dist/content.js")
    echo "📊 content.js 文件大小: ${content_size} 字节"
    
    if grep -q "chrome.runtime.onMessage.addListener" "dist/content.js"; then
        echo "✅ 内容脚本消息监听器已配置"
    else
        echo "❌ 内容脚本消息监听器未找到"
    fi
fi

# 验证弹出窗口
echo ""
echo "🪟 验证弹出窗口..."
if [ -f "dist/popup.js" ]; then
    popup_size=$(wc -c < "dist/popup.js")
    echo "📊 popup.js 文件大小: ${popup_size} 字节"
    
    if grep -q "chrome.runtime.sendMessage" "dist/popup.js"; then
        echo "✅ 弹出窗口消息发送已配置"
    else
        echo "❌ 弹出窗口消息发送未找到"
    fi
fi

# 验证CSS文件
echo ""
echo "🎨 验证样式文件..."
if [ -f "dist/content.css" ]; then
    css_size=$(wc -c < "dist/content.css")
    echo "📊 content.css 文件大小: ${css_size} 字节"
fi

if [ -f "dist/popup.css" ]; then
    popup_css_size=$(wc -c < "dist/popup.css")
    echo "📊 popup.css 文件大小: ${popup_css_size} 字节"
fi

# 验证图标文件
echo ""
echo "🖼️  验证图标文件..."
icon_files=("icon16.png" "icon32.png" "icon48.png" "icon128.png")
for icon in "${icon_files[@]}"; do
    if [ -f "dist/icons/$icon" ]; then
        echo "✅ $icon 存在"
    else
        echo "❌ $icon 缺失"
    fi
done

# 总结
echo ""
echo "📊 验证总结:"
total_files=${#required_files[@]}
found_files=$((total_files - ${#missing_files[@]}))

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "🎉 所有文件验证通过！"
    echo "✅ 构建结果: $found_files/$total_files 文件"
    echo ""
    echo "🚀 插件已准备就绪，可以安装到Chrome浏览器中"
else
    echo "❌ 验证失败！"
    echo "❌ 构建结果: $found_files/$total_files 文件"
    echo "请检查构建配置并重新构建"
    exit 1
fi

