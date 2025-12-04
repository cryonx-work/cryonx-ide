import React from "react";
import { FileSystemItem } from "@/types";
import { ContextMenuState } from "../hooks/useFileTreeActions";
import { ROOT_PROJECT_ID } from "@/config";

import FileTreeContextMenuToolbar from "./FileTreeContextMenuToolbar";
import FileTreeContextMenuRoot from "./FileTreeContextMenuRoot";
import FileTreeContextMenuItem from "./FileTreeContextMenuItem";

interface FileTreeContextMenuProps {
    contextMenu: ContextMenuState;
    setContextMenu: (state: ContextMenuState) => void;
    items: FileSystemItem[];
    activeProjectName?: string;
    handleCreateFromAction: (
        type: "file" | "folder",
        parentId?: string | null
    ) => void;
    handleRefresh: (e: React.MouseEvent) => void;
    handleCollapseAll: (e: React.MouseEvent) => void;
    handleCloseProject: () => void;
    startRenaming: (id: string, currentName: string) => void;
    handleCopyPath: (id: string) => void;
    deleteItem: (id: string) => void;
}

const FileTreeContextMenu: React.FC<FileTreeContextMenuProps> = ({
    contextMenu,
    setContextMenu,
    items,
    activeProjectName,
    handleCreateFromAction,
    handleRefresh,
    handleCollapseAll,
    handleCloseProject,
    startRenaming,
    handleCopyPath,
    deleteItem,
}) => {
    if (!contextMenu.visible) return null;

    const contextItem =
        contextMenu.itemId && contextMenu.itemId !== ROOT_PROJECT_ID
            ? items.find((i) => i.id === contextMenu.itemId)
            : null;
    const isRootProject = contextMenu.itemId === ROOT_PROJECT_ID;

    return (
        <div
            className="fixed z-50 bg-[#151923] border border-white/10 rounded-lg shadow-2xl py-1 min-w-40 backdrop-blur-md animate-fadeIn overflow-hidden"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {contextMenu.type === "toolbar-overflow" ? (
                <FileTreeContextMenuToolbar
                    contextMenu={contextMenu}
                    setContextMenu={setContextMenu}
                    handleCreateFromAction={handleCreateFromAction}
                    handleRefresh={handleRefresh}
                    handleCollapseAll={handleCollapseAll}
                />
            ) : isRootProject ? (
                <FileTreeContextMenuRoot
                    contextMenu={contextMenu}
                    setContextMenu={setContextMenu}
                    activeProjectName={activeProjectName}
                    handleCreateFromAction={handleCreateFromAction}
                    handleCloseProject={handleCloseProject}
                />
            ) : contextItem ? (
                <FileTreeContextMenuItem
                    contextMenu={contextMenu}
                    setContextMenu={setContextMenu}
                    contextItem={contextItem}
                    handleCreateFromAction={handleCreateFromAction}
                    startRenaming={startRenaming}
                    handleCopyPath={handleCopyPath}
                    deleteItem={deleteItem}
                />
            ) : null}
        </div>
    );
};

export default FileTreeContextMenu;
