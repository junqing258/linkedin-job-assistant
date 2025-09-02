import { PluginConfig } from "@/types";

const defaultConfig: PluginConfig = {
  openaiApiKey: '',
  openaiBaseUrl: 'https://api.openai.com/v1',
  defaultModel: 'gpt-4',
  temperature: 0.7,
  enableAutoOptimization: true,
  enableSmartRanking: true,
};

export default defaultConfig;