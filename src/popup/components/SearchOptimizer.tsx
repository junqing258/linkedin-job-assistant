import React, { useState } from 'react';

const SearchOptimizer: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedQuery, setOptimizedQuery] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleOptimize = async () => {
    if (!userInput.trim()) {
      setError('请输入招聘需求');
      return;
    }

    setIsOptimizing(true);
    setError('');
    setSuccessMessage('');
    setOptimizedQuery('');

    try {
      // 发送消息到后台脚本
      const response = await chrome.runtime.sendMessage({
        type: 'OPTIMIZE_SEARCH',
        data: {
          userInput: userInput.trim(),
          jobDescription: jobDescription.trim() || undefined
        }
      });

      if (response.success) {
        setOptimizedQuery(response.data.optimizedQuery);
      } else {
        setError(response.error || '搜索优化失败');
      }
    } catch (error) {
      setError('请求失败，请检查插件配置');
      console.error('搜索优化请求失败:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyToLinkedIn = async () => {
    try {
      // 发送消息到内容脚本，应用优化后的搜索条件
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tabs[0]?.url) {
        setError('无法获取当前标签页信息');
        return;
      }

      if (!tabs[0].url.includes('linkedin.com/recruiter')) {
        setError('请在LinkedIn Recruiter页面使用此功能');
        return;
      }

      if (!tabs[0].id) {
        setError('无法获取标签页ID');
        return;
      }

      // 显示应用中的状态
      setError('');
      
      const response = await chrome.tabs.sendMessage(tabs[0].id, {
        type: 'APPLY_OPTIMIZED_QUERY',
        data: { optimizedQuery }
      });

      if (response?.success) {
        // 成功应用，显示成功消息
        console.log('搜索条件已成功应用:', response.message);
        setSuccessMessage('搜索条件已成功应用到LinkedIn！');
        setError('');
        
        // 3秒后自动清除成功消息
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response?.error || '应用搜索条件失败');
        setSuccessMessage('');
      }
      
    } catch (error) {
      console.error('应用搜索条件失败:', error);
      setError('无法连接到LinkedIn页面，请刷新页面后重试');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">智能搜索优化</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              招聘需求描述 *
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="例如：找旧金山有Python和AWS经验的高级后端工程师"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <p className="mt-1 text-xs text-gray-500">
              用自然语言描述你的招聘需求，AI将自动优化为LinkedIn搜索条件
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              职位描述（可选）
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="粘贴完整的职位描述，帮助AI更准确地优化搜索条件"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>

          <button
            onClick={handleOptimize}
            disabled={isOptimizing || !userInput.trim()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isOptimizing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                正在优化...
              </span>
            ) : (
              '🚀 开始优化搜索'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {optimizedQuery && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">优化结果</h4>
          
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">{optimizedQuery}</pre>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleApplyToLinkedIn}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              📍 应用到LinkedIn
            </button>
            <button
              onClick={() => setOptimizedQuery('')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              清除
            </button>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 使用提示</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 用自然语言描述，如"找有3-5年经验的React前端工程师"</li>
          <li>• 可以包含技能、经验、地点、公司规模等要求</li>
          <li>• 提供职位描述可以获得更精确的优化结果</li>
          <li>• 优化后的条件会自动应用到LinkedIn搜索页面</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchOptimizer;
