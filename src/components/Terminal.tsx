import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Minus } from 'lucide-react';

interface TerminalProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Terminal({ isOpen, onToggle }: TerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    '$ Welcome to CryonX IDE Terminal',
    '$ Type "help" for available commands',
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = (command: string) => {
    const cmd = command.trim().toLowerCase();
    let output = '';

    switch (cmd) {
      case 'help':
        output = `Available commands:
  help     - Show this help message
  clear    - Clear terminal
  ls       - List files
  pwd      - Show current directory
  date     - Show current date
  whoami   - Show current user
  version  - Show IDE version`;
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'ls':
        output = 'src/  public/  package.json  tsconfig.json';
        break;
      case 'pwd':
        output = '/workspace/my-project';
        break;
      case 'date':
        output = new Date().toString();
        break;
      case 'whoami':
        output = 'developer';
        break;
      case 'version':
        output = 'CodeIDE v1.0.0';
        break;
      case '':
        break;
      default:
        output = `Command not found: ${command}. Type "help" for available commands.`;
    }

    setHistory(prev => [
      ...prev,
      `$ ${command}`,
      ...(output ? output.split('\n') : [])
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setCommandHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-gray-900 border-t border-gray-700" style={{ height: '300px' }}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-4 h-4 text-green-400" />
          <span className="text-gray-300 text-sm">Terminal</span>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded">
            <Minus className="w-3 h-3" />
          </button>
          <button 
            className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded"
            onClick={onToggle}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex flex-col h-full">
        {/* History */}
        <div
          ref={historyRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-sm text-gray-100"
        >
          {history.map((line, index) => (
            <div
              key={index}
              className={line.startsWith('$') ? 'text-green-400' : 'text-gray-300'}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center p-4 border-t border-gray-700">
          <span className="text-green-400 font-mono text-sm mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-gray-100 font-mono text-sm outline-none"
            placeholder="Type a command..."
          />
        </form>
      </div>
    </div>
  );
}