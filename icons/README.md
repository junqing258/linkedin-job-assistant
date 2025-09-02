# 图标文件

此目录包含Chrome插件所需的各种尺寸图标。

## 图标状态 ✅

所有图标已从 `assistant-emergency.png` (512x512) 成功生成：

- `icon16.png` - 16x16 像素 ✅
- `icon32.png` - 32x32 像素 ✅  
- `icon48.png` - 48x48 像素 ✅
- `icon128.png` - 128x128 像素 ✅

## 图标生成信息

- **源文件**: `assistant-emergency.png` (512x512)
- **生成工具**: macOS sips (系统自带)
- **生成时间**: 项目初始化时自动生成
- **文件格式**: PNG (RGBA, 8-bit)

## 图标规格

| 尺寸 | 文件名 | 用途 | 状态 |
|------|--------|------|------|
| 16x16 | icon16.png | 浏览器标签页 | ✅ |
| 32x32 | icon32.png | Windows任务栏 | ✅ |
| 48x48 | icon48.png | Chrome扩展管理 | ✅ |
| 128x128 | icon128.png | Chrome Web Store | ✅ |

## 技术细节

- **颜色深度**: 8-bit RGBA
- **透明度**: 支持Alpha通道
- **压缩**: PNG无损压缩
- **兼容性**: 完全兼容Chrome Extension要求

## 注意事项

- 图标文件已优化，大小适中
- 所有尺寸都保持原始图片的视觉一致性
- 符合Chrome插件的设计规范
- 无需额外处理，可直接使用

## 重新生成

如果需要重新生成图标，可以使用以下命令：

```bash
# 使用macOS sips工具
sips -z 16 16 assistant-emergency.png --out icons/icon16.png
sips -z 32 32 assistant-emergency.png --out icons/icon32.png
sips -z 48 48 assistant-emergency.png --out icons/icon48.png
sips -z 128 128 assistant-emergency.png --out icons/icon128.png
```

或者使用ImageMagick (如果已安装):

```bash
convert assistant-emergency.png -resize 16x16 icons/icon16.png
convert assistant-emergency.png -resize 32x32 icons/icon32.png
convert assistant-emergency.png -resize 48x48 icons/icon48.png
convert assistant-emergency.png -resize 128x128 icons/icon128.png
```
