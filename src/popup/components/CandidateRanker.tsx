import React, { useState } from 'react';

const CandidateRanker: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [isRanking, setIsRanking] = useState(false);
  const [rankedCandidates, setRankedCandidates] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleRankCandidates = async () => {
    if (!jobDescription.trim()) {
      setError('请输入职位描述');
      return;
    }

    setIsRanking(true);
    setError('');
    setRankedCandidates([]);

    try {
      // 发送消息到后台脚本
      const response = await chrome.runtime.sendMessage({
        type: 'RANK_CANDIDATES',
        data: {
          jobDescription: jobDescription.trim()
        }
      });

      if (response.success) {
        // 这里应该获取LinkedIn页面上的候选人数据
        // 由于是在弹出窗口中，我们需要通过内容脚本来获取
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          if (tabs[0]?.url?.includes('linkedin.com/recruiter')) {
            try {
              const candidatesResponse = await chrome.tabs.sendMessage(tabs[0].id!, {
                type: 'GET_CANDIDATES',
                data: { jobDescription: jobDescription.trim() }
              });

              if (candidatesResponse.success) {
                setRankedCandidates(candidatesResponse.candidates || []);
              } else {
                setError('获取候选人数据失败');
              }
            } catch (error) {
              setError('无法连接到LinkedIn页面，请刷新页面后重试');
            }
          } else {
            setError('请在LinkedIn Recruiter页面使用此功能');
          }
        });
      } else {
        setError(response.error || '候选人排序失败');
      }
    } catch (error) {
      setError('请求失败，请检查插件配置');
      console.error('候选人排序请求失败:', error);
    } finally {
      setIsRanking(false);
    }
  };

  const handleApplyRanking = () => {
    // 发送排序结果到LinkedIn页面
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url?.includes('linkedin.com/recruiter')) {
        chrome.tabs.sendMessage(tabs[0].id!, {
          type: 'APPLY_CANDIDATE_RANKING',
          data: { rankedCandidates }
        }).catch(() => {
          setError('无法连接到LinkedIn页面，请刷新页面后重试');
        });
      } else {
        setError('请在LinkedIn Recruiter页面使用此功能');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">智能候选人排序</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              职位描述 *
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="粘贴完整的职位描述，AI将基于此对候选人进行智能排序"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
            />
            <p className="mt-1 text-xs text-gray-500">
              职位描述越详细，排序结果越准确
            </p>
          </div>

          <button
            onClick={handleRankCandidates}
            disabled={isRanking || !jobDescription.trim()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isRanking ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                正在分析候选人...
              </span>
            ) : (
              '📊 开始智能排序'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {rankedCandidates.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              排序结果 ({rankedCandidates.length} 位候选人)
            </h4>
            <button
              onClick={handleApplyRanking}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              📍 应用到LinkedIn
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {rankedCandidates.map((candidate, index) => (
              <div key={candidate.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {candidate.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      匹配度: {candidate.score}%
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{candidate.headline}</p>
                
                {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">匹配技能: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {candidate.matchedSkills.map((skill: string, skillIndex: number) => (
                        <span
                          key={skillIndex}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {candidate.reasoning && (
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">匹配理由:</span> {candidate.reasoning}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 功能说明</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 基于LLM分析候选人资料与职位描述的匹配度</li>
          <li>• 自动识别匹配的技能和经验</li>
          <li>• 提供详细的匹配理由和评分</li>
          <li>• 排序结果可直接应用到LinkedIn页面</li>
          <li>• 支持批量分析多个候选人</li>
        </ul>
      </div>
    </div>
  );
};

export default CandidateRanker;
