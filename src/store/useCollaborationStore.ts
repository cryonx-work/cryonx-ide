import { create } from 'zustand';
import { Collaborator, LogType } from '@/types';
import { useUIStore } from './useUIStore';
import { useFileSystemStore } from './useFileSystemStore';
import { collabService } from '@/services/collabService';

export interface CollaborationState {
    isCollabActive: boolean;
    role: 'host' | 'guest' | null;
    collaborators: Collaborator[];
    userName: string | null;
    sessionId: string | null;
    isConnected?: boolean;
    sessionHostName?: string | null;
    isProjectLocked: boolean;
    isSessionNotFound: boolean;

    startSession: (sessionId: string, userName: string, userId?: string) => void;
    endSession: () => Promise<void>;
    joinSession: (sessionId: string, userName: string, userId?: string) => void;
    leaveSession: () => void;
    setCollaborators: (collaborators: Collaborator[]) => void;
    setUserName: (name: string) => void;
    setIsProjectLocked: (locked: boolean) => void;
    clearSessionNotFound: () => void;
    init: () => void;
}

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
    isCollabActive: false,
    role: null,
    collaborators: [],
    sessionId: null,
    userName: null,
    isConnected: false,
    sessionHostName: null,
    isProjectLocked: false,
    isSessionNotFound: false,

    clearSessionNotFound: () => set({ isSessionNotFound: false }),

    setUserName: (name) => {
        set({ userName: name });
        localStorage.setItem('cryonx_username', name);
        if (collabService.isConnected()) {
            collabService.updateUser({ name });
        }
    },
    setIsProjectLocked: (locked) => set({ isProjectLocked: locked }),

    init: () => {
        if (typeof window !== 'undefined') {
            // Load saved username if available
            const savedUsername = collabService.getSavedUserName();
            if (savedUsername && !get().userName) {
                set({ userName: savedUsername });
            }

            const initState = collabService.getInitializationState();
            if (!initState) return;

            if (initState.type === 'url_join') {
                // If joining via URL, update stored username
                localStorage.setItem('cryonx_username', initState.userName);
                get().joinSession(initState.sessionId, initState.userName);
            } else if (initState.type === 'restore') {
                if (initState.role === 'host') {
                    get().startSession(initState.sessionId, initState.userName, initState.userId);
                } else if (initState.role === 'guest') {
                    get().joinSession(initState.sessionId, initState.userName, initState.userId);
                }
            }
        }
    },

    startSession: async (sessionId: string, userName: string, userId?: string) => {
        // Close all open tabs to ensure clean state
        useFileSystemStore.getState().setOpenFiles([]);
        useFileSystemStore.getState().setActiveFileId(null);
        useFileSystemStore.getState().setSelectedExplorerId(null);

        // Register callback for collaborators updates
        collabService.setCollaboratorsCallback((collaborators) => {
            set({ collaborators });
        });

        const session = await collabService.startSession(sessionId, userName, userId);

        set({
            isCollabActive: true,
            role: 'host',
            sessionId: session.sessionId,
            userName: session.userName,
            isConnected: true
        });

        useUIStore.getState().addLog(
            LogType.SYSTEM,
            `Started collaboration session: ${sessionId}`
        );
    },

    endSession: async () => {
        try {
            await collabService.hostEndSession();

            set({
                isCollabActive: false,
                collaborators: [],
                role: null,
                sessionId: null,
                userName: null,
                isConnected: false,
                isProjectLocked: false,
                sessionHostName: null
            });
        } catch (error) {
        }

        // Host returns to root URL
        window.location.href = "/";
    },

    joinSession: async (sessionId: string, userName: string, userId?: string) => {
        // Close all open tabs to ensure clean state
        useFileSystemStore.getState().setOpenFiles([]);
        useFileSystemStore.getState().setActiveFileId(null);
        useFileSystemStore.getState().setSelectedExplorerId(null);

        // Register callback for collaborators updates
        collabService.setCollaboratorsCallback((collaborators) => {
            set({ collaborators });

            // Check for host to validate session
            const host = collaborators.find(c => c.isHost);
            if (host) {
                set({ sessionHostName: host.name });
            }
        });

        const session = await collabService.joinSession(sessionId, userName, userId);

        // Verify session validity
        let isValidSession = false;
        const checkTimeout = setTimeout(() => {
            if (!isValidSession && !get().sessionHostName) {
                get().leaveSession();
                set({ isSessionNotFound: true });
            }
        }, 5000);

        // Bind host name - this is a good indicator of a valid session
        collabService.bindHostName((name) => {
            isValidSession = true;
            clearTimeout(checkTimeout);
            set({ sessionHostName: name });
        });

        // Listen for session end
        collabService.onSessionEnded(() => {
            const ui = useUIStore.getState();
            ui.setIsSettingsOpen(false);
            ui.setIsFeedbackOpen(false);
            ui.setIsProjectManagerOpen(false);

            get().leaveSession();
            set({ isSessionNotFound: true });
        });

        set({
            isCollabActive: true,
            role: 'guest',
            sessionId: session.sessionId,
            userName: session.userName,
            isConnected: true
        });

        useUIStore.getState().addLog(
            LogType.SYSTEM,
            `Joined session: ${sessionId}`
        );
    },

    leaveSession: () => {
        collabService.leaveSession();
        set({
            isCollabActive: false,
            collaborators: [],
            role: null,
            sessionId: null,
            userName: null,
            isConnected: false,
            isProjectLocked: false,
            sessionHostName: null
        });

        useUIStore.getState().addLog(
            LogType.SYSTEM,
            "Left Collaboration Session."
        );
    },

    setCollaborators: (collaborators) => {
        set({ collaborators });
    }
}));
