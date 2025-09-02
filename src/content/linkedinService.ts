import { LinkedInProfile, SearchQuery, ExperienceRange } from '@/types';

import assistantContainerHtml from './assistantContainer.html?raw';

class LinkedInService {
  private getSearchForm(): HTMLFormElement | null {
    return document.querySelector('form[data-control-name="search_form"]') ||
      document.querySelector('form[role="search"]') ||
      document.querySelector('form');
  }

  private getSearchInput(): HTMLInputElement | null {
    return document.querySelector('input[placeholder*="搜索"]') ||
      document.querySelector('input[type="search"]') ||
      document.querySelector('input[name="keywords"]');
  }

  async extractJobDescription(): Promise<string> {
    // 尝试从页面中提取职位描述
    const jobDescriptionSelectors = [
      '.job-description',
      '.description__text',
      '[data-job-description]',
      '.job-details__description'
    ];

    for (const selector of jobDescriptionSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent?.trim() || '';
      }
    }

    return '';
  }

  async extractSearchResults(): Promise<LinkedInProfile[]> {
    const profiles: LinkedInProfile[] = [];

    // 查找搜索结果中的候选人卡片
    const candidateCards = document.querySelectorAll('[data-testid*="candidate"], .search-result, .candidate-card');

    candidateCards.forEach((card, index) => {
      try {
        const profile = this.parseCandidateCard(card);
        if (profile) {
          profiles.push(profile);
        }
      } catch (error) {
        console.warn(`解析候选人卡片 ${index} 失败:`, error);
      }
    });

    return profiles;
  }

  private parseCandidateCard(card: Element): LinkedInProfile | null {
    try {
      // 尝试提取候选人信息
      const nameElement = card.querySelector('.name, .candidate-name, [data-testid*="name"]');
      const headlineElement = card.querySelector('.headline, .title, .position');
      const locationElement = card.querySelector('.location, .geo-location');

      if (!nameElement) return null;

      const name = nameElement.textContent?.trim() || '';
      const headline = headlineElement?.textContent?.trim() || '';
      const location = locationElement?.textContent?.trim() || '';

      return {
        id: `candidate-${Date.now()}-${Math.random()}`,
        name,
        headline,
        location,
        experience: this.extractExperience(card),
        education: this.extractEducation(card),
        skills: this.extractSkills(card),
        summary: this.extractSummary(card)
      };
    } catch (error) {
      console.error('解析候选人卡片失败:', error);
      return null;
    }
  }

  private extractExperience(card: Element): any[] {
    const experienceElements = card.querySelectorAll('.experience, .work-history, [data-testid*="experience"]');
    const experiences: any[] = [];

    experienceElements.forEach((exp) => {
      const titleElement = exp.querySelector('.title, .position');
      const companyElement = exp.querySelector('.company, .organization');
      const durationElement = exp.querySelector('.duration, .time-period');

      if (titleElement) {
        experiences.push({
          title: titleElement.textContent?.trim() || '',
          company: companyElement?.textContent?.trim() || '',
          duration: durationElement?.textContent?.trim() || '',
          description: ''
        });
      }
    });

    return experiences;
  }

  private extractEducation(card: Element): any[] {
    const educationElements = card.querySelectorAll('.education, .school, [data-testid*="education"]');
    const educations: any[] = [];

    educationElements.forEach((edu) => {
      const schoolElement = edu.querySelector('.school, .university');
      const degreeElement = edu.querySelector('.degree, .field');
      const yearElement = edu.querySelector('.year, .graduation-year');

      if (schoolElement) {
        educations.push({
          school: schoolElement.textContent?.trim() || '',
          degree: degreeElement?.textContent?.trim() || '',
          field: degreeElement?.textContent?.trim() || '',
          year: yearElement?.textContent?.trim() || ''
        });
      }
    });

    return educations;
  }

  private extractSkills(card: Element): string[] {
    const skillElements = card.querySelectorAll('.skill, .tag, [data-testid*="skill"]');
    const skills: string[] = [];

    skillElements.forEach((skill) => {
      const skillText = skill.textContent?.trim();
      if (skillText) {
        skills.push(skillText);
      }
    });

    return skills;
  }

  private extractSummary(card: Element): string {
    const summaryElement = card.querySelector('.summary, .bio, .description');
    return summaryElement?.textContent?.trim() || '';
  }

  async applySearchQuery(query: SearchQuery): Promise<void> {
    try {
      // 查找搜索表单
      const searchForm = this.getSearchForm();
      const searchInput = this.getSearchInput();

      if (!searchForm || !searchInput) {
        throw new Error('无法找到搜索表单或输入框');
      }

      // 填充搜索关键词
      if (query.keywords.length > 0) {
        searchInput.value = query.keywords.join(' ');
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));

        // 触发change事件，确保LinkedIn页面能识别到输入变化
        searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // 尝试查找并填充其他搜索条件
      this.fillLocationFilter(query.location);
      this.fillExperienceFilter(query.experience);
      this.fillSkillsFilter(query.skills);

      console.log('搜索条件已应用:', query);

      // 可选：自动提交搜索表单
      // searchForm.submit();

    } catch (error) {
      console.error('应用搜索条件失败:', error);
      throw error;
    }
  }

  private fillLocationFilter(location: string): void {
    if (!location) return;

    try {
      // 查找位置输入框
      const locationInput = document.querySelector('input[placeholder*="位置"], input[placeholder*="Location"]') as HTMLInputElement;
      if (locationInput) {
        locationInput.value = location;
        locationInput.dispatchEvent(new Event('input', { bubbles: true }));
        locationInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch (error) {
      console.warn('填充位置筛选器失败:', error);
    }
  }

  private fillExperienceFilter(experience: ExperienceRange): void {
    if (!experience || (experience.min === 0 && experience.max === 0)) return;

    try {
      // 查找经验年限筛选器
      const experienceSelect = document.querySelector('select[name*="experience"], select[data-control-name*="experience"]') as HTMLSelectElement;
      if (experienceSelect) {
        // 根据经验范围选择合适的选项
        const experienceValue = this.mapExperienceToOption(experience);
        if (experienceValue) {
          experienceSelect.value = experienceValue;
          experienceSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    } catch (error) {
      console.warn('填充经验筛选器失败:', error);
    }
  }

  private fillSkillsFilter(skills: string[]): void {
    if (!skills || skills.length === 0) return;

    try {
      // 查找技能筛选器
      const skillsInput = document.querySelector('input[placeholder*="技能"], input[placeholder*="Skills"]') as HTMLInputElement;
      if (skillsInput) {
        skillsInput.value = skills.join(', ');
        skillsInput.dispatchEvent(new Event('input', { bubbles: true }));
        skillsInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch (error) {
      console.warn('填充技能筛选器失败:', error);
    }
  }

  private mapExperienceToOption(experience: ExperienceRange): string | null {
    // 将经验范围映射到LinkedIn的选项值
    const { min, max } = experience;

    if (min <= 1 && max <= 2) return '1-2';
    if (min <= 2 && max <= 5) return '2-5';
    if (min <= 5 && max <= 10) return '5-10';
    if (min >= 10) return '10+';

    return null;
  }

  async injectAssistantUI(): Promise<void> {
    // 注入助手UI到LinkedIn页面
    const assistantContainer = document.createElement('div');
    assistantContainer.id = 'linkedin-recruiter-assistant';
    assistantContainer.innerHTML = assistantContainerHtml;

    document.body.appendChild(assistantContainer);

    // 绑定事件
    const optimizeButton = document.getElementById('assistant-optimize');
    const input = document.getElementById('assistant-input') as HTMLInputElement;

    if (optimizeButton && input) {
      optimizeButton.addEventListener('click', async () => {
        const userInput = input.value.trim();
        if (userInput) {
          try {
            // 这里会调用LLM服务来优化搜索
            console.log('用户输入:', userInput);
            // TODO: 实现搜索优化逻辑
          } catch (error) {
            console.error('搜索优化失败:', error);
          }
        }
      });
    }
  }
}

export default LinkedInService;
