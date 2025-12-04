import React from "react";
import { FileSystemItem, Collaborator, GitChange } from "@/types";
import FileTreeItem from "./FileTreeItem";
import FileTreeCreationInput from "./FileTreeCreationInput";
import { CreationState } from "../hooks/useFileTreeActions";

interface FileTreeListProps {
    items: FileSystemItem[];
    openFolders: Set<string>;
    selectedExplorerId: string | null;
    renamingId: string | null;
    renameValue: string;
    setRenameValue: (value: string) => void;
    renameInputRef: React.RefObject<HTMLInputElement | null>;
    handleRenameSubmit: () => void;
    handleItemClick: (e: React.MouseEvent, item: FileSystemItem) => void;
    handleContextMenu: (e: React.MouseEvent, id: string) => void;
    handleDragStart: (e: React.DragEvent, item: FileSystemItem) => void;
    handleDragEnd: () => void;
    handleDragOver: (e: React.DragEvent, item: FileSystemItem | null) => void;
    handleDrop: (e: React.DragEvent, item: FileSystemItem | null) => void;
    dragOverId: string | null;
    creationState: CreationState | null;
    creationName: string;
    setCreationName: (name: string) => void;
    creationInputRef: React.RefObject<HTMLInputElement | null>;
    handleCreationSubmit: () => void;
    setCreationState: (state: CreationState | null) => void;
    collab: {
        collaborators: Collaborator[];
        isProjectLocked: boolean;
        isCollabActive: boolean;
    };
    gitChanges?: GitChange[];
    gitStaged?: GitChange[];
}

const FileTreeList: React.FC<FileTreeListProps> = ({
    items,
    openFolders,
    selectedExplorerId,
    renamingId,
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
    dragOverId,
    creationState,
    creationName,
    setCreationName,
    creationInputRef,
    handleCreationSubmit,
    setCreationState,
    collab,
    gitChanges,
    gitStaged,
}) => {
    const gitStatusMap = React.useMemo(() => {
        const map = new Map<string, { status: string; staged: boolean }>();
        if (gitChanges) {
            gitChanges.forEach((c) =>
                map.set(c.path, { status: c.status, staged: false })
            );
        }
        if (gitStaged) {
            gitStaged.forEach((c) => {
                // Staged status takes precedence or merges?
                // For now, if it's in staged, we mark it as staged.
                // If it was already in unstaged (e.g. modified in both), we might want to show both or prioritize one.
                // Let's prioritize staged for the badge color/letter if it exists there.
                map.set(c.path, { status: c.status, staged: true });
            });
        }
        return map;
    }, [gitChanges, gitStaged]);

    const renderTree = (
        parentId: string | null,
        depth: number = 0,
        parentPath: string = ""
    ) => {
        const children = items.filter((item) => item.parentId === parentId);

        children.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === "folder" ? -1 : 1;
        });

        const showCreationInput =
            creationState && creationState.parentId === parentId;

        if (children.length === 0 && !showCreationInput) return null;

        return (
            <>
                {showCreationInput && (
                    <FileTreeCreationInput
                        depth={depth}
                        creationState={creationState}
                        creationName={creationName}
                        setCreationName={setCreationName}
                        handleCreationSubmit={handleCreationSubmit}
                        setCreationState={setCreationState}
                        creationInputRef={creationInputRef}
                    />
                )}
                {children.map((item) => {
                    const viewers = collab.collaborators.filter(
                        (c) => c.fileId === item.id
                    );
                    const currentPath = parentPath
                        ? `${parentPath}/${item.name}`
                        : item.name;
                    const gitStatus = gitStatusMap.get(currentPath);

                    return (
                        <FileTreeItem
                            key={item.id}
                            item={item}
                            depth={depth}
                            isOpen={openFolders.has(item.id)}
                            isSelected={selectedExplorerId === item.id}
                            isRenaming={renamingId === item.id}
                            isDragOver={dragOverId === item.id}
                            renameValue={renameValue}
                            setRenameValue={setRenameValue}
                            renameInputRef={renameInputRef}
                            handleRenameSubmit={handleRenameSubmit}
                            handleItemClick={handleItemClick}
                            handleContextMenu={handleContextMenu}
                            handleDragStart={handleDragStart}
                            handleDragEnd={handleDragEnd}
                            handleDragOver={handleDragOver}
                            handleDrop={handleDrop}
                            renderTree={renderTree}
                            viewers={viewers}
                            isProjectLocked={collab.isProjectLocked}
                            isCollabActive={collab.isCollabActive}
                            gitStatus={gitStatus}
                            fullPath={currentPath}
                        />
                    );
                })}
            </>
        );
    };

    return <>{renderTree(null)}</>;
};

export default FileTreeList;
