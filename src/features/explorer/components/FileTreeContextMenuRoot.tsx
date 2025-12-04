import React from "react";
import { FilePlus, FolderPlus, XCircle, Lock, Unlock } from "lucide-react";
import { ContextMenuState } from "../hooks/useFileTreeActions";
import { collabService } from "@/services";
import { useIDE } from "@/hooks";

interface FileTreeContextMenuRootProps {
    contextMenu: ContextMenuState;
    setContextMenu: (state: ContextMenuState) => void;
    activeProjectName?: string;
    handleCreateFromAction: (
        type: "file" | "folder",
        parentId?: string | null
    ) => void;
    handleCloseProject: () => void;
}

const FileTreeContextMenuRoot: React.FC<FileTreeContextMenuRootProps> = ({
    contextMenu,
    setContextMenu,
    activeProjectName,
    handleCreateFromAction,
    handleCloseProject,
}) => {
    const { collab } = useIDE();
    const isHost = collab.isCollabActive && collab.role === "host";

    return (
        <>
            <div className="px-3 py-2 text-xs text-cryonx-glow border-b border-white/5 mb-1 font-bold truncate max-w-[200px]">
                {activeProjectName}
            </div>
            {isHost && (
                <>
                    <button
                        onClick={() => {
                            collabService.toggleProjectLock(
                                !collab.isProjectLocked
                            );
                            setContextMenu({
                                ...contextMenu,
                                visible: false,
                            });
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cryonx-accent/20 hover:text-cryonx-glow flex items-center gap-2"
                    >
                        {collab.isProjectLocked ? (
                            <Unlock size={14} />
                        ) : (
                            <Lock size={14} />
                        )}
                        {collab.isProjectLocked
                            ? "Unlock Project"
                            : "Lock Project"}
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                </>
            )}
            <button
                onClick={() => {
                    handleCreateFromAction("file", null);
                    setContextMenu({ ...contextMenu, visible: false });
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cryonx-accent/20 hover:text-cryonx-glow flex items-center gap-2"
            >
                <FilePlus size={14} /> New File
            </button>
            <button
                onClick={() => {
                    handleCreateFromAction("folder", null);
                    setContextMenu({ ...contextMenu, visible: false });
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-cryonx-accent/20 hover:text-cryonx-glow flex items-center gap-2"
            >
                <FolderPlus size={14} /> New Folder
            </button>
            <div className="h-px bg-white/5 my-1" />
            <button
                onClick={handleCloseProject}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
            >
                <XCircle size={14} /> Close Project
            </button>
        </>
    );
};

export default FileTreeContextMenuRoot;
