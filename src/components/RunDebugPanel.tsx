import { Play, Square, RotateCcw, Settings, Bug, PlayCircle } from 'lucide-react';
import { useState } from 'react';

export function RunDebugPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState('Launch Program');

  const configurations = [
    'Launch Program',
    'Debug Program',
    'Test Program',
    'Build & Run'
  ];

  return (
    <div className="p-4 h-full">
      <h3 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wide">
        Run and Debug
      </h3>

      {/* Configuration Selector */}
      <div className="mb-4">
        <select
          value={selectedConfig}
          onChange={(e) => setSelectedConfig(e.target.value)}
          className="w-full bg-gray-700 text-gray-300 text-sm px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
        >
          {configurations.map((config) => (
            <option key={config} value={config}>
              {config}
            </option>
          ))}
        </select>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center space-x-2 px-4 py-2 rounded text-sm transition-colors ${
            isRunning
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isRunning ? (
            <>
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Start</span>
            </>
          )}
        </button>

        <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded">
          <RotateCcw className="w-4 h-4" />
        </button>

        <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Debug Console */}
      <div className="mb-4">
        <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          Debug Console
        </h4>
        <div className="bg-gray-900 border border-gray-600 rounded p-3 h-32 overflow-y-auto">
          <div className="space-y-1 text-xs font-mono">
            {isRunning ? (
              <>
                <div className="text-green-400">[INFO] Starting application...</div>
                <div className="text-blue-400">[DEBUG] Loading modules...</div>
                <div className="text-green-400">[INFO] Application started successfully</div>
                <div className="text-gray-400">[LOG] Listening on port 3000</div>
              </>
            ) : (
              <div className="text-gray-500">Ready to start debugging...</div>
            )}
          </div>
        </div>
      </div>

      {/* Breakpoints */}
      <div className="mb-4">
        <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          Breakpoints
        </h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-300">App.tsx:42</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-300">CodeEditor.tsx:15</span>
          </div>
        </div>
      </div>

      {/* Watch Variables */}
      <div className="mb-4">
        <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          Watch
        </h4>
        <div className="bg-gray-700 rounded p-2">
          <input
            type="text"
            placeholder="Add variable to watch..."
            className="w-full bg-transparent text-gray-300 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Call Stack */}
      <div>
        <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          Call Stack
        </h4>
        {isRunning ? (
          <div className="space-y-1 text-xs font-mono">
            <div className="p-2 bg-gray-700 rounded text-gray-300">
              main() - App.tsx:1
            </div>
            <div className="p-2 bg-gray-700 rounded text-gray-300">
              render() - App.tsx:42
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500 p-2">
            No call stack available
          </div>
        )}
      </div>
    </div>
  );
}