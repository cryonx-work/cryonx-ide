import { configure, fs, Stats } from '@zenfs/core';
// import { IndexedDB } from '@zenfs/dom'; // Moved to dynamic import
import { FileSystemItem } from '@/types';
import { nanoid } from 'nanoid';
import { LANGUAGE_MAPPING, DEFAULT_LANGUAGE } from '@/config/file';

// Simple POSIX path joiner to avoid Windows backslash issues in ZenFS
const joinPath = (...parts: string[]) => {
    return parts.join('/').replace(/\/+/g, '/');
};

const dirname = (p: string) => {
    const parts = p.split('/');
    parts.pop();
    return parts.join('/') || '/';
};

class FSService {
    private isInitialized = false;

    async init() {
        if (this.isInitialized) return;

        // Ensure we are in the browser
        if (typeof window === 'undefined') return;

        try {
            const { IndexedDB } = await import('@zenfs/dom');

            await configure({
                mounts: {
                    '/projects': { backend: IndexedDB, name: 'cryonx-projects' },
                    '/system': { backend: IndexedDB, name: 'cryonx-system' }
                }
            });
            this.isInitialized = true;
            console.log('ZenFS initialized');
        } catch (error: any) {
            const msg = error.message || String(error);
            if (msg.includes('Mount point') || error.code === 'EEXIST') {
                console.log('ZenFS already initialized (HMR/Reload)');
                this.isInitialized = true;
                return;
            }
            console.error('Failed to initialize ZenFS:', error);
            throw error;
        }
    }

    async ready() {
        if (!this.isInitialized) await this.init();
    }

    // --- File Operations ---

    async readFile(filePath: string): Promise<string> {
        await this.ready();
        return fs.promises.readFile(filePath, 'utf8');
    }

    async writeFile(filePath: string, content: string): Promise<void> {
        await this.ready();
        const dir = dirname(filePath);
        if (!(await this.exists(dir))) {
            await this.mkdir(dir);
        }

        const attemptWrite = async (retries = 3, delay = 100): Promise<void> => {
            try {
                await fs.promises.writeFile(filePath, content, 'utf8');
            } catch (error: any) {
                if ((error.code === 'EISDIR' || error.code === 'EEXIST') && retries > 0) {
                    // Try to delete
                    try { await fs.promises.rm(filePath, { recursive: true }); } catch { }
                    try { await fs.promises.unlink(filePath); } catch { }

                    // Wait
                    await new Promise(r => setTimeout(r, delay));

                    // Retry
                    return attemptWrite(retries - 1, delay * 2);
                }
                throw error;
            }
        };

        await attemptWrite();
    }

    async mkdir(dirPath: string): Promise<void> {
        await this.ready();
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });
        } catch (error: any) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }

    async delete(filePath: string): Promise<void> {
        await this.ready();
        const stats = await this.stat(filePath);
        if (stats.isDirectory()) {
            await fs.promises.rm(filePath, { recursive: true });
        } else {
            await fs.promises.unlink(filePath);
        }
    }

    async rename(oldPath: string, newPath: string): Promise<void> {
        await this.ready();
        await fs.promises.rename(oldPath, newPath);
    }

    async exists(filePath: string): Promise<boolean> {
        await this.ready();
        try {
            await fs.promises.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async stat(filePath: string): Promise<Stats> {
        await this.ready();
        return fs.promises.stat(filePath);
    }

    async readdir(dirPath: string): Promise<string[]> {
        await this.ready();
        return fs.promises.readdir(dirPath);
    }

    // --- Project Conversion Helpers ---

    /**
     * Recursively reads a directory and converts it to FileSystemItem[]
     * Uses a persistent map to maintain stable IDs across reloads.
     */
    async loadProject(projectId: string): Promise<FileSystemItem[]> {
        await this.ready();

        const rootPath = `/projects/${projectId}`;
        const mapPath = `${rootPath}/.project/map.json`;

        // Ensure project folder exists
        if (!(await this.exists(rootPath))) {
            await this.mkdir(rootPath);
            return [];
        }

        // Verify rootPath is actually a directory
        const stats = await this.stat(rootPath);
        if (!stats.isDirectory()) {
            console.warn(`Project root ${rootPath} is not a directory. Recreating...`);
            await this.delete(rootPath);
            await this.mkdir(rootPath);
            return [];
        }

        // --- Load or create metadata map ---
        let idMap: Record<string, string> = {};
        try {
            if (await this.exists(mapPath)) {
                const raw = await fs.promises.readFile(mapPath, "utf8");
                idMap = JSON.parse(raw);
            }
        } catch (e) {
            console.warn("Failed to load ID map, creating new one", e);
            idMap = {};
        }

        const getId = (p: string) => {
            if (!idMap[p]) {
                idMap[p] = nanoid();
            }
            return idMap[p];
        };

        const items: FileSystemItem[] = [];

        // --- Scan directory recursively ---
        const walk = async (currentPath: string, parentId: string | null) => {
            const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });

            for (const entry of entries) {
                // Skip .project folder as it contains internal metadata
                if (entry.name === ".project" || entry.name === ".git") continue;

                const fullPath = joinPath(currentPath, entry.name);
                const id = getId(fullPath);
                const isDirectory = entry.isDirectory();

                // Check if this item is inside .git or .project
                const isSystemFile = fullPath.includes("/.git") || fullPath.includes("/.project");

                const node: FileSystemItem = {
                    id,
                    parentId,
                    name: entry.name,
                    type: isDirectory ? "folder" : "file",
                    content: "",
                    language: "text",
                    isReadOnly: isSystemFile, // Mark as read-only
                    isLocked: isSystemFile    // Mark as locked
                };

                if (!isDirectory) {
                    // Read content for files
                    try {
                        // Don't read content for .git objects to save memory/performance
                        if (fullPath.includes("/.git/objects") || fullPath.includes("/.git/index")) {
                            node.content = "<binary>";
                        } else {
                            node.content = await fs.promises.readFile(fullPath, "utf8");
                        }

                        const ext = Object.keys(LANGUAGE_MAPPING).find(ext => entry.name.endsWith(ext));
                        node.language = ext ? LANGUAGE_MAPPING[ext] : DEFAULT_LANGUAGE;

                        // console.log('File loaded:', node.name, 'Language:', node.language);
                    } catch (e) {
                        console.error(`Failed to read file: ${fullPath}`, e);
                    }
                }

                items.push(node);

                if (isDirectory) {
                    // Don't recurse too deep into .git
                    if (entry.name === ".git") {
                        await walk(fullPath, id);
                    } else {
                        await walk(fullPath, id);
                    }
                }
            }
        };

        await walk(rootPath, null);

        // --- Save updated ID map ---
        try {
            const metaDir = `${rootPath}/.project`;
            if (!(await this.exists(metaDir))) {
                await fs.promises.mkdir(metaDir, { recursive: true });
            }
            await fs.promises.writeFile(
                mapPath,
                JSON.stringify(idMap, null, 2),
                "utf8"
            );
        } catch (e) {
            console.error("Failed to save ID map", e);
        }

        return items;
    }

    // Helper to sync the entire FileSystemItem[] to ZenFS
    // This is useful for the initial migration or auto-save
    async syncToFS(projectId: string, items: FileSystemItem[]) {
        await this.ready();
        const rootPath = `/projects/${projectId}`;
        const mapPath = `${rootPath}/.project/map.json`;

        // 1. Ensure root exists
        if (!(await this.exists(rootPath))) {
            await this.mkdir(rootPath);
        }

        // 2. Build a map of ID -> Item for easy lookup
        const itemMap = new Map(items.map(i => [i.id, i]));

        // 3. Helper to get full path of an item
        const getPath = (item: FileSystemItem): string => {
            if (!item.parentId) return joinPath(rootPath, item.name);
            const parent = itemMap.get(item.parentId);
            if (!parent) {
                console.warn(`Parent not found for item ${item.name} (${item.id}), parentId: ${item.parentId}`);
                return joinPath(rootPath, item.name); // Fallback
            }
            return joinPath(getPath(parent), item.name);
        };

        // Load existing ID map to preserve other IDs if needed, or just rebuild?
        // Better to load and merge.
        let idMap: Record<string, string> = {};
        try {
            if (await this.exists(mapPath)) {
                const raw = await fs.promises.readFile(mapPath, "utf8");
                idMap = JSON.parse(raw);
            }
        } catch (e) {
            idMap = {};
        }

        // 4. Write files and update map
        const expectedPaths = new Set<string>();

        for (const item of items) {
            const itemPath = getPath(item);

            // Safety check: Don't overwrite system files via item loop
            if (itemPath.includes('/.project/') || itemPath.includes('/.git/')) continue;

            expectedPaths.add(itemPath);

            // Update Map
            idMap[itemPath] = item.id;

            if (item.type === 'folder') {
                if (!(await this.exists(itemPath))) {
                    await this.mkdir(itemPath);
                }
            } else {
                // Optimization: Read existing content and compare
                let shouldWrite = true;
                if (await this.exists(itemPath)) {
                    const existingContent = await this.readFile(itemPath);
                    if (existingContent === (item.content || '')) {
                        shouldWrite = false;
                    }
                }

                if (shouldWrite) {
                    await this.writeFile(itemPath, item.content || '');
                }
            }
        }

        // 5. Save ID Map
        try {
            const metaDir = `${rootPath}/.project`;
            if (!(await this.exists(metaDir))) {
                await this.mkdir(metaDir);
            }
            await fs.promises.writeFile(
                mapPath,
                JSON.stringify(idMap, null, 2),
                "utf8"
            );
        } catch (e) {
            console.error("Failed to save ID map in syncToFS", e);
        }

        // 6. Cleanup orphaned files (files present in ZenFS but not in items)
        const cleanup = async (dir: string) => {
            let entries;
            try {
                entries = await fs.promises.readdir(dir, { withFileTypes: true });
            } catch (e) {
                return;
            }

            for (const entry of entries) {
                const fullPath = joinPath(dir, entry.name);

                // Skip system folders
                if (entry.name === '.git' || entry.name === '.project') continue;

                if (expectedPaths.has(fullPath)) {
                    if (entry.isDirectory()) {
                        await cleanup(fullPath);
                    }
                } else {
                    // Not in expected paths -> Delete
                    try {
                        await fs.promises.rm(fullPath, { recursive: true, force: true });
                    } catch (e) {
                        console.warn("Failed to delete orphaned item", fullPath, e);
                    }
                }
            }
        };

        await cleanup(rootPath);
    }
}

export const fsService = new FSService();
