import { FileSystemItem, CursorPosition } from '@/types';
import { nanoid } from 'nanoid';
import { getRecursiveChildIds } from '@/utils';
import { collabService } from './collabService';

class VirtualFileSystemService {

    createItem(
        items: FileSystemItem[],
        openFiles: string[],
        parentId: string | null,
        type: "file" | "folder",
        name?: string
    ): { newItem: FileSystemItem, newItems: FileSystemItem[], newOpenFiles: string[], newActiveFileId: string | null } {
        const id = nanoid();
        const finalName = name || (type === "file" ? `NewModule_${id.substring(0, 4)}.move` : `Folder_${id.substring(0, 4)}`);
        const newItem: FileSystemItem = {
            id,
            parentId,
            name: finalName,
            type,
            content: type === "file" && finalName.endsWith(".move") ? `module 0x1::${finalName.replace(".move", "")} {\n    // Implementation\n}` : "",
            language: "move",
        };

        if (collabService.isConnected()) {
            collabService.addFile(newItem);
        }

        const newItems = [...items, newItem];
        let newOpenFiles = [...openFiles];
        let newActiveFileId = null;

        if (type === "file") {
            newOpenFiles = [...openFiles, id];
            newActiveFileId = id;
        }

        return { newItem, newItems, newOpenFiles, newActiveFileId };
    }

    importFile(items: FileSystemItem[], name: string, content: string, parentId: string | null): { newItem: FileSystemItem, newItems: FileSystemItem[] } {
        const id = nanoid();
        const newItem: FileSystemItem = {
            id,
            parentId,
            name,
            type: "file",
            content,
            language: name.endsWith(".move") ? "move" : "text",
        };

        if (collabService.isConnected()) {
            collabService.addFile(newItem);
        }

        return { newItem, newItems: [...items, newItem] };
    }

    deleteItem(
        items: FileSystemItem[],
        openFiles: string[],
        cursorPositions: Record<string, CursorPosition>,
        activeFileId: string | null,
        idToDelete: string
    ) {
        const idsToDelete = getRecursiveChildIds(items, idToDelete);

        if (collabService.isConnected()) {
            idsToDelete.forEach(delId => collabService.removeFile(delId));
        }

        const newItems = items.filter((i) => !idsToDelete.includes(i.id));
        const newOpenFiles = openFiles.filter((fileId) => !idsToDelete.includes(fileId));

        const newCursorPositions = { ...cursorPositions };
        idsToDelete.forEach((deletedId) => delete newCursorPositions[deletedId]);

        let newActiveFileId = activeFileId;
        if (idsToDelete.includes(activeFileId || "")) {
            newActiveFileId = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null;
        }

        return { newItems, newOpenFiles, newCursorPositions, newActiveFileId };
    }

    moveItem(items: FileSystemItem[], itemId: string, newParentId: string | null): FileSystemItem[] | null {
        if (itemId === newParentId) return null;
        const itemToMove = items.find((i) => i.id === itemId);
        if (!itemToMove) return null;

        if (itemToMove.type === "folder") {
            const descendants = getRecursiveChildIds(items, itemId);
            if (newParentId && descendants.includes(newParentId)) return null;
        }
        if (itemToMove.parentId === newParentId) return null;

        if (collabService.isConnected()) {
            collabService.moveFile(itemId, newParentId);
        }

        return items.map((i) => (i.id === itemId ? { ...i, parentId: newParentId } : i));
    }

    renameItem(items: FileSystemItem[], id: string, newName: string): FileSystemItem[] {
        if (collabService.isConnected()) {
            collabService.renameFile(id, newName);
        }
        return items.map((i) => (i.id === id ? { ...i, name: newName } : i));
    }
}

export const vfsService = new VirtualFileSystemService();
