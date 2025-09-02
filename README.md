# LinkedIn Recruiter Assistant

基于LLM的LinkedIn Recruiter搜索优化Chrome插件，帮助招聘人员更高效地找到匹配的候选人。

## 🚀 功能特性

### 1. 智能查询优化
- 将自然语言招聘需求自动转换为LinkedIn Recruiter精确搜索条件
- 支持职位描述输入，提供更准确的优化结果
- 自动填充搜索表单，节省手动设置时间

### 2. 上下文相关排序
- 基于LLM对候选人资料与职位描述的语义理解
- 智能评分和排序，优先推荐契合度高的候选人
- 提供详细的匹配理由和技能分析

### 3. 无缝集成体验
- 直接在LinkedIn Recruiter页面中使用
- 浮动的助手面板，不干扰原有工作流程
- 支持Chrome插件弹出窗口配置

## 🛠️ 技术架构

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **状态管理**: Zustand
- **LLM服务**: OpenAI GPT-4 API
- **浏览器扩展**: Chrome Extension Manifest V3

## 📦 安装说明

### 开发环境设置

1. 克隆项目
```bash
git clone <repository-url>
cd linkedin-job-assistant
```

2. 安装依赖
```bash
npm install
```

3. 开发模式
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

### Chrome插件安装

1. 构建项目后，在Chrome浏览器中打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目的 `dist` 目录

## ⚙️ 配置说明

### OpenAI API配置

1. 在 [OpenAI平台](https://platform.openai.com/api-keys) 获取API密钥
2. 点击插件图标，进入"设置"标签页
3. 输入API密钥并保存配置

### 功能开关

- **自动搜索优化**: 启用智能搜索条件优化
- **智能候选人排序**: 启用基于LLM的候选人排序

## 🎯 使用方法

### 搜索优化

1. 在LinkedIn Recruiter页面，点击插件图标
2. 选择"搜索优化"标签页
3. 输入招聘需求描述（如："找旧金山有Python和AWS经验的高级后端工程师"）
4. 可选：粘贴完整职位描述
5. 点击"开始优化搜索"
6. 将优化结果应用到LinkedIn页面

### 候选人排序

1. 在搜索结果页面，点击插件图标
2. 选择"候选人排序"标签页
3. 输入职位描述
4. 点击"开始智能排序"
5. 查看排序结果并应用到页面

## 🔧 开发指南

### 项目结构

```
src/
├── background/          # 后台脚本
├── content/            # 内容脚本
├── popup/              # 弹出窗口
│   └── components/     # React组件
├── services/           # 服务层
├── store/              # 状态管理
└── types/              # TypeScript类型定义
```

### 核心服务

- **LLMService**: 处理OpenAI API调用
- **LinkedInService**: 解析LinkedIn页面内容和操作DOM
- **ConfigStore**: 管理插件配置

### 消息通信

插件使用Chrome Extension消息API进行组件间通信：

- Content Script ↔ Background Script
- Popup ↔ Background Script
- Content Script ↔ Popup

## 🚨 注意事项

1. **API成本**: 频繁使用LLM API会产生费用，建议合理使用
2. **页面兼容性**: LinkedIn页面结构变化可能影响功能，需要及时更新选择器
3. **隐私保护**: 确保API密钥安全，避免泄露
4. **使用限制**: 遵守LinkedIn和OpenAI的使用条款

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发流程

1. Fork项目
2. 创建功能分支
3. 提交代码
4. 创建Pull Request

### 代码规范

- 使用TypeScript严格模式
- 遵循ESLint规则
- 添加适当的注释和文档

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交GitHub Issue
- 发送邮件至：[your-email@example.com]

## 🔄 更新日志

### v1.0.0
- 初始版本发布
- 支持智能搜索优化
- 支持候选人智能排序
- 完整的Chrome插件功能
