import React from "react";
import { FileSystemItem } from "@/types";
import {
    FilePlus,
    FolderPlus,
    Edit2,
    Copy,
    Trash2,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    ChevronRight,
    ChevronDown,
} from "lucide-react";
import { ContextMenuState } from "../hooks/useFileTreeActions";
import { collabService } from "@/services";
import { useIDE } from "@/hooks";

interface FileTreeContextMenuItemProps {
    contextMenu: ContextMenuState;
    setContextMenu: (state: ContextMenuState) => void;
    contextItem: FileSystemItem;
    handleCreateFromAction: (
        type: "file" | "folder",
        parentId?: string | null
    ) => void;
    startRenaming: (id: string, currentName: string) => void;
    handleCopyPath: (id: string) => void;
    deleteItem: (id: string) => void;
}

const FileTreeContextMenuItem: React.FC<FileTreeContextMenuItemProps> = ({
    contextMenu,
    setContextMenu,
    contextItem,
    handleCreateFromAction,
    startRenaming,
    handleCopyPath,
    deleteItem,
}) => {
    const { collab } = useIDE();
    const isHost = collab.isCollabActive && collab.role === "host";

    const handleToggleLock = (
        type: "isLocked" | "isReadOnly" | "isExpandLocked"
    ) => {
        collabService.toggleFileLock(contextItem.id, type, !contextItem[type]);
        setContextMenu({ ...contextMenu, visible: false });
    };

    return (
        <>
            <div className="px-3 py-2 text-xs text-gray-500 border-b border-white/5 mb-1 font-bold truncate max-w-[200px]">
                {contextItem.name}
            </div>

            {isHost && (
                <>
                    <button
                        onClick={() => {
                            if (collab.isProjectLocked) {
                                collabService.toggleProjectLock(false);
                            } else {
                                handleToggleLock("isLocked");
                            }
                            setContextMenu({
                                ...contextMenu,
                                visible: false,
                            });
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cryonx-accent/20 hover:text-cryonx-glow flex items-center gap-2"
                    >
                        {contextItem.isLocked || collab.isProjectLocked ? (
                            <Unlock size={14} />
                        ) : (
                            <Lock size={14} />
                        )}
                        {collab.isProjectLocked
                            ? "Unlock Project"
                            : contextItem.isLocked
                            ? "Unlock Item"
                            : "Lock Item"}
                    </button>

                    {contextItem.type === "file" && (
                        <button
                            onClick={() => {
                                if (collab.isProjectLocked) {
                                    collabService.toggleProjectLock(false);
                                } else {
                                    handleToggleLock("isReadOnly");
                                }
                                setContextMenu({
                                    ...contextMenu,
                                    visible: false,
                                });
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cryonx-accent/20 hover:text-cryonx-glow flex items-center gap-2"
                        >
                            {contextItem.isReadOnly ||
                            collab.isProjectLocked ? (
                                <Eye size={14} />
                            ) : (
                                <EyeOff size={14} />
                            )}
                            {collab.isProjectLocked
                                ? "Unlock Project"
                                : contextItem.isReadOnly
                                ? "Unlock Content"
                                : "Lock Content"}
                        </button>
                    )}

                    {contextItem.type === "folder" && (
                        <button
                            onClick={() => handleToggleLock("isExpandLocked")}
                            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cryonx-accent/20 hover:text-cryonx-glow flex items-center gap-2"
                        >
                            {contextItem.isExpandLocked ? (
                                <ChevronDown size={14} />
                            ) : (
                                <ChevronRight size={14} />
                            )}
                            {contextItem.isExpandLocked
                                ? "Unlock Expand"
                                : "Lock Expand"}
                        </button>
                    )}
                    <div className="h-px bg-white/5 my-1" />
                </>
            )}

            {contextItem.type === "folder" && (
                <>
                    <button
                        onClick={() => {
                            handleCreateFromAction("file", contextItem.id);
                            setContextMenu({
                                ...contextMenu,
                                visible: false,
                            });
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cryonx-accent/20 hover:text-cryonx-glow flex items-center gap-2"
                    >
                        <FilePlus size={14} /> New File
                    </button>
                    <button
                        onClick={() => {
                            handleCreateFromAction("folder", contextItem.id);
                            setContextMenu({
                                ...contextMenu,
                                visible: false,
                            });
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cryonx-accent/20 hover:text-cryonx-glow flex items-center gap-2"
                    >
                        <FolderPlus size={14} /> New Folder
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                </>
            )}
            <button
                onClick={() => startRenaming(contextItem.id, contextItem.name)}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cryonx-accent/20 hover:text-cryonx-glow flex items-center gap-2"
            >
                <Edit2 size={14} /> Rename
            </button>
            <button
                onClick={() => {
                    handleCopyPath(contextItem.id);
                    setContextMenu({ ...contextMenu, visible: false });
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cryonx-accent/20 hover:text-cryonx-glow flex items-center gap-2"
            >
                <Copy size={14} /> Copy Path
            </button>
            <div className="h-px bg-white/5 my-1" />
            <button
                onClick={() => {
                    deleteItem(contextItem.id);
                    setContextMenu({ ...contextMenu, visible: false });
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
            >
                <Trash2 size={14} /> Delete
            </button>
        </>
    );
};

export default FileTreeContextMenuItem;
