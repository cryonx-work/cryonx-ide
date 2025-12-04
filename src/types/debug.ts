export interface DebugVariable {
    name: string;
    value: string;
    type: string;
}

export interface StackFrame {
    id: string;
    name: string;
    file: string;
    line: number;
}

export interface DebugState {
    isRunning: boolean;
    isPaused: boolean;
    currentLine: number | null;
    breakpoints: number[];
    variables: DebugVariable[];
    callStack: StackFrame[];
}
