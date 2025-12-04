import { configure, fs, Stats } from '@zenfs/core';
import { FileSystemItem } from '@/types';
import { nanoid } from 'nanoid';
import { LANGUAGE_MAPPING, DEFAULT_LANGUAGE } from '@/config/file';

const joinPath = (...parts: string[]) => {
    return parts.join('/').replace(/\/+/g, '/');
};

const dirname = (p: string): string => {
    if (!p) return "/";

    const parts = p.split("/").filter(Boolean);
    parts.pop();

    return "/" + parts.join("/");
};

class FSService {
    private isInitialized = false;
    private _initPromise: Promise<void> | null = null;

    async init() {
        if (this.isInitialized) return;
        if (this._initPromise) return this._initPromise;

        // Ensure we are in the browser
        if (typeof window === 'undefined') return;

        this._initPromise = (async () => {
            try {
                const { IndexedDB } = await import('@zenfs/dom');

                await configure({
                    mounts: {
                        '/projects': { backend: IndexedDB, name: 'cryonx-projects' }
                    }
                });
                this.isInitialized = true;
            } catch (error: any) {
                const msg = error.message || String(error);
                if (msg.includes('Mount point') || error.code === 'EEXIST') {
                    this.isInitialized = true;
                    return;
                }

                throw error;
            } finally {
                this._initPromise = null;
            }
        })();

        return this._initPromise;
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

        if (!filePath) {
            throw new Error("writeFile: filePath is undefined");
        }

        // 1. Ensure parent directory exists
        const dir = dirname(filePath);

        await this.mkdir(dir);

        // 2. Try writing file normally
        try {
            await fs.promises.writeFile(filePath, content, { flag: "w" });
            return;
        } catch (firstErr: any) {
            // 3. Try deleting the file then writing again
            try {
                // Use rm with force/recursive to ensure it's gone, whether it's a file or folder
                if (await this.exists(filePath)) {
                    await fs.promises.rm(filePath, { recursive: true, force: true });
                }

                await fs.promises.writeFile(filePath, content, { flag: "w" });
                return;
            } catch (secondErr) {
                throw secondErr;
            }
        }
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

    async loadFileContent(path: string) {
        await this.ready();
        return fs.promises.readFile(path, "utf8");
    }



    // --- Project Conversion Helpers ---

    async loadProject(projectId: string): Promise<FileSystemItem[]> {
        await this.ready();

        const rootPath = `/projects/data/${projectId}`;
        const mapPath = `${rootPath}/.project/map.json`;

        // Ensure project folder exists
        if (!(await this.exists(rootPath))) {
            await this.mkdir(rootPath);
            return [];
        }

        // Verify rootPath is actually a directory
        try {
            const stats = await this.stat(rootPath);
            if (!stats.isDirectory()) {
                await this.delete(rootPath);
                await this.mkdir(rootPath);
                return [];
            }
        } catch (e) {
            throw e; // Throw so we don't treat it as empty and wipe it
        }

        // --- Load or create metadata map ---
        let idMap: Record<string, string> = {};
        try {
            if (await this.exists(mapPath)) {
                const raw = await fs.promises.readFile(mapPath, "utf8");
                idMap = JSON.parse(raw);
            }
        } catch (e) {
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
            let entries: string[] = [];
            try {
                entries = await fs.promises.readdir(currentPath) as unknown as string[];
            } catch (e) {

                throw e;
            }

            for (const name of entries) {
                // Skip .project folder as it contains internal metadata
                if (name === ".project" || name === ".git") continue;

                const fullPath = joinPath(currentPath, name);

                let stats;
                try {
                    stats = await fs.promises.stat(fullPath);
                } catch (e) {
                    continue;
                }

                const id = getId(fullPath);
                const isDirectory = stats.isDirectory();

                const isSystemFile = fullPath.includes("/.git") || fullPath.includes("/.project");

                const node: FileSystemItem = {
                    id,
                    parentId,
                    name: name,
                    type: isDirectory ? "folder" : "file",
                    content: "",
                    language: "text",
                    isReadOnly: isSystemFile,
                    isLocked: isSystemFile
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

                        const ext = Object.keys(LANGUAGE_MAPPING).find(ext => name.endsWith(ext));
                        node.language = ext ? LANGUAGE_MAPPING[ext] : DEFAULT_LANGUAGE;
                    } catch (e) {

                    }
                }

                items.push(node);

                if (isDirectory) {
                    // Don't recurse too deep into .git
                    if (name === ".git") {
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

        }

        return items;
    }

    // Helper to sync the entire FileSystemItem[] to ZenFS
    // This is useful for the initial migration or auto-save
    async syncToFS(projectId: string, items: FileSystemItem[]) {
        await this.ready();
        const rootPath = `/projects/data/${projectId}`;
        const mapPath = `${rootPath}/.project/map.json`;

        if (!(await this.exists(rootPath))) {
            await this.mkdir(rootPath);
        }

        const itemMap = new Map(items.map(i => [i.id, i]));

        // Helper path (giữ nguyên logic của bạn)
        const getPath = (item: FileSystemItem): string => {
            if (!item.parentId) return joinPath(rootPath, item.name);
            const parent = itemMap.get(item.parentId);
            if (!parent) return joinPath(rootPath, item.name);
            return joinPath(getPath(parent), item.name);
        };

        let idMap: Record<string, string> = {};

        try {
            if (await this.exists(mapPath)) {
                const raw = await fs.promises.readFile(mapPath, "utf8");
                idMap = JSON.parse(raw);
            }
        } catch (e) { idMap = {}; }

        const expectedPaths = new Set<string>();

        const sortedItems = [...items].sort((a, b) => {
            // Ưu tiên folder xử lý trước
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return 0;
        });

        for (const item of sortedItems) {
            const itemPath = getPath(item);

            // Skip system
            if (itemPath.includes('/.project/') || itemPath.includes('/.git/')) continue;

            expectedPaths.add(itemPath);
            idMap[itemPath] = item.id;

            if (item.type === 'folder') {
                if (!(await this.exists(itemPath))) {
                    await this.mkdir(itemPath);
                }
            } else {
                let shouldWrite = true;
                try {
                    if (await this.exists(itemPath)) {
                        const existingContent = await this.readFile(itemPath);
                        if (existingContent === (item.content || '')) {
                            shouldWrite = false;
                        }
                    }
                } catch (e) { shouldWrite = true; }

                if (shouldWrite) {
                    await this.writeFile(itemPath, item.content || '');
                }
            }
        }
        // 5. Save updated ID map
        try {
            const metaDir = `${rootPath}/.project`;
            if (!(await this.exists(metaDir))) await this.mkdir(metaDir);
            await fs.promises.writeFile(mapPath, JSON.stringify(idMap, null, 2), "utf8");
        } catch (e) {

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
                    }
                }
            }
        };

        await cleanup(rootPath);
    }
}

export const fsService = new FSService();
