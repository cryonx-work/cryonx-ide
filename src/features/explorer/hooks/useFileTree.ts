import { useIDE } from '@/hooks';
import { FileSystemItem } from '@/types';
import { useFileTreeState } from './useFileTreeState';
import { useFileTreeActions } from './useFileTreeActions';
import { useFileTreeDnD } from './useFileTreeDnD';
import { ROOT_PROJECT_ID } from '@/config';

export const useFileTree = () => {
    const { fileSystem, ui, projects } = useIDE();
    const { items, openFile } = fileSystem;

    const {
        openFolders,
        setOpenFolders,
        isProjectExpanded,
        setIsProjectExpanded,
        toggleFolder,
        collapseAll,
        selectedExplorerId,
        setSelectedExplorerId
    } = useFileTreeState();

    const {
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
        deleteItem,
    } = useFileTreeActions(selectedExplorerId, setSelectedExplorerId, setOpenFolders);

    const {
        dragOverId,
        isExternalDrag,
        handleDragStart,
        handleDragEnd,
        handleContainerDragEnter,
        handleContainerDragLeave,
        handleDragOver,
        handleDrop
    } = useFileTreeDnD(setOpenFolders, setContextMenu);

    const handleCollapseAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        collapseAll();
        setContextMenu((prev: any) => ({ ...prev, visible: false }));
    };

    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation();
        setContextMenu((prev: any) => ({ ...prev, visible: false }));
        ui.addLog("INFO" as any, "Refreshed file explorer.");
    };

    const handleHeaderClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setContextMenu((prev: any) => ({ ...prev, visible: false }));

        if (isProjectExpanded) {
            if (selectedExplorerId === ROOT_PROJECT_ID) {
                setSelectedExplorerId(null);
            }
        } else {
            if (!selectedExplorerId) {
                setSelectedExplorerId(ROOT_PROJECT_ID);
            }
        }
        setIsProjectExpanded((prev) => !prev);
    };

    const handleItemClick = (e: React.MouseEvent, item: FileSystemItem) => {
        e.stopPropagation();
        setContextMenu((prev: any) => ({ ...prev, visible: false }));
        setSelectedExplorerId(item.id);
        if (item.type === "file") {
            openFile(item.id);
        } else {
            toggleFolder(e, item.id);
        }
    };

    return {
        items,
        selectedExplorerId,
        openFolders,
        isProjectExpanded,
        renamingId,
        renameValue,
        setRenameValue,
        contextMenu,
        setContextMenu,
        dragOverId,
        isExternalDrag,
        creationState,
        setCreationState,
        creationName,
        setCreationName,
        renameInputRef,
        creationInputRef,
        handleCollapseAll,
        handleRefresh,
        handleHeaderClick,
        handleItemClick,
        handleCreateFromAction,
        handleCreationSubmit,
        handleContextMenu,
        handleToolbarOverflow,
        handleRenameSubmit,
        startRenaming,
        handleCopyPath,
        handleCloseProject,
        handleDragStart,
        handleDragEnd,
        handleContainerDragEnter,
        handleContainerDragLeave,
        handleDragOver,
        handleDrop,
        deleteItem,
        projects,
        selectExplorerItem: setSelectedExplorerId,
    };
};
