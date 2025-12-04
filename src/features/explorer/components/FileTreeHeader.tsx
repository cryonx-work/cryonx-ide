import React from "react";
import {
    ChevronRight,
    MoreHorizontal,
    FilePlus,
    FolderPlus,
    RefreshCw,
    Minimize2,
    Lock,
} from "lucide-react";
import { ROOT_PROJECT_ID } from "@/config";

interface FileTreeHeaderProps {
    projectName: string;
    isProjectExpanded: boolean;
    isProjectSelected: boolean;
    isProjectLocked?: boolean;
    isCollabActive?: boolean;
    isNarrow: boolean;
    handleHeaderClick: (e: React.MouseEvent) => void;
    handleContextMenu: (e: React.MouseEvent, id: string) => void;
    handleToolbarOverflow: (e: React.MouseEvent) => void;
    handleCreateFromAction: (
        type: "file" | "folder",
        parentId?: string | null
    ) => void;
    handleRefresh: (e: React.MouseEvent) => void;
    handleCollapseAll: (e: React.MouseEvent) => void;
}

const FileTreeHeader: React.FC<FileTreeHeaderProps> = ({
    projectName,
    isProjectExpanded,
    isProjectSelected,
    isProjectLocked,
    isCollabActive,
    isNarrow,
    handleHeaderClick,
    handleContextMenu,
    handleToolbarOverflow,
    handleCreateFromAction,
    handleRefresh,
    handleCollapseAll,
}) => {
    return (
        <div
            className={`group px-2 py-2 flex items-center gap-1 text-xs font-bold cursor-pointer shrink-0 border-b border-white/5 z-10 select-none transition-colors border-l-2
        ${
            isProjectSelected
                ? "bg-cryonx-accent/10 border-cryonx-accent text-white"
                : "border-transparent text-gray-300 hover:bg-white/5 bg-[#0d1017]"
        }`}
            onClick={handleHeaderClick}
            onContextMenu={(e) => handleContextMenu(e, ROOT_PROJECT_ID)}
        >
            {/* Toggle Arrow */}
            <div className="w-4 h-4 flex items-center justify-center hover:text-white shrink-0">
                <ChevronRight
                    size={14}
                    className={`transition-transform duration-300 ${
                        isProjectExpanded ? "rotate-90" : "rotate-0"
                    }`}
                />
            </div>

            <span className="uppercase truncate flex-1 flex items-center gap-2">
                {projectName}
                {isCollabActive && isProjectLocked && (
                    <Lock size={12} className="text-red-400" />
                )}
            </span>

            {/* Toolbar Buttons (Visible on Hover) */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {isNarrow ? (
                    <button
                        onClick={handleToolbarOverflow}
                        className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                    >
                        <MoreHorizontal size={14} />
                    </button>
                ) : (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCreateFromAction("file");
                            }}
                            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-cryonx-glow"
                            title="New File"
                        >
                            <FilePlus size={14} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCreateFromAction("folder");
                            }}
                            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-cryonx-glow"
                            title="New Folder"
                        >
                            <FolderPlus size={14} />
                        </button>
                        <button
                            onClick={handleRefresh}
                            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-cryonx-glow"
                            title="Refresh"
                        >
                            <RefreshCw size={14} />
                        </button>
                        <button
                            onClick={handleCollapseAll}
                            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-cryonx-glow"
                            title="Collapse All"
                        >
                            <Minimize2 size={14} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default FileTreeHeader;
