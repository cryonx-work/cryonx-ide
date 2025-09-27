import { Menu, Settings, Play, Save, Folder, Search, FileText, Copy, Eye, Terminal, Palette, Monitor, Code, Rocket, Wallet, MoreHorizontal, Check, Lock, Sliders } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { useState } from 'react';

interface ToolbarProps {
  onGlobalSearch?: (term: string) => void;
}

export function Toolbar({ onGlobalSearch }: ToolbarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onGlobalSearch?.(value);
  };

  return (
    <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4">
      {/* Left Side - Logo and Menu */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {/* <Menu className="w-5 h-5 text-gray-400" /> */}
          <span className="text-purple-400 font-medium">CryonX IDE</span>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* File Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-1.5 text-gray-300 hover:bg-gray-800 rounded text-sm flex items-center space-x-1">
              {/* <Folder className="w-4 h-4" /> */}
              <span>File</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-600">
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                <FileText className="w-4 h-4 mr-2" />
                New File
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                <Folder className="w-4 h-4 mr-2" />
                New Folder
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-600" />
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                <Save className="w-4 h-4 mr-2" />
                Save
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                Save All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-1.5 text-gray-300 hover:bg-gray-800 rounded text-sm">
              <span>Edit</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-600">
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                Undo
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                Redo
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-600" />
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                Cut
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                Paste
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-1.5 text-gray-300 hover:bg-gray-800 rounded text-sm">
              <span>View</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-600">
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                <Eye className="w-4 h-4 mr-2" />
                Show Explorer
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                Show Terminal
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-600" />
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                Zoom In
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                Zoom Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Terminal Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-1.5 text-gray-300 hover:bg-gray-800 rounded text-sm">
              <span>Terminal</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-600">
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                <Terminal className="w-4 h-4 mr-2" />
                New Terminal
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                Split Terminal
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-600" />
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                Clear Terminal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Center - Global Search */}
      <div className="flex-1 flex justify-center mx-8">
        <div className="relative max-w-xl w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search files, symbols, and more..."
            className="w-full bg-gray-800 text-gray-300 text-sm pl-12 pr-4 py-2.5 rounded-full border border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Right Side - Three Dots Menu */}
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 border-gray-600 w-56">
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
              <Eye className="w-4 h-4 mr-2" />
              Show Opened Editors
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-600" />
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Close All
              </div>
              <span className="text-xs text-gray-500">Ctrl+K W</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                Close Saved
              </div>
              <span className="text-xs text-gray-500">Ctrl+K U</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-600" />
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Enable Preview Editors
              </div>
              <Check className="w-4 h-4 text-purple-400" />
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-600" />
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
              <Lock className="w-4 h-4 mr-2" />
              Lock Group
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-600" />
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
              <Sliders className="w-4 h-4 mr-2" />
              Configure Editors
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-600" />
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
              <Play className="w-4 h-4 mr-2" />
              Run Project
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
              <Rocket className="w-4 h-4 mr-2" />
              Deploy
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-600" />
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}