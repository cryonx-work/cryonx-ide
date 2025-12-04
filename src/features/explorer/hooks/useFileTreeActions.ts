import { useState, useRef, useEffect } from 'react';
import { useIDE } from '@/hooks';
import { ROOT_PROJECT_ID } from '@/config';

export interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    itemId: string | null;
    type?: "default" | "toolbar-overflow";
}

export interface CreationState {
    type: "file" | "folder";
    parentId: string | null;
}

export const useFileTreeActions = (
    selectedExplorerId: string | null,
    setSelectedExplorerId: (id: string | null) => void,
    setOpenFolders: React.Dispatch<React.SetStateAction<Set<string>>>
) => {
    const { fileSystem, ui, projects, collab } = useIDE();
    const {
        items,
        createItem,
        renameItem,
        deleteItem,
        getFullPath,
    } = fileSystem;

    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        itemId: null,
    });
    const [creationState, setCreationState] = useState<CreationState | null>(null);
    const [creationName, setCreationName] = useState("");

    const renameInputRef = useRef<HTMLInputElement>(null);
    const creationInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (renamingId && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renamingId]);

    useEffect(() => {
        if (creationState && creationInputRef.current) {
            creationInputRef.current.focus();
        }
    }, [creationState]);

    const handleCreateFromAction = (
        type: "file" | "folder",
        explicitParentId?: string | null
    ) => {
        setContextMenu((prev) => ({ ...prev, visible: false }));
        if (!projects.activeProjectId) return;

        if (collab.isCollabActive && collab.isProjectLocked && collab.role !== 'host') {
            ui.addLog("WARNING" as any, "Project is locked. Cannot create items.");
            return;
        }

        let parentId: string | null = null;

        if (explicitParentId !== undefined) {
            parentId = explicitParentId;
        } else if (selectedExplorerId) {
            if (selectedExplorerId === ROOT_PROJECT_ID) {
                parentId = null;
            } else {
                const item = items.find((i) => i.id === selectedExplorerId);
                if (item) {
                    if (item.type === "folder") {
                        parentId = item.id;
                    } else {
                        parentId = item.parentId;
                    }
                }
            }
        }

        if (parentId) {
            const parentItem = items.find(i => i.id === parentId);
            const isHost = collab.role === 'host';

            if (parentItem?.isReadOnly) {
                ui.addLog("WARNING" as any, "Cannot create items in system folder.");
                return;
            }

            if (collab.isCollabActive && parentItem?.isLocked && !isHost) {
                ui.addLog("WARNING" as any, "Parent folder is locked. Cannot create items inside.");
                return;
            }
            setOpenFolders((prev) => new Set(prev).add(parentId));
        }

        setCreationState({ type, parentId });
        setCreationName("");
    };

    const handleCreationSubmit = () => {
        if (creationState && creationName.trim()) {
            createItem(
                creationState.parentId,
                creationState.type,
                creationName.trim()
            );
        }
        setCreationState(null);
    };

    const handleContextMenu = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!projects.activeProjectId) return;

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            itemId: id,
            type: "default",
        });

        if (selectedExplorerId !== id && id !== "toolbar-overflow") {
            setSelectedExplorerId(id);
        }
    };

    const handleToolbarOverflow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!projects.activeProjectId) return;
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            itemId: null,
            type: "toolbar-overflow",
        });
    };

    const handleRenameSubmit = () => {
        if (renamingId && renameValue.trim()) {
            renameItem(renamingId, renameValue.trim());
        }
        setRenamingId(null);
    };

    const startRenaming = (id: string, currentName: string) => {
        const item = items.find(i => i.id === id);
        const isHost = collab.role === 'host';

        if (item?.isReadOnly) {
            ui.addLog("WARNING" as any, "System file cannot be renamed.");
            return;
        }

        if (collab.isCollabActive && (item?.isLocked || collab.isProjectLocked) && !isHost) {
            ui.addLog("WARNING" as any, "Item is locked and cannot be renamed.");
            return;
        }
        setRenamingId(id);
        setRenameValue(currentName);
        setContextMenu((prev) => ({ ...prev, visible: false }));
    };

    const handleCopyPath = (id: string) => {
        const path = getFullPath(id);
        navigator.clipboard.writeText(path);
        ui.addLog("INFO" as any, `Copied path: ${path}`);
    };

    const handleCloseProject = () => {
        if (collab.isCollabActive) {
            if (collab.role === 'guest') {
                if (confirm("Are you sure you want to leave the collaboration session?")) {
                    collab.leaveSession();
                } else {
                    return;
                }
            } else if (collab.role === 'host') {
                if (confirm("Closing the project will end the collaboration session for everyone. Continue?")) {
                    collab.endSession();
                } else {
                    return;
                }
            }
        }
        setSelectedExplorerId(null);
        projects.closeActiveProject();
        setContextMenu((prev) => ({ ...prev, visible: false }));
    };

    const handleDeleteItem = (id: string) => {
        const item = items.find(i => i.id === id);
        const isHost = collab.role === 'host';

        if (item?.isReadOnly) {
            ui.addLog("WARNING" as any, "System file cannot be deleted.");
            return;
        }

        if (collab.isCollabActive && (item?.isLocked || collab.isProjectLocked) && !isHost) {
            ui.addLog("WARNING" as any, "Item is locked and cannot be deleted.");
            return;
        }
        deleteItem(id);
    };

    return {
        renamingId,
        renameValue,
        setRenameValue,
        contextMenu,
        setContextMenu,
        creationState,
        setCreationState,
        creationName,
        setCreationName,
        renameInputRef,
        creationInputRef,
        handleCreateFromAction,
        handleCreationSubmit,
        handleContextMenu,
        handleToolbarOverflow,
        handleRenameSubmit,
        startRenaming,
        handleCopyPath,
        handleCloseProject,
        deleteItem: handleDeleteItem,
    };
};
