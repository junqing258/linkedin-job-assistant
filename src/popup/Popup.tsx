import React, { useEffect, useState } from "react";
import { useConfigStore } from "@/store/configStore";
import ConfigPanel from "./components/ConfigPanel";
import SearchOptimizer from "./components/SearchOptimizer.tsx";
import CandidateRanker from "./components/CandidateRanker.tsx";

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"config" | "optimizer" | "ranker">(
    "config"
  );
  const { loadConfig } = useConfigStore();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const tabs = [
    { id: "config", label: "设置", icon: "⚙️" },
    { id: "optimizer", label: "搜索优化", icon: "🔍" },
    { id: "ranker", label: "候选人排序", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🤖</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              LinkedIn Recruiter Assistant
            </h1>
            <p className="text-sm text-gray-500">基于LLM的智能招聘助手</p>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        {activeTab === "config" && <ConfigPanel />}
        {activeTab === "optimizer" && <SearchOptimizer />}
        {activeTab === "ranker" && <CandidateRanker />}
      </div>

      {/* 底部信息 */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 mt-auto">
        <div className="text-center text-xs text-gray-500">
          <p>LinkedIn Recruiter Assistant v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Popup;
