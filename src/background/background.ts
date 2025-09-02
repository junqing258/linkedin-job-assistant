// 后台脚本 - 处理插件的后台逻辑
// 注意：这是一个Service Worker，需要保持简单和兼容性

import defaultConfig from "@/background/config";
import LLMService from "@/background/llmService";


console.log('LinkedIn Recruiter Assistant 后台脚本已启动');

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('收到消息:', request);

  switch (request.type) {
    case 'OPTIMIZE_SEARCH':
      handleSearchOptimization(request.data, sendResponse);
      return true; // 保持消息通道开放

    case 'RANK_CANDIDATES':
      handleCandidateRanking(request.data, sendResponse);
      return true;

    case 'GET_CONFIG':
      handleGetConfig(sendResponse);
      return true;

    case 'UPDATE_CONFIG':
      handleUpdateConfig(request.data, sendResponse);
      return true;

    default:
      sendResponse({ success: false, error: '未知的消息类型' });
  }
});

// 处理搜索优化请求
async function handleSearchOptimization(data: any, sendResponse: (response: any) => void) {
  try {
    const { userInput, jobDescription } = data;

    // 从存储中获取配置
    const result = await chrome.storage.sync.get(['pluginConfig']);
    const config = result.pluginConfig;

    if (!config?.openaiApiKey) {
      sendResponse({
        success: false,
        error: '请先在插件设置中配置OpenAI API密钥'
      });
      return;
    }

    // 创建LLM服务实例并调用优化搜索
    const llmService = new LLMService(
      config.openaiApiKey,
      config.openaiBaseUrl || 'https://api.openai.com/v1',
      config.defaultModel || 'gpt-4'
    );

    const optimizedQuery = await llmService.optimizeSearchQuery(userInput, jobDescription);

    sendResponse({
      success: true,
      message: '搜索查询已优化',
      data: {
        userInput,
        jobDescription,
        optimizedQuery,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('处理搜索优化失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    sendResponse({
      success: false,
      error: '处理搜索优化失败: ' + errorMessage
    });
  }
}

// 处理候选人排序请求
async function handleCandidateRanking(data: any, sendResponse: (response: any) => void) {
  try {
    const { candidates, jobDescription } = data;

    // 从存储中获取配置
    const result = await chrome.storage.sync.get(['pluginConfig']);
    const config = result.pluginConfig;

    if (!config?.openaiApiKey) {
      sendResponse({
        success: false,
        error: '请先在插件设置中配置OpenAI API密钥'
      });
      return;
    }

    // 创建LLM服务实例并调用候选人排序
    const llmService = new LLMService(
      config.openaiApiKey,
      config.openaiBaseUrl || 'https://api.openai.com/v1',
      config.defaultModel || 'gpt-4'
    );

    const rankedCandidates = await llmService.rankCandidates(candidates, jobDescription);

    sendResponse({
      success: true,
      message: '候选人排序完成',
      data: {
        candidateCount: candidates.length,
        jobDescription,
        rankedCandidates,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('处理候选人排序失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    sendResponse({
      success: false,
      error: '处理候选人排序失败: ' + errorMessage
    });
  }
}

// 获取配置
async function handleGetConfig(sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.sync.get(['pluginConfig']);
    sendResponse({
      success: true,
      data: result.pluginConfig || {}
    });
  } catch (error) {
    console.error('获取配置失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    sendResponse({
      success: false,
      error: '获取配置失败: ' + errorMessage
    });
  }
}

// 更新配置
async function handleUpdateConfig(data: any, sendResponse: (response: any) => void) {
  try {
    await chrome.storage.sync.set({ pluginConfig: data });
    sendResponse({
      success: true,
      message: '配置已更新'
    });
  } catch (error) {
    console.error('更新配置失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    sendResponse({
      success: false,
      error: '更新配置失败: ' + errorMessage
    });
  }
}

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener((details) => {
  console.log('插件安装/更新:', details.reason);

  if (details.reason === 'install') {
    // 首次安装，设置默认配置
    chrome.storage.sync.set({ pluginConfig: defaultConfig }, () => {
      console.log('默认配置已设置');
    });
  }
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('linkedin.com/recruiter')) {
    console.log('LinkedIn Recruiter 页面已加载，标签页ID:', tabId);

    // 可以在这里执行一些初始化逻辑
    chrome.tabs.sendMessage(tabId, {
      type: 'PAGE_LOADED',
      data: { url: tab.url }
    }).catch(() => {
      // 内容脚本可能还没准备好，这是正常的
      console.log('内容脚本还未准备好');
    });
  }
});
