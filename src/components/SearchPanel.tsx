import { Search, X } from 'lucide-react';
import { useState } from 'react';

export function SearchPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceMode, setReplaceMode] = useState(false);
  const [replaceTerm, setReplaceTerm] = useState('');

  return (
    <div className="p-4 h-full">
      <h3 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wide">
        Search
      </h3>
      
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="w-full bg-gray-700 text-gray-300 text-sm px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Replace Input (conditional) */}
        {replaceMode && (
          <div className="relative">
            <input
              type="text"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              placeholder="Replace"
              className="w-full bg-gray-700 text-gray-300 text-sm px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
            />
          </div>
        )}

        {/* Toggle Replace Mode */}
        <button
          onClick={() => setReplaceMode(!replaceMode)}
          className="text-xs text-gray-400 hover:text-purple-400 transition-colors"
        >
          {replaceMode ? 'Hide Replace' : 'Show Replace'}
        </button>

        {/* Search Options */}
        <div className="space-y-2 pt-2 border-t border-gray-600">
          <label className="flex items-center space-x-2 text-xs text-gray-400">
            <input type="checkbox" className="rounded" />
            <span>Match Case</span>
          </label>
          <label className="flex items-center space-x-2 text-xs text-gray-400">
            <input type="checkbox" className="rounded" />
            <span>Match Whole Word</span>
          </label>
          <label className="flex items-center space-x-2 text-xs text-gray-400">
            <input type="checkbox" className="rounded" />
            <span>Use Regular Expression</span>
          </label>
        </div>

        {/* Files to Include/Exclude */}
        <div className="space-y-2 pt-4">
          <input
            type="text"
            placeholder="files to include"
            className="w-full bg-gray-700 text-gray-300 text-xs px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="files to exclude"
            className="w-full bg-gray-700 text-gray-300 text-xs px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="mt-6">
        <div className="text-xs text-gray-500 mb-2">
          {searchTerm ? `Searching for "${searchTerm}"...` : 'Enter search term'}
        </div>
        
        {searchTerm && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400 p-2 bg-gray-700 rounded">
              No results found
            </div>
          </div>
        )}
      </div>
    </div>
  );
}