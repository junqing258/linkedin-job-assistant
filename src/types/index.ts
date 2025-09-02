// LinkedIn相关类型
export interface LinkedInProfile {
  id: string;
  name: string;
  headline: string;
  location: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  summary?: string;
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description?: string;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  year: string;
}

// 搜索相关类型
export interface SearchQuery {
  keywords: string[];
  skills: string[];
  experience: ExperienceRange;
  location: string;
  companySize?: string;
  education?: string;
}

export interface ExperienceRange {
  min: number;
  max: number;
}

export interface SearchResult {
  profile: LinkedInProfile;
  relevanceScore: number;
  matchedSkills: string[];
  reasoning: string;
}

// LLM相关类型
export interface LLMRequest {
  prompt: string;
  model?: string;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 插件配置类型
export interface PluginConfig {
  openaiApiKey: string;
  openaiBaseUrl: string;
  defaultModel: string;
  temperature: number;
  enableAutoOptimization: boolean;
  enableSmartRanking: boolean;
}
