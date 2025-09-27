import { Search, Download, Star, Settings, Puzzle } from 'lucide-react';
import { useState } from 'react';

export function ExtensionsPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('installed');

  const installedExtensions = [
    {
      name: 'React Snippets',
      author: 'VS Code Team',
      description: 'Code snippets for React development',
      version: '1.2.3',
      installed: true,
    },
    {
      name: 'Tailwind CSS IntelliSense',
      author: 'Tailwind Labs',
      description: 'Intelligent Tailwind CSS tooling',
      version: '0.8.7',
      installed: true,
    },
    {
      name: 'TypeScript Hero',
      author: 'rbbit',
      description: 'Additional tooling for TypeScript',
      version: '3.0.1',
      installed: true,
    },
  ];

  const recommendedExtensions = [
    {
      name: 'Prettier',
      author: 'Prettier',
      description: 'Code formatter using prettier',
      version: '9.10.4',
      installed: false,
      downloads: '18.5M',
      rating: 4.5,
    },
    {
      name: 'ESLint',
      author: 'Microsoft',
      description: 'Integrates ESLint JavaScript',
      version: '2.4.4',
      installed: false,
      downloads: '22.1M',
      rating: 4.6,
    },
    {
      name: 'GitLens',
      author: 'GitKraken',
      description: 'Supercharge Git within VS Code',
      version: '14.6.0',
      installed: false,
      downloads: '12.3M',
      rating: 4.7,
    },
  ];

  const extensions = activeTab === 'installed' ? installedExtensions : recommendedExtensions;

  return (
    <div className="p-4 h-full">
      <h3 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wide">
        Extensions
      </h3>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Extensions in Marketplace"
          className="w-full bg-gray-700 text-gray-300 text-sm pl-10 pr-4 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
        />
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-600">
        <button
          onClick={() => setActiveTab('installed')}
          className={`px-3 py-2 text-sm transition-colors ${
            activeTab === 'installed'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Installed
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-3 py-2 text-sm transition-colors ${
            activeTab === 'marketplace'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Marketplace
        </button>
      </div>

      {/* Extensions List */}
      <div className="space-y-3">
        {extensions.map((ext, index) => (
          <div key={index} className="p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-300">{ext.name}</h4>
                <p className="text-xs text-gray-400">by {ext.author}</p>
              </div>
              <div className="flex items-center space-x-1">
                {ext.installed ? (
                  <button className="p-1 text-gray-400 hover:text-gray-300">
                    <Settings className="w-4 h-4" />
                  </button>
                ) : (
                  <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded">
                    Install
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mb-2">{ext.description}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>v{ext.version}</span>
              {!ext.installed && 'downloads' in ext && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Download className="w-3 h-3" />
                    <span>{ext.downloads}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>{ext.rating}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Extension Categories */}
      {activeTab === 'marketplace' && (
        <div className="mt-6 pt-4 border-t border-gray-600">
          <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Categories
          </h4>
          <div className="space-y-1">
            {['Most Popular', 'Recently Added', 'Themes', 'Snippets', 'Debuggers', 'Formatters'].map((category) => (
              <button
                key={category}
                className="block w-full text-left text-xs text-gray-400 hover:text-gray-300 p-2 hover:bg-gray-700 rounded"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}