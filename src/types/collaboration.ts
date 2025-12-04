export interface CursorPosition {
    lineNumber: number;
    column: number;
}

export interface Collaborator {
    id: string;
    name: string;
    color: string;
    avatar: string;
    fileId: string;
    cursor: CursorPosition;
    isHost?: boolean;
}
