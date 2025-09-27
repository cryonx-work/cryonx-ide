import { FileExplorer } from './FileExplorer';
import { SearchPanel } from './SearchPanel';
import { SourceControlPanel } from './SourceControlPanel';
import { RunDebugPanel } from './RunDebugPanel';
import { ExtensionsPanel } from './ExtensionsPanel';
import { DeployPanel } from './DeployPanel';
import { ConnectWalletPanel } from './ConnectWalletPanel';

interface SidePanelProps {
  activeTab: string;
  onFileSelect: (node: FileNode) => void;
}

export function SidePanel({ activeTab, onFileSelect }: SidePanelProps) {
  const renderPanel = () => {
    switch (activeTab) {
      case 'explorer':
        return <FileExplorer onFileSelect={onFileSelect} />;
      case 'search':
        return <SearchPanel />;
      case 'source-control':
        return <SourceControlPanel />;
      case 'run-debug':
        return <RunDebugPanel />;
      case 'extensions':
        return <ExtensionsPanel />;
      case 'deploy':
        return <DeployPanel />;
      case 'connect-wallet':
        return <ConnectWalletPanel />;
      default:
        return <FileExplorer onFileSelect={onFileSelect} />;
    }
  };

  return (
    <div className="h-full bg-gray-800 border-r border-gray-700">
      {renderPanel()}
    </div>
  );
}