import React from "react";
import { FileSystemItem, Collaborator } from "@/types";
import {
    ChevronRight,
    Folder,
    Lock,
    EyeOff,
    ShieldBan,
    FileText,
} from "lucide-react";
import {
    GitStatusBadge,
    getGitColor,
} from "@/components";
import { FileIcon } from "@/components";

interface FileTreeItemProps {
    item: FileSystemItem;
    depth: number;
    isOpen: boolean;
    isSelected: boolean;
    isRenaming: boolean;
    isDragOver: boolean;
    renameValue: string;
    setRenameValue: (value: string) => void;
    renameInputRef: React.RefObject<HTMLInputElement | null>;
    handleRenameSubmit: () => void;
    handleItemClick: (e: React.MouseEvent, item: FileSystemItem) => void;
    handleContextMenu: (e: React.MouseEvent, id: string) => void;
    handleDragStart: (e: React.DragEvent, item: FileSystemItem) => void;
    handleDragEnd: () => void;
    handleDragOver: (e: React.DragEvent, item: FileSystemItem) => void;
    handleDrop: (e: React.DragEvent, item: FileSystemItem) => void;
    renderTree: (
        parentId: string | null,
        depth: number,
        parentPath?: string
    ) => React.ReactNode;
    viewers?: Collaborator[];
    isProjectLocked?: boolean;
    isCollabActive?: boolean;
    gitStatus?: { status: string; staged: boolean };
    fullPath?: string;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
    item,
    depth,
    isOpen,
    isSelected,
    isRenaming,
    isDragOver,
    renameValue,
    setRenameValue,
    renameInputRef,
    handleRenameSubmit,
    handleItemClick,
    handleContextMenu,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    renderTree,
    viewers = [],
    isProjectLocked = false,
    isCollabActive = false,
    gitStatus,
    fullPath,
}) => {
    return (
        <div className="select-none relative">
            {/* Indentation Lines */}
            {depth > 0 && (
                <div
                    className="absolute top-0 bottom-0 border-l border-white/5 pointer-events-none"
                    style={{ left: `${depth * 12 + 10}px` }}
                />
            )}

            <div
                draggable={true}
                onDragStart={(e) => handleDragStart(e, item)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, item)}
                onDrop={(e) => handleDrop(e, item)}
                className={`
                flex items-center gap-1 py-1.5 cursor-pointer transition-all border-l-2 relative
                ${
                    isSelected
                        ? "bg-cryonx-accent/10 border-cryonx-accent text-white"
                        : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }
                ${
                    isDragOver
                        ? "bg-cryonx-accent/20 border-l-cryonx-glow shadow-[inset_0_0_10px_rgba(124,58,237,0.2)]"
                        : ""
                }
            `}
                style={{ paddingLeft: `${depth * 12 + 12}px` }}
                onClick={(e) => handleItemClick(e, item)}
                onContextMenu={(e) => handleContextMenu(e, item.id)}
            >
                {/* Arrow / Spacer */}
                <div className="shrink-0 cursor-pointer hover:text-white w-4 h-4 flex items-center justify-center mr-0.5">
                    {item.type === "folder" ? (
                        <ChevronRight
                            size={14}
                            className={`transition-transform duration-300 ease-in-out ${
                                isOpen ? "rotate-90" : "rotate-0"
                            }`}
                        />
                    ) : (
                        <div className="w-3" />
                    )}
                </div>

                {/* File/Folder Icon */}
                <div className="shrink-0 mr-1.5 relative flex items-center justify-center">
                    {item.type === "folder" ? (
                        <Folder
                            size={16}
                            className={`transition-colors duration-200 ${
                                isOpen || isSelected
                                    ? "text-cryonx-text fill-cryonx-accent/20"
                                    : "text-gray-500"
                            }`}
                        />
                    ) : (
                        <>
                            <FileIcon name={item.name} />
                            <FileText className="w-4 h-4 text-gray-400 absolute hidden fallback-icon" />
                        </>
                    )}
                </div>

                {/* Name / Rename Input */}
                {isRenaming ? (
                    <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={(e) =>
                            e.key === "Enter" && handleRenameSubmit()
                        }
                        className="bg-black/50 border border-cryonx-accent/50 text-white text-sm px-1 py-0 rounded w-full focus:outline-none h-5 leading-none"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div className="truncate text-sm tracking-tight flex-1 flex items-center gap-2">
                        <span
                            className={getGitColor(
                                gitStatus?.status === "new" && gitStatus?.staged
                                    ? "added"
                                    : gitStatus?.status
                            )}
                        >
                            {item.name}
                        </span>
                        <GitStatusBadge
                            status={gitStatus?.status}
                            staged={gitStatus?.staged}
                        />
                        <div className="flex items-center gap-1">
                            {(item.isReadOnly ||
                                (isCollabActive &&
                                    (item.isLocked || isProjectLocked))) && (
                                <Lock size={10} className="text-red-400" />
                            )}
                            {isCollabActive &&
                                (item.isReadOnly ||
                                    (isProjectLocked &&
                                        item.type === "file")) && (
                                    <EyeOff
                                        size={10}
                                        className="text-yellow-400"
                                    />
                                )}
                            {isCollabActive && item.isExpandLocked && (
                                <ShieldBan
                                    size={10}
                                    className="text-orange-400"
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Viewers Avatars */}
                {viewers.length > 0 && (
                    <div className="flex -space-x-1 mr-2 shrink-0">
                        {viewers.map((viewer) => (
                            <div
                                key={viewer.id}
                                className="w-4 h-4 rounded-full border border-[#0d1017] flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                                style={{ backgroundColor: viewer.color }}
                                title={`${viewer.name} is viewing this file`}
                            >
                                {viewer.name.charAt(0).toUpperCase()}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Animated Children Container */}
            {item.type === "folder" && (
                <div
                    className={`
                    grid transition-[grid-template-rows,opacity] duration-300 ease-in-out
                    ${
                        isOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                    }
                `}
                >
                    <div className="overflow-hidden">
                        {renderTree(item.id, depth + 1, fullPath)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileTreeItem;
