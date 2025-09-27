import { X } from 'lucide-react';

interface Tab {
  id: string;
  name: string;
  isDirty: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export function TabBar({ tabs, activeTab, onTabSelect, onTabClose }: TabBarProps) {
  return (
    <div className="flex bg-gray-800 border-b border-gray-700 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center px-3 py-2 cursor-pointer border-r border-gray-700 min-w-0 max-w-48 group ${
            activeTab === tab.id
              ? 'bg-gray-900 text-white border-b-2 border-purple-500'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => onTabSelect(tab.id)}
        >
          <span className="truncate text-sm mr-2">
            {tab.name}
            {tab.isDirty && <span className="text-orange-400 ml-1">●</span>}
          </span>
          <button
            className="opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded p-1 ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}