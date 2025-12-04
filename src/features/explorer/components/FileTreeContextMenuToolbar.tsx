import React from "react";
import { FilePlus, FolderPlus, RefreshCw, Minimize2 } from "lucide-react";
import { ContextMenuState } from "../hooks/useFileTreeActions";

interface FileTreeContextMenuToolbarProps {
    contextMenu: ContextMenuState;
    setContextMenu: (state: ContextMenuState) => void;
    handleCreateFromAction: (
        type: "file" | "folder",
        parentId?: string | null
    ) => void;
    handleRefresh: (e: React.MouseEvent) => void;
    handleCollapseAll: (e: React.MouseEvent) => void;
}

const FileTreeContextMenuToolbar: React.FC<FileTreeContextMenuToolbarProps> = ({
    contextMenu,
    setContextMenu,
    handleCreateFromAction,
    handleRefresh,
    handleCollapseAll,
}) => {
    return (
        <>
            <button
                onClick={() => {
                    handleCreateFromAction("file");
                    setContextMenu({ ...contextMenu, visible: false });
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cryonx-accent/20 hover:text-cryonx-glow flex items-center gap-2"
            >
                <FilePlus size={14} /> New File
            </button>
            <button
                onClick={() => {
                    handleCreateFromAction("folder");
                    setContextMenu({ ...contextMenu, visible: false });
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cryonx-accent/20 hover:text-cryonx-glow flex items-center gap-2"
            >
                <FolderPlus size={14} /> New Folder
            </button>
            <div className="h-px bg-white/5 my-1" />
            <button
                onClick={handleRefresh}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cryonx-accent/20 hover:text-cryonx-glow flex items-center gap-2"
            >
                <RefreshCw size={14} /> Refresh
            </button>
            <button
                onClick={handleCollapseAll}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cryonx-accent/20 hover:text-cryonx-glow flex items-center gap-2"
            >
                <Minimize2 size={14} /> Collapse All
            </button>
        </>
    );
};

export default FileTreeContextMenuToolbar;
