import { GitBranch, Plus, RefreshCw, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export function SourceControlPanel() {
  const [commitMessage, setCommitMessage] = useState('');

  const changes = [
    { file: 'page.tsx', status: 'M' },
    { file: 'components/CodeEditor.tsx', status: 'M' },
    { file: 'styles/globals.css', status: 'A' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'M': return 'text-orange-400';
      case 'A': return 'text-green-400';
      case 'D': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'M': return 'Modified';
      case 'A': return 'Added';
      case 'D': return 'Deleted';
      default: return 'Unknown';
    }
  };

  return (
    <div className="p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
          Source Control
        </h3>
        <div className="flex items-center space-x-1">
          <button className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Repository Info */}
      <div className="mb-4 p-3 bg-gray-700 rounded">
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <GitBranch className="w-4 h-4" />
          <span>main</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">origin/main</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          3 changes • 0 staged
        </div>
      </div>

      {/* Commit Message */}
      <div className="mb-4">
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Message (press Ctrl+Enter to commit)"
          className="w-full bg-gray-700 text-gray-300 text-sm px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none resize-none h-20"
        />
        <button 
          className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-4 rounded transition-colors"
          disabled={!commitMessage.trim()}
        >
          Commit
        </button>
      </div>

      {/* Changes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs text-gray-400 uppercase tracking-wide">
            Changes ({changes.length})
          </h4>
          <button className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded">
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1">
          {changes.map((change, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 hover:bg-gray-700 rounded group"
            >
              <div className="flex items-center space-x-2 flex-1">
                <span className={`text-xs font-mono ${getStatusColor(change.status)}`}>
                  {change.status}
                </span>
                <span className="text-sm text-gray-300 truncate">
                  {change.file}
                </span>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-600 rounded text-xs">
                  +
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-600 rounded text-xs">
                  ↶
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="space-y-2">
          <button className="w-full text-left text-xs text-gray-400 hover:text-gray-300 p-2 hover:bg-gray-700 rounded">
            Pull, Push
          </button>
          <button className="w-full text-left text-xs text-gray-400 hover:text-gray-300 p-2 hover:bg-gray-700 rounded">
            Sync Changes
          </button>
          <button className="w-full text-left text-xs text-gray-400 hover:text-gray-300 p-2 hover:bg-gray-700 rounded">
            Create Branch
          </button>
        </div>
      </div>
    </div>
  );
}