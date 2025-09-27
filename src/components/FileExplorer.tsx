"use client";
import { Search, X, Upload } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { FileItem } from "./FileItem";
import { FileNode } from '@/types/File'



interface FileExplorerProps {
  onFileSelect: (node: FileNode) => void;
}

// convert FileList -> FileNode tree
function buildFileTree(files: FileList): FileNode[] {
  const root: FileNode = { name: "root", type: "folder", children: [], isOpen: true, file: [] };

  Array.from(files).forEach((file) => {
    const f = file as File & { webkitRelativePath: string };
    const parts = f.webkitRelativePath.split("/");

    let current = root;

    parts.forEach((part, idx) => {
      const isFile = idx === parts.length - 1;
      let child = current.children!.find((c) => c.name === part);

      if (!child) {
        child = {
          name: part,
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : [],
          isOpen: !isFile,
          file: isFile ? f : undefined, 
        };
        current.children!.push(child);
      }

      if (!isFile) current = child;
    });
  });

  return root.children!;
}



export function FileExplorer({ onFileSelect }: FileExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);

  // toggle folder open/close
  const toggleFolder = (path: string) => {
    const updateNodes = (nodes: FileNode[], parentPath = ""): FileNode[] =>
      nodes.map((node) => {
        const nodePath = parentPath ? `${parentPath}/${node.name}` : node.name;
        if (nodePath === path && node.type === "folder") {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children, nodePath) };
        }
        return node;
      });

    setFileTree((prev) => updateNodes(prev));
  };

  // filter search
  const filterNodes = (nodes: FileNode[], searchTerm: string): FileNode[] => {
    if (!searchTerm) return nodes;

    return nodes.reduce((acc: FileNode[], node) => {
      if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        acc.push({ ...node, isOpen: true });
      } else if (node.children) {
        const filteredChildren = filterNodes(node.children, searchTerm);
        if (filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren, isOpen: true });
        }
      }
      return acc;
    }, []);
  };

  const displayedTree = isSearchOpen
    ? filterNodes(fileTree, searchTerm)
    : fileTree;

  // handle upload folder
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const tree = buildFileTree(files);
    setFileTree(tree);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute("webkitdirectory", "");
    }
  }, []);

  return (
    <div className="bg-gray-900 border-r border-gray-700 h-full flex flex-col">
      {/* header */}
      <div className="p-3 border-b border-gray-700 flex items-center justify-between gap-2">
        <h2 className="text-gray-300 font-medium text-sm">EXPLORER</h2>
        <div className="flex gap-1">
          {/* upload folder */}
          <label className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded cursor-pointer">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              multiple
              ref={inputRef}
              hidden
              onChange={handleUpload}
            />
          </label>
          {/* search toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* search box */}
      {isSearchOpen && (
        <div className="p-3 border-b border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-gray-800 text-gray-300 text-sm px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none pr-8"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {displayedTree.map((node, index) => (
          <FileItem
            key={index}
            node={node}
            level={0}
            onFileSelect={onFileSelect}
            onToggleFolder={toggleFolder}
            path=""
          />
        ))}

        {isSearchOpen && searchTerm && displayedTree.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-4">
            No files found matching &quot;{searchTerm}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
