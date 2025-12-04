import { create } from 'zustand';
import { ActiveView, LogEntry, LogType, StatusState, StatusType } from '@/types';

export interface UIState {
    logs: LogEntry[];
    activeView: ActiveView;
    status: StatusState;
    isFeedbackOpen: boolean;
    isSettingsOpen: boolean;
    isProjectManagerOpen: boolean;
    projectManagerView: "list" | "create" | "import";
    scrollToLine: number | null;
    highlightQuery: string | undefined;

    setActiveView: (view: ActiveView) => void;
    addLog: (type: LogType, message: string) => void;
    clearLogs: () => void;
    setStatus: (type: StatusType, message: string, details?: string) => void;
    setIsFeedbackOpen: (isOpen: boolean) => void;
    openFeedback: () => void;
    closeFeedback: () => void;
    setIsSettingsOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
    openSettings: () => void;
    closeSettings: () => void;
    setIsProjectManagerOpen: (isOpen: boolean) => void;
    openProjectManager: () => void;
    closeProjectManager: () => void;
    setProjectManagerView: (view: "list" | "create" | "import") => void;
    setScrollToLine: (line: number | null) => void;
    setHighlightQuery: (query: string | undefined) => void;
    clearHighlight: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
    logs: [],
    activeView: "explorer",
    wallet: { isConnected: false, address: null, balance: "0", network: "" },
    status: { type: "idle", message: "Ready" },
    isFeedbackOpen: false,
    isSettingsOpen: false,
    isProjectManagerOpen: false,
    projectManagerView: "list",
    scrollToLine: null,
    highlightQuery: undefined,

    setActiveView: (view) => set({ activeView: view }),
    addLog: (type, message) => set((state) => ({
        logs: [...state.logs, {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            type,
            message,
        }]
    })),
    clearLogs: () => set({ logs: [] }),
    setStatus: (type, message, details) => set({ status: { type, message, details } }),

    setIsFeedbackOpen: (isOpen) => set({ isFeedbackOpen: isOpen }),
    openFeedback: () => set({ isFeedbackOpen: true }),
    closeFeedback: () => set({ isFeedbackOpen: false }),

    setIsSettingsOpen: (isOpen) => set((state) => ({
        isSettingsOpen: typeof isOpen === 'function' ? isOpen(state.isSettingsOpen) : isOpen
    })),
    openSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
    closeSettings: () => set({ isSettingsOpen: false }),

    setIsProjectManagerOpen: (isOpen) => set({ isProjectManagerOpen: isOpen }),
    openProjectManager: () => set({ isProjectManagerOpen: true }),
    closeProjectManager: () => set({ isProjectManagerOpen: false }),
    setProjectManagerView: (view) => set({ projectManagerView: view }),

    setScrollToLine: (line) => set({ scrollToLine: line }),
    setHighlightQuery: (query) => set({ highlightQuery: query }),
    clearHighlight: () => set({ highlightQuery: undefined }),
}));
