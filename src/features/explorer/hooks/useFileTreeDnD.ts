import { useState } from 'react';
import { useIDE } from '@/hooks';
import { FileSystemItem } from '@/types';
import { processDropItems } from '@/utils';

export const useFileTreeDnD = (
    setOpenFolders: React.Dispatch<React.SetStateAction<Set<string>>>,
    setContextMenu: React.Dispatch<React.SetStateAction<any>>
) => {
    const { fileSystem, ui, projects, collab } = useIDE();
    const { items, addItems, moveItem } = fileSystem;

    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [isExternalDrag, setIsExternalDrag] = useState(false);

    const handleDragStart = (e: React.DragEvent, item: FileSystemItem) => {
        e.dataTransfer.setData("application/cryonx-id", item.id);
        e.dataTransfer.effectAllowed = "move";
        setContextMenu((prev: any) => ({ ...prev, visible: false }));
    };

    const handleDragEnd = () => {
        setDragOverId(null);
    };

    const handleContainerDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes("Files")) {
            setIsExternalDrag(true);
        }
    };

    const handleContainerDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsExternalDrag(false);
    };

    const handleDragOver = (
        e: React.DragEvent,
        item: FileSystemItem | null
    ) => {
        e.preventDefault();
        e.stopPropagation();
        if (!projects.activeProjectId) return;

        if (e.dataTransfer.types.includes("Files")) {
            setIsExternalDrag(true);
            e.dataTransfer.dropEffect = "copy";
            return;
        }

        if (!item) {
            setDragOverId("root");
            return;
        }

        if (item.type === "folder") {
            setDragOverId(item.id);
        } else {
            if (item.parentId) {
                setDragOverId(item.parentId);
            } else {
                setDragOverId("root");
            }
        }
    };

    const handleDrop = async (
        e: React.DragEvent,
        targetItem: FileSystemItem | null
    ) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverId(null);
        setIsExternalDrag(false);
        setContextMenu((prev: any) => ({ ...prev, visible: false }));
        if (!projects.activeProjectId) return;

        if (
            e.dataTransfer.items &&
            e.dataTransfer.items.length > 0 &&
            e.dataTransfer.types.includes("Files")
        ) {
            let destinationId: string | null = null;
            if (targetItem) {
                destinationId =
                    targetItem.type === "folder"
                        ? targetItem.id
                        : targetItem.parentId;
            }

            const isHost = collab.role === 'host';
            if (destinationId) {
                const destItem = items.find(i => i.id === destinationId);
                if (collab.isCollabActive && (destItem?.isLocked || collab.isProjectLocked) && !isHost) {
                    ui.addLog("WARNING" as any, "Destination folder is locked.");
                    return;
                }
            } else if (collab.isCollabActive && collab.isProjectLocked && !isHost) {
                ui.addLog("WARNING" as any, "Project is locked.");
                return;
            }

            const scannedItems = await processDropItems(e.dataTransfer.items);

            const remappedItems = scannedItems.map((item) => {
                if (item.parentId === null) {
                    return { ...item, parentId: destinationId };
                }
                return item;
            });

            if (remappedItems.length > 0) {
                addItems(remappedItems);
                if (destinationId) {
                    setOpenFolders((prev) => new Set(prev).add(destinationId));
                }
            }
            return;
        }

        const draggingId = e.dataTransfer.getData("application/cryonx-id");
        if (!draggingId) return;

        const draggedItem = items.find(i => i.id === draggingId);
        const isHost = collab.role === 'host';
        if (collab.isCollabActive && (draggedItem?.isLocked || collab.isProjectLocked) && !isHost) {
            ui.addLog("WARNING" as any, "Item is locked and cannot be moved.");
            return;
        }

        let destinationId: string | null = null;

        if (targetItem) {
            if (targetItem.type === "folder") {
                destinationId = targetItem.id;
            } else {
                destinationId = targetItem.parentId;
            }
        }

        if (destinationId) {
            const destItem = items.find(i => i.id === destinationId);
            const isHost = collab.role === 'host';
            if (collab.isCollabActive && (destItem?.isLocked || collab.isProjectLocked) && !isHost) {
                ui.addLog("WARNING" as any, "Destination folder is locked.");
                return;
            }
        } else if (collab.isCollabActive && collab.isProjectLocked && collab.role !== 'host') {
            ui.addLog("WARNING" as any, "Project is locked.");
            return;
        }

        moveItem(draggingId, destinationId);

        if (destinationId) {
            setOpenFolders((prev) => new Set(prev).add(destinationId));
        }
    };

    return {
        dragOverId,
        isExternalDrag,
        handleDragStart,
        handleDragEnd,
        handleContainerDragEnter,
        handleContainerDragLeave,
        handleDragOver,
        handleDrop
    };
};
