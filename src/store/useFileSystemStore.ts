import { create } from 'zustand';
import { FileSystemItem, CursorPosition, LogType } from '@/types';
import { getFullPath } from '@/utils';
import { vfsService } from '@/services/vfsService';
import { useUIStore } from './useUIStore';

export interface FileSystemState {
    items: FileSystemItem[];
    activeFileId: string | null;
    openFiles: string[];
    cursorPositions: Record<string, CursorPosition>;
    selectedExplorerId: string | null;
    lastAction: { type: 'structure' | 'content'; timestamp: number };

    setItems: (items: FileSystemItem[]) => void;
    setOpenFiles: (files: string[]) => void;
    setActiveFileId: (id: string | null) => void;
    setSelectedExplorerId: (id: string | null) => void;

    createItem: (parentId: string | null, type: "file" | "folder", name?: string) => void;
    importFile: (name: string, content: string, parentId: string | null) => void;
    addItems: (newItems: FileSystemItem[]) => void;
    renameItem: (id: string, newName: string) => void;
    deleteItem: (id: string) => void;
    moveItem: (itemId: string, newParentId: string | null) => void;
    updateFileContent: (id: string, content: string) => void;
    updateCursorPosition: (id: string, position: CursorPosition) => void;
    openFile: (id: string) => void;
    closeFile: (id: string) => void;

    getActiveFile: () => FileSystemItem | null;
    getFullPath: (id: string) => string;
}

export const useFileSystemStore = create<FileSystemState>((set, get) => ({
    items: [],
    activeFileId: null,
    openFiles: [],
    cursorPositions: {},
    selectedExplorerId: null,
    lastAction: { type: 'structure', timestamp: 0 },

    setItems: (items) => set({ items }),
    setOpenFiles: (openFiles) => set({ openFiles }),
    setActiveFileId: (activeFileId) => set({ activeFileId }),
    setSelectedExplorerId: (selectedExplorerId) => set({ selectedExplorerId }),

    createItem: (parentId, type, name) => {
        const state = get();
        const { newItem, newItems, newOpenFiles, newActiveFileId } = vfsService.createItem(
            state.items,
            state.openFiles,
            parentId,
            type,
            name
        );

        set({
            items: newItems,
            selectedExplorerId: newItem.id,
            lastAction: { type: 'structure', timestamp: Date.now() },
            ...(newActiveFileId ? { openFiles: newOpenFiles, activeFileId: newActiveFileId } : {})
        });
    },

    importFile: (name, content, parentId) => {
        const state = get();
        const { newItems } = vfsService.importFile(state.items, name, content, parentId);

        set({
            items: newItems,
            lastAction: { type: 'structure', timestamp: Date.now() }
        });
        useUIStore.getState().addLog(LogType.SUCCESS, `Imported file: ${name}`);
    },

    addItems: (newItems) => {
        set((state) => ({
            items: [...state.items, ...newItems],
            lastAction: { type: 'structure', timestamp: Date.now() }
        }));
        useUIStore.getState().addLog(LogType.SUCCESS, `Imported ${newItems.length} items.`);
    },

    renameItem: (id, newName) => {
        const state = get();
        const newItems = vfsService.renameItem(state.items, id, newName);
        set({
            items: newItems,
            lastAction: { type: 'structure', timestamp: Date.now() }
        });
    },

    deleteItem: (id) => {
        const state = get();
        const { newItems, newOpenFiles, newCursorPositions, newActiveFileId } = vfsService.deleteItem(
            state.items,
            state.openFiles,
            state.cursorPositions,
            state.activeFileId,
            id
        );

        set({
            items: newItems,
            openFiles: newOpenFiles,
            cursorPositions: newCursorPositions,
            activeFileId: newActiveFileId,
            lastAction: { type: 'structure', timestamp: Date.now() }
        });
    },

    moveItem: (itemId, newParentId) => {
        const state = get();
        const newItems = vfsService.moveItem(state.items, itemId, newParentId);
        if (newItems) {
            set({
                items: newItems,
                lastAction: { type: 'structure', timestamp: Date.now() }
            });
        }
    },

    updateFileContent: (id, content) => {
        const item = get().items.find(i => i.id === id);
        if (item?.isReadOnly) return;

        set((state) => ({
            items: state.items.map((f) => (f.id === id ? { ...f, content } : f)),
            lastAction: { type: 'content', timestamp: Date.now() }
        }));
    },

    updateCursorPosition: (id, position) => {
        set((state) => ({
            cursorPositions: { ...state.cursorPositions, [id]: position }
        }));
    },

    openFile: (id) => {
        set((state) => {
            if (!state.openFiles.includes(id)) {
                return {
                    openFiles: [...state.openFiles, id],
                    activeFileId: id,
                    selectedExplorerId: id
                };
            }
            return {
                activeFileId: id,
                selectedExplorerId: id
            };
        });
    },

    closeFile: (id) => {
        set((state) => {
            const newOpenFiles = state.openFiles.filter((fileId) => fileId !== id);
            let newActiveFileId = state.activeFileId;
            if (id === state.activeFileId) {
                newActiveFileId = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null;
            }
            return {
                openFiles: newOpenFiles,
                activeFileId: newActiveFileId
            };
        });
    },

    getActiveFile: () => {
        const state = get();
        return state.items.find((f) => f.id === state.activeFileId) || null;
    },

    getFullPath: (id) => {
        const state = get();
        return getFullPath(state.items, id);
    }
}));
