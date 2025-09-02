import { create } from 'zustand';
import { PluginConfig } from '@/types';
import defaultConfig from '@/background/config';

interface ConfigState {
  config: PluginConfig;
  isLoading: boolean;
  error: string | null;
  updateConfig: (updates: Partial<PluginConfig>) => void;
  loadConfig: () => Promise<void>;
  saveConfig: () => Promise<void>;
}


export const useConfigStore = create<ConfigState>((set, get) => ({
  config: defaultConfig,
  isLoading: false,
  error: null,

  updateConfig: (updates) => {
    console.log('更新配置:', updates);
    set((state) => ({
      config: { ...state.config, ...updates }
    }));
  },

  loadConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('开始加载配置...');
      const result = await chrome.storage.sync.get(['pluginConfig']);
      console.log('从存储加载的原始数据:', result);

      const savedConfig = result.pluginConfig;

      if (savedConfig) {
        console.log('找到已保存的配置:', savedConfig);
        const mergedConfig = { ...defaultConfig, ...savedConfig };
        console.log('合并后的配置:', mergedConfig);
        set({ config: mergedConfig });
      } else {
        console.log('没有找到已保存的配置，使用默认配置');
        set({ config: defaultConfig });
      }
    } catch (error) {
      const errorMessage = '加载配置失败: ' + (error instanceof Error ? error.message : String(error));
      set({ error: errorMessage });
      console.error('加载配置失败:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const currentConfig = get().config;
      console.log('保存配置:', currentConfig);

      await chrome.storage.sync.set({ pluginConfig: currentConfig });
      console.log('配置保存成功');

      set({ error: null });
    } catch (error) {
      const errorMessage = '保存配置失败: ' + (error instanceof Error ? error.message : String(error));
      set({ error: errorMessage });
      console.error('保存配置失败:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
