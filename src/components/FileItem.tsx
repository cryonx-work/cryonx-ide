import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { FileNode } from '@/types/File'

interface FileItemProps {
  node: FileNode;
  level: number;
  onFileSelect: (node : FileNode) => void;
  onToggleFolder: (path: string) => void;
  path: string;
}


export function FileItem({ node, level, onFileSelect, onToggleFolder, path }: FileItemProps) {
  const currentPath = path ? `${path}/${node.name}` : node.name;
  
  const handleClick = () => {
    if (node.type === 'folder') {
      onToggleFolder(currentPath);
    } else {
      onFileSelect(node);
    }
  };

  return (
    <div>
      <div
        className="flex items-center py-1 px-2 hover:bg-gray-800 cursor-pointer text-gray-300 text-sm"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'folder' && (
          <>
            {node.isOpen ? (
              <ChevronDown className="w-4 h-4 mr-1 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-1 text-gray-400" />
            )}
            {node.isOpen ? (
              <FolderOpen className="w-4 h-4 mr-2 text-purple-400" />
            ) : (
              <Folder className="w-4 h-4 mr-2 text-purple-400" />
            )}
          </>
        )}
        {node.type === 'file' && (
          <File className="w-4 h-4 mr-2 text-gray-400 ml-5" />
        )}
        <span className={node.type === 'folder' ? 'text-purple-300' : 'text-gray-300'}>
          {node.name}
        </span>
      </div>
      
      {node.type === 'folder' && node.isOpen && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileItem
              key={index}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              onToggleFolder={onToggleFolder}
              path={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

