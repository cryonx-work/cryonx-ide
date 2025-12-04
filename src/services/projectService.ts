import { Project, ProjectTemplateType, FileSystemItem } from '@/types';
import { fsService } from './fsService';
import { TEMPLATES } from '@/config';
import { nanoid } from 'nanoid';
import JSZip from 'jszip';

class ProjectService {

    async generateZip(name: string, items: FileSystemItem[]): Promise<void> {
        const zip = new JSZip();
        const itemsMap = new Map(items.map((item) => [item.id, item]));

        const getPath = (itemId: string): string => {
            const item = itemsMap.get(itemId);
            if (!item) return "";

            const parts = [item.name];
            let current = item;
            while (current.parentId) {
                const parent = itemsMap.get(current.parentId);
                if (parent) {
                    parts.unshift(parent.name);
                    current = parent;
                } else {
                    break;
                }
            }
            return parts.join("/");
        };

        items.forEach((item) => {
            const path = getPath(item.id);
            if (item.type === "file") {
                zip.file(path, item.content || "");
            } else {
                zip.folder(path);
            }
        });

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name.replace(/\s+/g, "_")}_export.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async loadProjects(): Promise<Project[]> {
        try {
            const content = await fsService.readFile("/system/projects.json");
            return JSON.parse(content);
        } catch {
            return [];
        }
    }

    async saveProjects(projects: Project[]): Promise<void> {
        await fsService.writeFile("/system/projects.json", JSON.stringify(projects, null, 2));
    }

    async syncProject(id: string, items: FileSystemItem[]): Promise<void> {
        try {
            await fsService.syncToFS(id, items)
        } catch (e) {
            console.error("[ProjectService] Failed to sync project files in ZenFS", e);
            throw e;
        }
    }

    async createProject(name: string, template: ProjectTemplateType): Promise<{ project: Project, items: FileSystemItem[] }> {
        const id = nanoid();
        const newProject: Project = {
            id,
            name,
            template,
            createdAt: Date.now(),
            lastModified: Date.now(),
        };

        const templateItems = TEMPLATES[template] || TEMPLATES.blank;
        const items = this.cloneTemplateWithNewIds(templateItems);
        await this.syncProject(newProject.id, items);
        return { project: newProject, items };
    }

    async importProject(name: string, items: FileSystemItem[]): Promise<{ project: Project, items: FileSystemItem[] }> {
        const id = nanoid();
        const newProject: Project = {
            id,
            name,
            template: "blank",
            createdAt: Date.now(),
            lastModified: Date.now(),
        };
        const rootFolders = items.filter(i => i.parentId === null && i.type === "folder");
        let newItems = items;
        if (rootFolders.length === 1) {
            const rootFolderId = rootFolders[0].id;
            newItems = items
                .filter(i => i.parentId !== rootFolderId)
                .map(i => i.parentId === rootFolderId ? { ...i, parentId: null } : i);
        }
        await this.syncProject(newProject.id, newItems);
        return { project: newProject, items: newItems };
    }

    async deleteProject(projectId: string): Promise<void> {
        try {
            await fsService.delete(`/projects/${projectId}`);
        } catch (e) {
            console.error("[ProjectService] Failed to delete project from ZenFS", e);
            throw e;
        }
    }

    async ensureProjectInitialized(projectId: string): Promise<FileSystemItem[]> {
        let projectFiles = await fsService.loadProject(projectId);

        if (projectFiles.length === 0) {
            console.log("[ProjectService] Initializing new project template...");
            // Use blank template for recovery/initialization
            projectFiles = this.cloneTemplateWithNewIds(TEMPLATES["blank"]);
            await this.syncProject(projectId, projectFiles);
        }

        return projectFiles;
    }

    async initialize(): Promise<{ projects: Project[], activeProjectId: string | null }> {
        await fsService.ready();

        // 1. Load Projects List
        const savedProjects = await this.loadProjects();

        // 2. Load Active Project ID
        let savedActiveId: string | null = null;
        try {
            const stored = localStorage.getItem("cryonx_system_config");
            if (stored) {
                savedActiveId = JSON.parse(stored).activeProjectId;
            }
        } catch (e) {
            console.warn("[ProjectService] Failed to load config from localStorage", e);
            savedActiveId = null;
        }

        return { projects: savedProjects, activeProjectId: savedActiveId };
    }

    async scanForRecoveredProjects(currentProjects: Project[]): Promise<Project[]> {
        try {
            const existingIds = new Set(currentProjects.map(p => p.id));
            const folderIds = await fsService.readdir('/projects');
            let hasChanges = false;
            const updatedProjects = [...currentProjects];

            for (const id of folderIds) {
                if (id === '.project' || id.startsWith('.')) continue;

                // Check if it's a directory
                try {
                    const stats = await fsService.stat(`/projects/${id}`);
                    if (!stats.isDirectory()) continue;
                } catch { continue; }

                if (!existingIds.has(id)) {
                    console.log(`Recovering orphaned project: ${id}`);
                    updatedProjects.push({
                        id,
                        name: `Recovered (${id.slice(0, 6)})`,
                        template: 'blank',
                        createdAt: Date.now(),
                        lastModified: Date.now()
                    });
                    hasChanges = true;
                }
            }

            if (hasChanges) {
                await this.saveProjects(updatedProjects);
                return updatedProjects;
            }
        } catch (e) {
            console.warn("Project recovery scan failed", e);
        }
        return currentProjects;
    }

    getProjectMetadata(projectId: string): any {
        try {
            const metaKey = `project_meta_${projectId}`;
            const metaContent = localStorage.getItem(metaKey);
            if (metaContent) {
                return JSON.parse(metaContent);
            }
        } catch {
            return null;
        }
        return null;
    }

    saveProjectMetadata(projectId: string, meta: any) {
        localStorage.setItem(`project_meta_${projectId}`, JSON.stringify(meta));
    }

    saveActiveProjectId(projectId: string | null) {
        try {
            localStorage.setItem("cryonx_system_config", JSON.stringify({ activeProjectId: projectId }));
        } catch (e) {
            console.warn("Failed to save active project config", e);
        }
    }

    private cloneTemplateWithNewIds(items: FileSystemItem[]): FileSystemItem[] {
        const idMap = new Map<string, string>();

        // 1. Generate new IDs
        items.forEach(item => {
            idMap.set(item.id, nanoid());
        });

        // 2. Create new items with updated IDs and parentIDs
        return items.map(item => ({
            ...item,
            id: idMap.get(item.id)!,
            parentId: item.parentId ? idMap.get(item.parentId) || null : null
        }));
    }
}

export const projectService = new ProjectService();
