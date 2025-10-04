import {
  Files,
  Search,
  GitBranch,
  Play,
  Puzzle,
  Settings,
  User,
  Globe,
  Wallet,
  Rocket,
  Code,
  
} from "lucide-react";
import { useState } from 'react';

interface ActivityBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ActivityBar({ activeTab, onTabChange }: ActivityBarProps) {
  const tabs = [
    { id: "explorer", icon: Files, label: "Explorer" },
    { id: "search", icon: Search, label: "Search" },
    { id: "source-control", icon: GitBranch, label: "Source Control" },
    { id: "run-debug", icon: Play, label: "Run and Debug" },
    { id: "extensions", icon: Puzzle, label: "Extensions" },
    { id: "deploy", icon: Rocket, label: "Deploy" },
    { id: "connect-wallet", icon: Wallet, label: "Connect Wallet" },
  ];

  const bottomTabs = [
    { id: "accounts", icon: User, label: "Accounts" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const TabButton = ({ tab, isActive }: { tab: typeof tabs[0], isActive: boolean }) => (
    <button
      onClick={() => onTabChange(tab.id)}
      className={`
        w-12 h-12 flex items-center justify-center relative group
        transition-all duration-200 ease-in-out
        ${isActive 
          ? 'bg-gray-700 text-purple-400 border-r-2 border-purple-400' 
          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
        }
      `}
      title={tab.label}
    >
      <tab.icon className="w-6 h-6" />
      
      {/* Tooltip */}
      <div className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
        {tab.label}
      </div>
    </button>
  );

  return (
    <div className="w-12 bg-gray-900 border-r border-gray-700 flex flex-col justify-between">
      {/* Top tabs */}
      <div className="flex flex-col">
        {tabs.map((tab) => (
          <TabButton 
            key={tab.id} 
            tab={tab} 
            isActive={activeTab === tab.id} 
          />
        ))}
      </div>

      {/* Bottom tabs */}
      <div className="flex flex-col">
        {bottomTabs.map((tab) => (
          <TabButton 
            key={tab.id} 
            tab={tab} 
            isActive={activeTab === tab.id} 
          />
        ))}
      </div>
    </div>
  );
}