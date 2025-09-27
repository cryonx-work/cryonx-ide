import { useState, useEffect, useRef } from 'react';

interface CodeEditorProps {
  fileName: string;
  content: string;
  onChange: (content: string) => void;
  searchTerm?: string;
}

export function CodeEditor({ fileName, content, onChange, searchTerm }: CodeEditorProps) {
  const [code, setCode] = useState(content);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  const [currentLine, setCurrentLine] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCode(content);
  }, [content]);

  useEffect(() => {
    const lines = code.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [code]);

  const handleCodeChange = (value: string) => {
    setCode(value);
    onChange(value);
  };

  const handleCursorPositionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const lineNumber = textBeforeCursor.split('\n').length;
    setCurrentLine(lineNumber);
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    handleCursorPositionChange(e);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleCursorPositionChange(e);
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-400 text-black">$1</mark>');
  };

    const extensionMap: Record<string, string> = {
    // Web
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    html: "html",
    css: "css",
    scss: "scss",
    less: "less",

    // Data
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",

    // Backend
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    go: "go",
    rs: "rust",

      // Smart contracts
    sol: "solidity",   // Ethereum
    vy: "vyper",       // Ethereum
    move: "move",      // Aptos, Sui, Cedra, Diem
    ink: "rust",       // Parity Substrate (smart contracts in Rust)
    clarity: "clarity",// Stacks
    cairo: "cairo",    // StarkNet

    // Shell & config
    sh: "shell",
    bash: "shell",
    md: "markdown",
    txt: "plaintext",
  };

  const getFileLanguage = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    return extensionMap[ext] || "plaintext";
  };


  return (
    <div className="flex-1 bg-gray-900 relative overflow-hidden">
      {/* Editor Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm">{fileName}</span>
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
              {getFileLanguage(fileName)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {code.split('\n').length} lines
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex h-full">
        {/* Line Numbers */}
        <div className="bg-gray-800 px-3 py-4 text-gray-500 text-sm font-mono min-w-fit border-r border-gray-700 select-none">
          {lineNumbers.map((num) => (
            <div 
              key={num} 
              className={`leading-6 text-right ${
                num === currentLine 
                  ? 'text-purple-400' 
                  : 'hover:text-purple-400 transition-colors'
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div className="flex-1 relative">
          {/* Background highlighting for current line */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="p-4 font-mono text-sm leading-6" style={{ fontFamily: 'Fira Code, Monaco, Consolas, monospace' }}>
              {code.split('\n').map((line, index) => (
                <div
                  key={index}
                  className={`leading-6 ${
                    index + 1 === currentLine 
                      ? 'bg-gray-700/60' 
                      : ''
                  }`}
                  style={{ minHeight: '1.5rem' }}
                >
                  &nbsp;
                </div>
              ))}
            </div>
          </div>
          
          <textarea
            ref={textareaRef}
            className="w-full h-full bg-transparent text-gray-100 p-4 font-mono text-sm leading-6 resize-none outline-none border-none relative z-10"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onClick={handleClick}
            onKeyUp={handleKeyUp}
            placeholder="Start typing your code..."
            spellCheck={false}
            style={{
              tabSize: 2,
              fontFamily: 'Fira Code, Monaco, Consolas, monospace',
            }}
          />
        </div>
      </div>

      {/* Syntax highlighting overlay would go here in a real editor */}
    </div>
  );
}