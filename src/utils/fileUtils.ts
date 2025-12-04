import { FileSystemItem } from '@/types';
import { FILE_EXTENSIONS, LANGUAGE_MAPPING, DEFAULT_LANGUAGE } from '@/config/file';

export const getFullPath = (items: FileSystemItem[], itemId: string): string => {
    let path = '';
    let current = items.find(i => i.id === itemId);
    while (current) {
        path = `/${current.name}${path}`;
        if (current.parentId) {
            current = items.find(i => i.id === current?.parentId);
        } else {
            current = undefined;
        }
    }
    return path || '/';
};

export const getRecursiveChildIds = (items: FileSystemItem[], rootId: string): string[] => {
    const children = items.filter(i => i.parentId === rootId);
    let ids = [rootId];
    children.forEach(child => {
        ids = [...ids, ...getRecursiveChildIds(items, child.id)];
    });
    return ids;
};

// Scan dropped items (files and folders) recursively
export const processDropItems = async (items: DataTransferItemList): Promise<FileSystemItem[]> => {
    const fileSystemItems: FileSystemItem[] = [];
    // Queue holds entries to process along with the parentId they should be attached to
    const queue: { entry: any; parentId: string | null }[] = [];
    let rootFolderId: string | null = null;

    // 1. Initial population from DataTransferItemList
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
            // webkitGetAsEntry is non-standard but widely supported in modern browsers
            const entry = item.webkitGetAsEntry();
            if (entry) {
                // If it's a directory at root level, mark it for flattening
                if (entry.isDirectory && items.length === 1) {
                    rootFolderId = 'ROOT_FOLDER_TEMP';
                    queue.push({ entry, parentId: rootFolderId });
                } else {
                    queue.push({ entry, parentId: null });
                }
            }
        }
    }

    // 2. Process the queue (BFS/DFS traversal)
    while (queue.length > 0) {
        const { entry, parentId } = queue.shift()!;

        if (entry.isFile) {
            const file = await new Promise<File>((resolve, reject) => entry.file(resolve, reject));
            const content = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string || '');
                reader.readAsText(file);
            });

            fileSystemItems.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                parentId: parentId,
                name: entry.name,
                type: 'file',
                content: content,
                // Simple language detection
                language: entry.name.endsWith(FILE_EXTENSIONS.MOVE) ? LANGUAGE_MAPPING[FILE_EXTENSIONS.MOVE] : DEFAULT_LANGUAGE
            });
        } else if (entry.isDirectory) {
            const folderId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            fileSystemItems.push({
                id: folderId,
                parentId: parentId,
                name: entry.name,
                type: 'folder'
            });

            // Read directory entries
            const reader = entry.createReader();
            const readEntries = async () => {
                const entries = await new Promise<any[]>((resolve, reject) => {
                    reader.readEntries(resolve, reject);
                });

                if (entries.length > 0) {
                    entries.forEach(childEntry => {
                        queue.push({ entry: childEntry, parentId: folderId });
                    });
                    // Continue reading (readEntries returns batches)
                    await readEntries();
                }
            };
            await readEntries();
        }
    }

    // If we have a single root folder, flatten it
    if (rootFolderId) {
        return fileSystemItems
            .filter(i => i.parentId !== null) // Remove the root folder itself
            .map(i => i.parentId === rootFolderId ? { ...i, parentId: null } : i);
    }

    return fileSystemItems;
};

export const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
