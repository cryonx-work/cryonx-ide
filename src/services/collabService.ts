import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";
import { nanoid } from "nanoid";
import { useProjectStore } from "@/store/useProjectStore";
import { useFileSystemStore } from "@/store/useFileSystemStore";
import { Collaborator, FileSystemItem } from "@/types/index";
import { getRecursiveChildIds } from "@/utils/fileUtils";
import { useCollaborationStore } from "@/store/useCollaborationStore";


class CollabService {
    public doc: Y.Doc;
    public provider: WebrtcProvider | null = null;
    public persistence: IndexeddbPersistence | null = null;
    public awareness: any = null;
    private _isConnected: boolean = false;
    private _unsubscribeProject: (() => void) | null = null;
    private _collaboratorsCallback: ((collaborators: Collaborator[]) => void) | null = null;

    constructor() {
        this.doc = new Y.Doc();
    }

    setCollaboratorsCallback(callback: (collaborators: Collaborator[]) => void) {
        this._collaboratorsCallback = callback;
    }

    getSavedUserName(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('cryonx_username');
    }

    getInitializationState() {
        if (typeof window === 'undefined') return null;

        // 1. Check URL Params
        const params = new URLSearchParams(window.location.search);
        const session = params.get("session");
        const name = params.get("name");

        if (session && name) {
            return {
                type: 'url_join' as const,
                sessionId: session,
                userName: decodeURIComponent(name)
            };
        }

        // 2. Check LocalStorage for restoration
        const savedSession = localStorage.getItem('cryonx_collab_session');
        if (savedSession) {
            try {
                const parsed = JSON.parse(savedSession);
                if (parsed.sessionId && parsed.userName) {
                    return {
                        type: 'restore' as const,
                        sessionId: parsed.sessionId,
                        userName: parsed.userName,
                        role: parsed.role as 'host' | 'guest',
                        userId: parsed.userId
                    };
                }
            } catch (e) {
                localStorage.removeItem('cryonx_collab_session');
            }
        }

        return null;
    }

    async startSession(sessionId: string, userName: string, userId?: string) {
        const finalUserId = userId || nanoid();

        // Save session
        localStorage.setItem('cryonx_collab_session', JSON.stringify({
            sessionId,
            userName,
            role: 'host',
            userId: finalUserId
        }));
        localStorage.setItem('cryonx_username', userName);

        // Connect
        await this.connect(sessionId, {
            name: userName,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
            isHost: true,
            id: finalUserId
        });

        this.bindProjectLock();
        this.setupAwarenessListener();

        return { sessionId, userName, userId: finalUserId, role: 'host' as const };
    }

    async joinSession(sessionId: string, userName: string, userId?: string) {
        const finalUserId = userId || nanoid();

        // Save session
        localStorage.setItem('cryonx_collab_session', JSON.stringify({
            sessionId,
            userName,
            role: 'guest',
            userId: finalUserId
        }));
        localStorage.setItem('cryonx_username', userName);

        // Connect
        await this.connect(sessionId, {
            name: userName,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
            isHost: false,
            id: finalUserId
        });

        this.bindProjectMetadata();
        this.bindProjectLock();
        this.setupAwarenessListener();

        return { sessionId, userName, userId: finalUserId, role: 'guest' as const };
    }

    async hostEndSession() {
        // Signal to guests
        const meta = this.doc.getMap("meta");
        meta.set("status", "ended");

        // Wait for propagation
        await new Promise(resolve => setTimeout(resolve, 500));

        this.disconnect();
        localStorage.removeItem('cryonx_collab_session');
    }

    leaveSession() {
        this.disconnect();
        localStorage.removeItem('cryonx_collab_session');
    }

    private setupAwarenessListener() {
        if (!this.awareness) return;

        const updateCollaborators = () => {
            if (!this.awareness) return;
            const states = this.awareness.getStates();
            const collaboratorsMap = new Map<string, Collaborator>();

            states.forEach((state: any, clientId: number) => {
                if (state.user && state.user.id) {
                    collaboratorsMap.set(state.user.id, {
                        id: state.user.id,
                        name: state.user.name,
                        color: state.user.color,
                        avatar: state.user.name[0].toUpperCase(),
                        fileId: state.user.fileId || null,
                        cursor: state.user.cursor || { lineNumber: 1, column: 1 },
                        isHost: state.user.isHost
                    });
                }
            });

            if (this._collaboratorsCallback) {
                this._collaboratorsCallback(Array.from(collaboratorsMap.values()));
            }
        };

        this.awareness.on('change', updateCollaborators);
        updateCollaborators();
    }

    createSession() {
        const sessionId = `room-${nanoid()}`;
        const shareLink = `${window.location.origin}/join/${sessionId}`;
        return { sessionId, shareLink };
    }

    async connect(roomName: string, user: { name: string; color: string; isHost: boolean; id?: string }) {
        if (this._isConnected) return;

        // Cleanup old guest sessions if joining a new one
        if (!user.isHost) {
            await this._cleanupOldGuestDatabases(roomName, true);
        }

        // 1. Persistence (Offline support)
        this.persistence = new IndexeddbPersistence(roomName, this.doc);

        // 2. WebRTC Provider
        this.provider = new WebrtcProvider(roomName, this.doc, {
            signaling: [
                'wss://y-webrtc.up.railway.app',
            ],
            // password: null, // Optional: Add password support later
        });

        this.awareness = this.provider.awareness;
        this._isConnected = true;

        // 3. Set local user state
        this.awareness.setLocalStateField('user', {
            name: user.name,
            color: user.color,
            id: user.id || nanoid(),
            isHost: user.isHost
        });

        // Monitor connection status
        this.provider.on('status', (event: { connected: boolean }) => {
            const isConnected = event.connected;
            window.dispatchEvent(new CustomEvent('collab-status', { detail: { isConnected } }));
        });

        // 4. If Host, seed the project
        if (user.isHost) {
            this.persistence.once('synced', () => {
                this.pushProject();
                // Set host info in meta
                const meta = this.doc.getMap("meta");
                meta.set("hostName", user.name);
                meta.set("status", "active");
            });

            // Subscribe to project changes to keep metadata in sync
            this._unsubscribeProject = useProjectStore.subscribe((state, prevState) => {
                if (state.activeProject && state.activeProject !== prevState.activeProject) {
                    this.pushProject();
                }
            });
        }

        // Always listen for file tree changes to keep stores in sync
        this.bindFileSystem();
    }

    async checkSession(roomName: string): Promise<boolean> {
        if (typeof window === 'undefined') return false;

        return new Promise((resolve) => {
            try {
                const tempDoc = new Y.Doc();
                const tempProvider = new WebrtcProvider(roomName, tempDoc, {
                    signaling: ['wss://y-webrtc.up.railway.app'],
                });

                let resolved = false;
                const cleanup = () => {
                    if (resolved) return;
                    resolved = true;
                    try {
                        tempProvider.destroy();
                        tempDoc.destroy();
                    } catch (e) {
                    }
                };

                const timeout = setTimeout(() => {
                    cleanup();
                    resolve(false);
                }, 3000); // 3 seconds timeout

                tempProvider.awareness.on('change', () => {
                    if (resolved) return;

                    const states = tempProvider.awareness.getStates();
                    let foundHost = false;
                    states.forEach((state: any) => {
                        if (state.user && state.user.isHost) {
                            foundHost = true;
                        }
                    });

                    if (foundHost) {
                        clearTimeout(timeout);
                        cleanup();
                        resolve(true);
                    }
                });
            } catch (error) {
                resolve(false);
            }
        });
    }

    disconnect() {
        if (this._unsubscribeProject) {
            this._unsubscribeProject();
            this._unsubscribeProject = null;
        }
        if (this.provider) {
            this.provider.destroy();
            this.provider = null;
        }
        if (this.persistence) {
            this.persistence.destroy();
            this.persistence = null;
        }
        this.awareness = null;
        this._isConnected = false;
    }

    isConnected() {
        return this._isConnected;
    }

    updateUser(updates: any) {
        if (!this.awareness) return;
        const currentState = this.awareness.getLocalState();
        const newState = {
            ...currentState.user,
            ...updates
        };
        this.awareness.setLocalStateField('user', newState);

        // If host is renaming, update the meta field as well
        if (newState.isHost && updates.name) {
            const meta = this.doc.getMap("meta");
            meta.set("hostName", updates.name);
        }
    }

    // Sync initial project state to Yjs (Host only)
    pushProject() {
        const projectStore = useProjectStore.getState();
        const activeProject = projectStore.activeProject;

        if (activeProject) {
            const yProject = this.doc.getMap("project");
            this.doc.transact(() => {
                yProject.set("name", activeProject.name);
                yProject.set("id", activeProject.id);
                yProject.set("template", activeProject.template);
            });
        }

        // We might need to get files from FileSystemStore instead if that's where the live data is
        const fsStore = useFileSystemStore.getState();
        const files = fsStore.items;

        if (!files || files.length === 0) {
            return;
        }

        const yFiles = this.doc.getArray("files");

        // Only seed if empty to avoid overwriting existing session data
        if (yFiles.length > 0) {
            return;
        }

        this.doc.transact(() => {
            for (const file of files) {
                // 1. Seed content for files FIRST
                // This ensures that when the file is added to the tree (triggering observers),
                // the content is already available in yText.
                if (file.type === 'file') {
                    const yText = this.doc.getText(`file:${file.id}`);
                    if (yText.length === 0) {
                        yText.insert(0, file.content || "");
                    }
                }

                const fileMap = new Y.Map();
                fileMap.set("id", file.id);
                fileMap.set("type", file.type);
                fileMap.set("name", file.name);
                fileMap.set("parentId", file.parentId);
                fileMap.set("language", file.language);
                fileMap.set("isLocked", file.isLocked || false);
                fileMap.set("isReadOnly", file.isReadOnly || false);
                fileMap.set("isExpandLocked", file.isExpandLocked || false);
                // We don't sync content in the file map, we use Y.Text for that

                yFiles.push([fileMap]);
            }
        });
    }

    // Listen for Yjs file tree changes and update local Zustand store (Guest)
    bindFileSystem() {
        const yFiles = this.doc.getArray("files");

        const updateFileSystem = () => {
            const newItems: any[] = [];

            yFiles.forEach((yItem: any) => {
                const item = yItem.toJSON();
                if (item.type === 'file') {
                    const yText = this.doc.getText(`file:${item.id}`);
                    item.content = yText.toString();
                }
                newItems.push(item);
            });

            // Update Zustand
            useFileSystemStore.getState().setItems(newItems);

            // Enforce tab closing for locked folders (Guest side)
            const store = useFileSystemStore.getState();
            const lockedFolderIds = newItems.filter((i: any) => i.isExpandLocked).map((i: any) => i.id);

            if (lockedFolderIds.length > 0) {
                let allLockedChildIds: string[] = [];
                lockedFolderIds.forEach((id: string) => {
                    allLockedChildIds = [...allLockedChildIds, ...getRecursiveChildIds(newItems, id)];
                });

                const newOpenFiles = store.openFiles.filter(id => !allLockedChildIds.includes(id));
                if (newOpenFiles.length !== store.openFiles.length) {
                    store.setOpenFiles(newOpenFiles);
                    if (store.activeFileId && allLockedChildIds.includes(store.activeFileId)) {
                        store.setActiveFileId(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
                    }
                }
            }
        };

        yFiles.observeDeep((events, transaction) => {
            if (transaction.local) {
                return;
            }
            updateFileSystem();
        });

        // Initial sync if data exists
        if (yFiles.length > 0) {
            updateFileSystem();
        }
    }

    bindProjectMetadata() {
        const yProject = this.doc.getMap("project");

        const updateProject = () => {
            const name = yProject.get("name") as string;
            const id = yProject.get("id") as string;
            const template = yProject.get("template") as any;

            if (name) {
                useProjectStore.setState({
                    activeProject: {
                        id: id || 'remote-project',
                        name: name,
                        template: template || 'blank',
                        createdAt: Date.now(),
                        lastModified: Date.now()
                    },
                    activeProjectId: id || 'remote-project'
                });
            }
        };

        yProject.observe(updateProject);
        updateProject();
    }

    bindHostName(callback: (name: string) => void) {
        const meta = this.doc.getMap("meta");
        const updateHostName = () => {
            const hostName = meta.get("hostName") as string;
            if (hostName) {
                callback(hostName);
            }
        };
        meta.observe(updateHostName);
        updateHostName();
    }

    bindProjectLock() {
        const meta = this.doc.getMap("meta");
        const updateLock = () => {
            const isLocked = meta.get("isProjectLocked") as boolean;
            useCollaborationStore.getState().setIsProjectLocked(!!isLocked);
        };
        meta.observe(updateLock);
        updateLock();
    }

    toggleProjectLock(locked: boolean) {
        if (!this._isConnected) return;

        // Optimistic update
        useCollaborationStore.getState().setIsProjectLocked(locked);

        const meta = this.doc.getMap("meta");
        meta.set("isProjectLocked", locked);
    }

    // --- Session Management ---

    onSessionEnded(callback: () => void) {
        const meta = this.doc.getMap("meta");

        // Check immediately
        if (meta.get("status") === "ended") {
            callback();
        }

        meta.observe((event) => {
            if (meta.get("status") === "ended") {
                callback();
            }
        });
    }

    getFileContent(fileId: string): Y.Text {
        return this.doc.getText(`file:${fileId}`);
    }

    getAllFilesContent(): { id: string, content: string }[] {
        const yFiles = this.doc.getArray("files");
        const results: { id: string, content: string }[] = [];

        yFiles.forEach((val: any) => {
            const yItem = val as Y.Map<any>;
            const id = yItem.get("id");
            const type = yItem.get("type");

            if (type === 'file') {
                const yText = this.doc.getText(`file:${id}`);
                results.push({ id, content: yText.toString() });
            }
        });
        return results;
    }

    // --- File System Mutations ---

    addFile(item: FileSystemItem) {
        if (!this._isConnected) return;
        const yFiles = this.doc.getArray("files");

        const fileMap = new Y.Map();
        fileMap.set("id", item.id);
        fileMap.set("type", item.type);
        fileMap.set("name", item.name);
        fileMap.set("parentId", item.parentId);
        fileMap.set("language", item.language);
        fileMap.set("isLocked", item.isLocked || false);
        fileMap.set("isReadOnly", item.isReadOnly || false);
        fileMap.set("isExpandLocked", item.isExpandLocked || false);

        yFiles.push([fileMap]);

        if (item.type === 'file') {
            const yText = this.doc.getText(`file:${item.id}`);
            if (item.content) {
                yText.insert(0, item.content);
            }
        }
    }

    removeFile(fileId: string) {
        if (!this._isConnected) return;
        const yFiles = this.doc.getArray("files");

        let index = -1;
        let i = 0;
        // Iterate to find the index
        // Y.Array doesn't have findIndex, so we iterate
        for (const val of yFiles) {
            const yItem = val as Y.Map<any>;
            if (yItem.get("id") === fileId) {
                index = i;
                break;
            }
            i++;
        }

        if (index !== -1) {
            yFiles.delete(index, 1);
        }
    }

    renameFile(fileId: string, newName: string) {
        if (!this._isConnected) return;
        const yFiles = this.doc.getArray("files");

        for (const val of yFiles) {
            const yItem = val as Y.Map<any>;
            if (yItem.get("id") === fileId) {
                yItem.set("name", newName);
                break;
            }
        }
    }

    moveFile(fileId: string, newParentId: string | null) {
        if (!this._isConnected) return;
        const yFiles = this.doc.getArray("files");

        for (const val of yFiles) {
            const yItem = val as Y.Map<any>;
            if (yItem.get("id") === fileId) {
                yItem.set("parentId", newParentId);
                break;
            }
        }
    }

    toggleFileLock(fileId: string, lockType: 'isLocked' | 'isReadOnly' | 'isExpandLocked', value: boolean) {
        if (!this._isConnected) return;
        const yFiles = this.doc.getArray("files");

        for (const val of yFiles) {
            const yItem = val as Y.Map<any>;
            if (yItem.get("id") === fileId) {
                yItem.set(lockType, value);
                // If unlocking folder (isLocked = false), also unlock expand
                if (lockType === 'isLocked' && value === false) {
                    yItem.set('isExpandLocked', false);
                }
                // If locking expand (isExpandLocked = true), also lock folder
                if (lockType === 'isExpandLocked' && value === true) {
                    yItem.set('isLocked', true);
                }
                break;
            }
        }

        // Update Local Store immediately so the UI reflects the change for the Host
        const store = useFileSystemStore.getState();
        const newItems = store.items.map(item => {
            if (item.id === fileId) {
                const updates: any = { [lockType]: value };
                if (lockType === 'isLocked' && value === false) {
                    updates.isExpandLocked = false;
                }
                if (lockType === 'isExpandLocked' && value === true) {
                    updates.isLocked = true;
                }
                return { ...item, ...updates };
            }
            return item;
        });
        store.setItems(newItems);

        // If locking expand, close all child tabs
        if (lockType === 'isExpandLocked' && value === true) {
            const childIds = getRecursiveChildIds(store.items, fileId);
            const newOpenFiles = store.openFiles.filter(id => !childIds.includes(id));

            if (newOpenFiles.length !== store.openFiles.length) {
                store.setOpenFiles(newOpenFiles);

                if (store.activeFileId && childIds.includes(store.activeFileId)) {
                    store.setActiveFileId(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
                }
            }
        }
    }

    private async _cleanupOldGuestDatabases(currentRoomName: string, forceClearCurrent: boolean = false) {
        if (typeof window === 'undefined' || !window.indexedDB || !window.indexedDB.databases) return;

        try {
            const dbs = await window.indexedDB.databases();
            const roomDbs = dbs.filter(db => db.name && db.name.startsWith('room-'));

            const dbsToDelete = forceClearCurrent
                ? roomDbs
                : roomDbs.filter(db => db.name !== currentRoomName);

            if (dbsToDelete.length > 0) {
                await Promise.all(dbsToDelete.map(db => {
                    return new Promise<void>((resolve) => {
                        if (!db.name) return resolve();
                        const req = window.indexedDB.deleteDatabase(db.name);
                        req.onsuccess = () => {
                            resolve();
                        };
                        req.onerror = () => {
                            resolve();
                        };
                        req.onblocked = () => {
                            resolve();
                        };
                    });
                }));
            }
        } catch (error) {
        }
    }
}

export const collabService = new CollabService();

