// LLM服务 - 使用原生fetch API，兼容Service Worker
import { LLMRequest, LLMResponse } from '@/types';

class LLMService {
  private apiKey: string;
  private baseURL: string;
  private defaultModel: string;

  constructor(apiKey: string, baseURL: string = 'https://api.openai.com/v1', defaultModel: string = 'gpt-4') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.defaultModel = defaultModel;
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: request.model || this.defaultModel,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的招聘助手，专门帮助优化LinkedIn Recruiter搜索。请提供准确、实用的建议。'
            },
            {
              role: 'user',
              content: request.prompt
            }
          ],
          temperature: request.temperature || 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        usage: data.usage
      };
    } catch (error) {
      console.error('LLM API调用失败:', error);
      throw new Error('LLM服务暂时不可用，请稍后重试');
    }
  }

  async optimizeSearchQuery(userInput: string, jobDescription?: string): Promise<string> {
    const prompt = `
请将以下招聘需求转换为LinkedIn Recruiter的精确搜索条件：

用户输入：${userInput}
${jobDescription ? `职位描述：${jobDescription}` : ''}

请输出结构化的搜索条件，包括：
1. 关键词（用逗号分隔）
2. 技能要求（用逗号分隔）
3. 经验年限范围
4. 地理位置
5. 公司规模（可选）
6. 教育背景要求（可选）

请用JSON格式输出，例如：
{
  "keywords": "后端工程师,Python,AWS",
  "skills": "Python,JavaScript,AWS,Docker",
  "experience": {"min": 3, "max": 8},
  "location": "旧金山",
  "companySize": "100-1000人",
  "education": "计算机科学学士"
}
    `;

    const response = await this.generateResponse({ prompt });
    return response.content;
  }

  async rankCandidates(candidates: any[], jobDescription: string): Promise<any[]> {
    const prompt = `
请分析以下候选人资料与职位描述的匹配度：

职位描述：${jobDescription}

候选人资料：${JSON.stringify(candidates, null, 2)}

请为每个候选人给出0-100的匹配分数，并说明理由。输出格式：
[
  {
    "id": "候选人ID",
    "score": 85,
    "reasoning": "匹配理由",
    "matchedSkills": ["匹配的技能1", "匹配的技能2"]
  }
]
    `;

    const response = await this.generateResponse({ prompt });
    try {
      return JSON.parse(response.content);
    } catch (error) {
      console.error('解析候选人排序结果失败:', error);
      // 返回默认结果，避免解析失败导致整个功能不可用
      return candidates.map(candidate => ({
        id: candidate.id || 'unknown',
        score: 50,
        reasoning: '解析失败，使用默认分数',
        matchedSkills: []
      }));
    }
  }
}

export default LLMService;
