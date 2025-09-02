export const developmentConfig = {
  // OpenAI API配置
  openai: {
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
  },

  // LinkedIn相关配置
  linkedin: {
    domain: 'linkedin.com',
    recruiterPath: '/recruiter',
    selectors: {
      searchForm: 'form[data-control-name="search_form"], form[role="search"], form',
      searchInput: 'input[placeholder*="搜索"], input[type="search"], input[name="keywords"]',
      candidateCards: '[data-testid*="candidate"], .search-result, .candidate-card',
    },
  },

  // 插件配置
  plugin: {
    name: 'LinkedIn Recruiter Assistant',
    version: '1.0.0',
    debug: true,
    logLevel: 'debug',
  },

  // UI配置
  ui: {
    assistantPanel: {
      width: 350,
      position: { top: 20, right: 20 },
      zIndex: 10000,
    },
  },
};
