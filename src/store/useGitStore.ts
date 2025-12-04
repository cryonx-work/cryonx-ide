import { create } from 'zustand';
import { GitChange, Commit, LogType, FileSystemItem } from '@/types';
import { gitService } from '@/services/gitService';
import { fsService } from '@/services/fsService';
import { useUIStore } from './useUIStore';
import { useProjectStore } from './useProjectStore';
import { useFileSystemStore } from './useFileSystemStore';
import { useCollaborationStore } from './useCollaborationStore';

export interface GitState {
    isInitialized: boolean;
    gitSnapshot: FileSystemItem[];
    gitChanges: GitChange[];
    gitStaged: GitChange[];
    gitHistory: Commit[];

    setIsInitialized: (isInit: boolean) => void;
    setGitSnapshot: (items: FileSystemItem[]) => void;
    setGitChanges: (changes: GitChange[]) => void;
    setGitStaged: (staged: GitChange[]) => void;
    setGitHistory: (history: Commit[]) => void;

    initRepo: () => Promise<void>;
    refreshStatus: () => Promise<void>;
    stageFile: (change: GitChange) => Promise<void>;
    unstageFile: (change: GitChange) => Promise<void>;
    commit: (message: string) => Promise<void>;
}

export const useGitStore = create<GitState>((set, get) => ({
    isInitialized: false,
    gitSnapshot: [],
    gitChanges: [],
    gitStaged: [],
    gitHistory: [],

    setIsInitialized: (isInitialized) => set({ isInitialized }),
    setGitSnapshot: (gitSnapshot) => set({ gitSnapshot }),
    setGitChanges: (gitChanges) => set({ gitChanges }),
    setGitStaged: (gitStaged) => set({ gitStaged }),
    setGitHistory: (gitHistory) => set({ gitHistory }),

    initRepo: async () => {
        // Check if user is guest
        const { role } = useCollaborationStore.getState();
        if (role === 'guest') {
            useUIStore.getState().addLog(LogType.WARNING, "Guests cannot initialize Git repository.");
            return;
        }

        // Initialize a new git repository in the project folder
        const projectId = useProjectStore.getState().activeProjectId;
        if (!projectId) return;
        const dir = `/projects/data/${projectId}`;

        try {
            await gitService.init(dir);

            // Reload file system to show .git folder
            const items = await fsService.loadProject(projectId);
            useFileSystemStore.getState().setItems(items);

            set({ isInitialized: true });
            await get().refreshStatus();
            useUIStore.getState().addLog(LogType.SUCCESS, "Initialized empty Git repository.");
        } catch (e) {

            useUIStore.getState().addLog(LogType.ERROR, "Failed to initialize Git repository.");
        }
    },

    refreshStatus: async () => {
        const projectId = useProjectStore.getState().activeProjectId;
        if (!projectId) return;
        const dir = `/projects/data/${projectId}`;

        // Explicitly check if .git folder exists before proceeding
        const hasGit = await gitService.checkGitFolder(dir);
        if (!hasGit) {
            set({
                isInitialized: false,
                gitChanges: [],
                gitStaged: [],
                gitHistory: []
            });
            return;
        }

        try {
            const { staged, unstaged } = await gitService.getStatus(dir);
            set({ gitChanges: unstaged, gitStaged: staged });

            const history = await gitService.log(dir);
            set({ gitHistory: history });
            set({ isInitialized: true });
        } catch (e) {
            // Check if .git exists but we failed to read it
            const hasGit = await gitService.checkGitFolder(dir);
            if (hasGit) {
                const errorMessage = (e as Error).message || "";

                // Handle corrupt index specifically
                if (errorMessage.includes("Invalid checksum in GitIndex buffer") || errorMessage.includes("Invalid dircache magic file number")) {
                    try {
                        await gitService.deleteIndex(dir);
                        // Retry status after deleting index
                        const { staged, unstaged } = await gitService.getStatus(dir);
                        set({ gitChanges: unstaged, gitStaged: staged });

                        const history = await gitService.log(dir);
                        set({ gitHistory: history });
                        set({ isInitialized: true });

                        useUIStore.getState().addLog(LogType.WARNING, "Repaired corrupt Git index.");
                        return;
                    } catch (repairError) {
                    }
                }

                try {
                    // Attempt to repair by re-initializing (safe operation)
                    await gitService.init(dir);

                    // Try refreshing again
                    const { staged, unstaged } = await gitService.getStatus(dir);
                    set({ gitChanges: unstaged, gitStaged: staged });

                    const history = await gitService.log(dir);
                    set({ gitHistory: history });
                    set({ isInitialized: true });

                    useUIStore.getState().addLog(LogType.INFO, "Restored Git repository session.");
                    return;
                } catch (retryError) {
                    useUIStore.getState().addLog(LogType.ERROR, `Git Error: ${(e as Error).message}`);
                }
            }

            set({ isInitialized: false, gitChanges: [], gitStaged: [], gitHistory: [] });
        }
    },

    stageFile: async (change) => {
        const projectId = useProjectStore.getState().activeProjectId;
        if (!projectId) return;
        const dir = `/projects/data/${projectId}`;

        try {
            if (change.status === 'deleted') {
                await gitService.remove(dir, change.path);
            } else {
                await gitService.add(dir, change.path);
            }
            await get().refreshStatus();
        } catch (e) {

        }
    },

    unstageFile: async (change) => {
        const projectId = useProjectStore.getState().activeProjectId;
        if (!projectId) return;
        const dir = `/projects/data/${projectId}`;

        try {
            await gitService.reset(dir, change.path);
            await get().refreshStatus();
        } catch (e) {

        }
    },

    commit: async (message) => {
        const projectId = useProjectStore.getState().activeProjectId;
        if (!projectId) return;
        const dir = `/projects/data/${projectId}`;

        const authorName = localStorage.getItem("cryonx_username") || "User";
        const authorEmail = "user@example.com";

        try {
            await gitService.commit(dir, message, { name: authorName, email: authorEmail });
            await get().refreshStatus();
            useUIStore.getState().addLog(LogType.SUCCESS, `Committed: "${message}"`);
        } catch (e) {

            useUIStore.getState().addLog(LogType.ERROR, "Commit failed.");
        }
    }
}));
