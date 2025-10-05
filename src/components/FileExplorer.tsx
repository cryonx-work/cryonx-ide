import { Search, X, Upload, File, Folder } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { FileItem } from "./FileItem";

export interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  isOpen?: boolean;
  file?: File;
  path?: string;
  projectId?: string;
}

interface FileExplorerProps {
  onFileSelect: (node: FileNode) => void;
  projectId?: string;
}

// convert FileList -> FileNode tree
function buildFileTree(files: FileList, projectId: string): FileNode[] {
  const root: FileNode = {
    name: "root",
    type: "folder",
    children: [],
    isOpen: true,
  };

  Array.from(files).forEach((file) => {
    const f = file as File & { webkitRelativePath?: string };
    const parts = f.webkitRelativePath
      ? f.webkitRelativePath.split("/")
      : [f.name];

    let current = root;

    parts.forEach((part, idx) => {
      const isFile = idx === parts.length - 1;
      let child = current.children?.find((c) => c.name === part);

      if (!child) {
        child = {
          name: part,
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : [],
          isOpen: !isFile,
          file: isFile ? f : undefined,
          path: current.path ? `${current.path}/${part}` : part,
          projectId,
        };
        current.children?.push(child);
      }

      if (!isFile && child.children) current = child;
    });
  });

  return root.children || [];
}

export function FileExplorer({ onFileSelect, projectId }: FileExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // fetch files từ DB
  useEffect(() => {
    async function fetchFiles() {
      if (!projectId) return;
      const res = await fetch(`/api/files?projectId=${projectId}`);
      if (res.ok) {
        const files = await res.json();
        setFileTree(files);
      }
    }
    fetchFiles();
  }, [projectId]);

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
  const handleUploadFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!projectId) {
      alert("Chưa có projectId!");
      return;
    }

    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const path = (file as any).webkitRelativePath || file.name;
      const content = await file.text();

      await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          name: file.name,
          path,
          content,
          type: "file",
        }),
      });
    }

    // Reload fileTree after upload
    const res = await fetch(`/api/files?projectId=${projectId}`);
    if (res.ok) {
      const files = await res.json();
      setFileTree(files);
    }
  };

  // handle upload files
  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!projectId) {
      alert("Chưa có projectId!");
      return;
    }

    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const path = file.name;
      const content = await file.text();

      await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          name: file.name,
          path,
          content,
          type: "file",
        }),
      });
    }

    // Reload fileTree after upload
    const res = await fetch(`/api/files?projectId=${projectId}`);
    if (res.ok) {
      const files = await res.json();
      setFileTree(files);
    }
  };

  return (
    <div className="bg-gray-900 border-r border-gray-700 h-full flex flex-col">
      {/* header */}
      <div className="p-3 border-b border-gray-700 flex items-center justify-between gap-2">
        <h2 className="text-gray-300 font-medium text-sm">EXPLORER</h2>
        <div className="flex gap-1">
          {/* upload folder */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded flex items-center gap-1"
            >
              <Upload className="w-4 h-4" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
                {/* Upload Folder */}
                <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 cursor-pointer w-full">
                  <Folder className="w-4 h-4 text-gray-300" />
                  <span>Folder</span>
                  <input
                    type="file"
                    multiple
                    ref={folderInputRef}
                    hidden
                    onChange={handleUploadFolder}
                    // @ts-ignore: thuộc tính không được định nghĩa trong TS
                    webkitdirectory=""
                    // @ts-ignore
                    directory=""
                  />
                </label>

                {/* Upload File */}
                <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 cursor-pointer w-full">
                  <File className="w-4 h-4 text-gray-300" />
                  <span>File</span>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    hidden
                    onChange={handleUploadFiles}
                  />
                </label>
              </div>
            )}
          </div>
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
        {displayedTree.map((node) => (
          <FileItem
            key={node.path || node.name}
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
