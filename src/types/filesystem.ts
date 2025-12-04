export type FileType = 'file' | 'folder';

export interface FileSystemItem {
    id: string;
    parentId: string | null;
    name: string;
    type: FileType;
    content?: string;
    language?: string;
    isLocked?: boolean;
    isReadOnly?: boolean;
    isExpandLocked?: boolean;
}
