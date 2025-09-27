import { CheckCircle, AlertCircle, GitBranch, Zap } from 'lucide-react';

interface StatusBarProps {
  activeFile: string;
  lineNumber: number;
  columnNumber: number;
}

export function StatusBar({ activeFile, lineNumber, columnNumber }: StatusBarProps) {
  return (
    <div className="h-6 bg-purple-600 text-white flex items-center justify-between px-4 text-xs">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <CheckCircle className="w-3 h-3 text-green-300" />
          <span>No errors</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Zap className="w-3 h-3" />
          <span>TypeScript</span>
        </div>
        
        {activeFile && (
          <span>
            {activeFile} - Line {lineNumber}, Col {columnNumber}
          </span>
        )}
        
        <span>UTF-8</span>
        <span>LF</span>
      </div>
    </div>
  );
}