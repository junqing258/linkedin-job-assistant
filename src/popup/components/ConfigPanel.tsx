import React, { useState, useEffect } from 'react';
import { useConfigStore } from '../store/configStore';

const ConfigPanel: React.FC = () => {
  const { config, updateConfig, saveConfig, loadConfig, isLoading, error } = useConfigStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempConfig, setTempConfig] = useState(config);

  // 在组件挂载时加载配置
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // 当配置更新时，同步临时配置
  useEffect(() => {
    setTempConfig(config);
  }, [config]);

  const handleSave = async () => {
    try {
      // 先将临时配置更新到store
      updateConfig(tempConfig);
      // 然后保存到Chrome存储
      await saveConfig();
      setIsEditing(false);
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  };

  const handleCancel = () => {
    setTempConfig(config);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof typeof config, value: any) => {
    setTempConfig(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">API 配置</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              编辑
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API 密钥
            </label>
            <input
              type="password"
              value={isEditing ? tempConfig.openaiApiKey : config.openaiApiKey}
              onChange={(e) => handleInputChange('openaiApiKey', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              placeholder="sk-..."
            />
            <p className="mt-1 text-xs text-gray-500">
              在 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI 平台</a> 获取您的 API 密钥
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI Base URL
            </label>
            <input
              type="url"
              value={isEditing ? tempConfig.openaiBaseUrl : config.openaiBaseUrl}
              onChange={(e) => handleInputChange('openaiBaseUrl', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              placeholder="https://api.openai.com/v1"
            />
            <p className="mt-1 text-xs text-gray-500">
              默认使用官方API地址，如需使用代理或自定义端点请修改此地址
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              默认模型
            </label>
            <input
              type="text"
              value={isEditing ? tempConfig.defaultModel : config.defaultModel}
              onChange={(e) => handleInputChange('defaultModel', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              placeholder="gpt-4"
            />
            <p className="mt-1 text-xs text-gray-500">
              常用模型：gpt-4, gpt-4-turbo, gpt-3.5-turbo, gpt-4o, gpt-4o-mini
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              创造性 (Temperature)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isEditing ? tempConfig.temperature : config.temperature}
              onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
              disabled={!isEditing}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>精确 (0.0)</span>
              <span>平衡 (0.5)</span>
              <span>创造性 (1.0)</span>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              取消
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">功能开关</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                自动搜索优化
              </label>
              <p className="text-xs text-gray-500">
                自动优化LinkedIn搜索条件
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableAutoOptimization}
                onChange={(e) => updateConfig({ enableAutoOptimization: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                智能候选人排序
              </label>
              <p className="text-xs text-gray-500">
                基于LLM对候选人进行智能排序
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableSmartRanking}
                onChange={(e) => updateConfig({ enableSmartRanking: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
