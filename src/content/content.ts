import LinkedInService from '@/content/linkedinService';

console.log('LinkedIn Recruiter Assistant 已加载');

// 等待页面加载完成
function waitForPageLoad(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'interactive') {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', () => resolve());
    }
  });
}

// 等待LinkedIn页面元素加载
function waitForLinkedInElements(timeout: number = 3000): Promise<void> {
  let startTime = Date.now();
  return new Promise((resolve) => {
    const checkElements = () => {
      if (Date.now() - startTime > timeout) {
        resolve();
        return;
      }

      // 检查是否在Recruiter页面
      if (window.location.href.includes('/recruiter/')) {
        // 等待一些关键元素出现
        const searchForm = document.querySelector('form') ||
          document.querySelector('[data-control-name="search_form"]');

        if (searchForm) {
          resolve();
          return;
        }
      }

      // 如果还没准备好，继续等待
      setTimeout(checkElements, 1000);
    };

    checkElements();
  });
}

// 监听来自popup的消息
function setupMessageListener(linkedinService: LinkedInService) {
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    console.log('内容脚本收到消息:', request);

    switch (request.type) {
      case 'APPLY_OPTIMIZED_QUERY':
        handleApplyOptimizedQuery(request.data, linkedinService, sendResponse);
        return true; // 保持消息通道开放

      case 'PAGE_LOADED':
        console.log('页面加载完成:', request.data);
        sendResponse({ success: true });
        return true;

      default:
        console.log('未知消息类型:', request.type);
        sendResponse({ success: false, error: '未知的消息类型' });
    }
  });
}

// 处理应用优化搜索条件的请求
async function handleApplyOptimizedQuery(data: any, linkedinService: LinkedInService, sendResponse: (response: any) => void) {
  try {
    const { optimizedQuery } = data;

    if (!optimizedQuery) {
      sendResponse({ success: false, error: '优化后的搜索条件为空' });
      return;
    }

    console.log('应用优化后的搜索条件:', optimizedQuery);

    // 将优化后的查询转换为搜索查询对象
    const searchQuery = {
      keywords: [optimizedQuery],
      location: '',
      experience: { min: 0, max: 0 }, // 默认值，后续可以从优化结果中解析
      skills: []
    };

    // 应用搜索条件
    await linkedinService.applySearchQuery(searchQuery);

    sendResponse({
      success: true,
      message: '搜索条件已成功应用到LinkedIn'
    });

  } catch (error) {
    console.error('应用优化搜索条件失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    sendResponse({
      success: false,
      error: '应用搜索条件失败: ' + errorMessage
    });
  }
}

// 主函数
async function main() {
  try {
    await waitForPageLoad();
    await waitForLinkedInElements();

    const linkedinService = new LinkedInService();

    // 设置消息监听器
    setupMessageListener(linkedinService);

    // 注入助手UI
    await linkedinService.injectAssistantUI();

    console.log('LinkedIn Recruiter Assistant UI 已注入');

    // 监听页面变化，重新注入UI（如果页面是SPA）
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        // 延迟一下再重新注入，避免页面还在加载
        setTimeout(() => {
          if (document.getElementById('linkedin-recruiter-assistant')) {
            document.getElementById('linkedin-recruiter-assistant')?.remove();
          }
          linkedinService.injectAssistantUI();
        }, 2000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

  } catch (error) {
    console.error('LinkedIn Recruiter Assistant 初始化失败:', error);
  }
}

// 启动主函数
main();
