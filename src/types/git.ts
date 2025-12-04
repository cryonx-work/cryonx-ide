export type GitStatusType = 'modified' | 'new' | 'deleted';

export interface GitChange {
    fileId: string;
    path: string;
    status: GitStatusType;
}

export interface Commit {
    hash: string;
    message: string;
    author: string;
    timestamp: number;
    changesCount: number;
}
