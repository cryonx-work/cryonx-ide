"use client";

import { useState } from "react";
import { Toolbar } from "../components/Toolbar";
import { ActivityBar } from "../components/ActivityBar";
import { SidePanel } from "../components/SidePanel";
import { TabBar } from "../components/TabBar";
import { CodeEditor } from "../components/CodeEditor";
import { Terminal } from "../components/Terminal";
import { StatusBar } from "../components/StatusBar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../components/ui/resizable";
import { FileNode } from '@/types/File'

interface Tab {
  id: string;
  name: string;
  content: string;
  isDirty: boolean;
}

const initialFiles: Record<string, string> = {
  "page.tsx": `import React from 'react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to React</h1>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;`,
  "index.ts": `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(<App />);`,
  "Button.tsx": `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}`,
  "package.json": `{
  "name": "my-react-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^4.9.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  }
}`,
};



export default function Home() {
    const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "page.tsx",
      name: "page.tsx",
      content: initialFiles["page.tsx"],
      isDirty: false,
    },
  ]);
  const [activeTab, setActiveTab] = useState("page.tsx");
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({
    line: 1,
    column: 1,
  });
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [activeActivityTab, setActiveActivityTab] = useState("explorer");
   const [panelSize, setPanelSize] = useState(20);

  const handleFileSelect = async (node: FileNode) => {
  if (node.type !== "file") return;

  // Check if tab already exists
  const existingTab = tabs.find((tab) => tab.id === node.name);

  if (existingTab) {
    setActiveTab(node.name);
  } else {
    // Lấy content từ File object nếu có
    let content: string;
    if (node.file) {
      content = await node.file.text();
    } else {
      content = `// ${node.name}\n\n// Start coding here...`;
    }

    const newTab: Tab = {
      id: node.name,
      name: node.name,
      content,
      isDirty: false,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTab(node.name);
  }
};


  const handleTabClose = (tabId: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    if (activeTab === tabId) {
      const remainingTab = newTabs[newTabs.length - 1];
      setActiveTab(remainingTab?.id || "");
    }
  };

  const handleCodeChange = (content: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab
          ? { ...tab, content, isDirty: true }
          : tab,
      ),
    );
  };

  const activeTabData = tabs.find(
    (tab) => tab.id === activeTab,
  );

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Toolbar onGlobalSearch={setGlobalSearchTerm} />

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar 
          activeTab={activeActivityTab} 
          onTabChange={setActiveActivityTab} 
        />

        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1"
        >
          <ResizablePanel
            defaultSize={20}
            minSize={0}
            maxSize={40}
            onResize={(size) => {
              if (size < 10) {
                
                setPanelSize(-1);
              } else {
                setPanelSize(size);
              }
            }}
          >
            <SidePanel 
              activeTab={activeActivityTab} 
              onFileSelect={handleFileSelect} 
            />
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-gray-700 hover:bg-purple-500 transition-colors" />

          <ResizablePanel defaultSize={80}>
            <div className="flex flex-col h-full">
              {tabs.length > 0 && (
                <TabBar
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabSelect={setActiveTab}
                  onTabClose={handleTabClose}
                />
              )}

              <div className="flex-1 flex flex-col">
                {activeTabData ? (
                  <CodeEditor
                    fileName={activeTabData.name}
                    content={activeTabData.content}
                    onChange={handleCodeChange}
                    searchTerm={globalSearchTerm}
                  />
                ) : (
                  <div className="flex-1 bg-gray-900 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <h2 className="text-xl mb-2">
                        Welcome to CryonX IDE
                      </h2>
                      <p>
                        Select a file from the explorer to start
                        coding
                      </p>
                    </div>
                  </div>
                )}

                <Terminal
                  isOpen={isTerminalOpen}
                  onToggle={() =>
                    setIsTerminalOpen(!isTerminalOpen)
                  }
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <div className="flex items-center justify-between">
        <button
          className="px-3 py-1 bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs border-r border-gray-700"
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
        >
          Terminal {isTerminalOpen ? "−" : "+"}
        </button>

        <StatusBar
          activeFile={activeTabData?.name || ""}
          lineNumber={cursorPosition.line}
          columnNumber={cursorPosition.column}
        />
      </div>
    </div>
  );
}
