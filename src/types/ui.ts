export enum LogType {
    INFO = 'INFO',
    SUCCESS = 'SUCCESS',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    SYSTEM = 'SYSTEM',
    DEBUG = 'DEBUG'
}

export interface LogEntry {
    id: string;
    timestamp: Date;
    type: LogType;
    message: string;
}

export type ActiveView = 'explorer' | 'search' | 'source-control' | 'debug' | 'ai' | 'extensions' | null;

export interface IDESettings {
    autoSave: boolean;
    autoSaveDelay: number;
    fontSize: number;
    fontFamily: string;
}

export type StatusType = 'idle' | 'working' | 'error' | 'success' | 'warning';

export interface StatusState {
    type: StatusType;
    message: string;
    details?: string;
}
