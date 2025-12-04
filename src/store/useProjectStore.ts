import { create } from 'zustand';
import { Project, ProjectTemplateType, FileSystemItem, LogType } from '@/types';
import { fsService } from '@/services/fsService';
import { projectService } from '@/services/projectService';
import { useUIStore } from './useUIStore';
import { useFileSystemStore } from './useFileSystemStore';
import { useGitStore } from './useGitStore';

export interface ProjectState {
    allProjects: Project[];
    activeProjectId: string | null;
    activeProject: Project | null;
    isInitialized: boolean;
    isLoading: boolean;

    setAllProjects: (projects: Project[] | ((prev: Project[]) => Project[])) => void;
    setActiveProjectId: (id: string | null) => void;

    createProject: (name: string, template: ProjectTemplateType) => Promise<void>;
    importProject: (name: string, items: FileSystemItem[]) => Promise<void>;
    switchProject: (projectId: string) => Promise<void>;
    deleteProject: (projectId: string) => void;
    renameProject: (projectId: string, newName: string) => void;
    exportProject: (projectId: string) => Promise<{ name: string; items: FileSystemItem[] } | null>;
    closeActiveProject: () => void;
    getProjectData: () => FileSystemItem[] | null;

    init: () => Promise<void>;
    loadProjectData: (projectId: string, preloadedItems?: FileSystemItem[]) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    allProjects: [],
    activeProjectId: null,
    isInitialized: false,
    isLoading: true,
    activeProject: null,

    setAllProjects: (projects) => set((state) => ({
        allProjects: typeof projects === 'function' ? projects(state.allProjects) : projects
    })),
    setActiveProjectId: (id) => set({ activeProjectId: id }),

    init: async () => {
        try {
            const { projects, activeProjectId } = await projectService.initialize();

            set({ allProjects: projects });

            if (activeProjectId) {
                // Don't await this to speed up initial load
                get().loadProjectData(activeProjectId);

            } else {
                set({ activeProjectId: null, isLoading: false });
            }

            // Run recovery scan in background
            // setTimeout(async () => {
            //     const updatedProjects = await projectService.scanForRecoveredProjects(projects);
            //     if (updatedProjects !== projects) {
            //         set({ allProjects: updatedProjects });
            //     }
            // }, 1000);

        } catch (error) {
            set({ isLoading: false });
        } finally {
            set({ isInitialized: true });
        }
    },

    loadProjectData: async (projectId, preloadedItems) => {
        const ui = useUIStore.getState();
        const fs = useFileSystemStore.getState();
        const git = useGitStore.getState();

        try {
            // 1. Load or Initialize Project Files via Service
            let projectFiles = preloadedItems;
            if (!projectFiles) {
                projectFiles = await projectService.ensureProjectInitialized(projectId);
            }

            // Load Metadata (Open files, Git state)
            const savedMeta = projectService.getProjectMetadata(projectId);

            fs.setItems(projectFiles || []);

            if (savedMeta) {
                fs.setOpenFiles(savedMeta.openFiles || []);
                if (savedMeta.activeFileId) {
                    fs.setActiveFileId(savedMeta.activeFileId);
                    fs.setSelectedExplorerId(savedMeta.activeFileId);
                }
                if (savedMeta.git && savedMeta.git.isInitialized) {

                    // Refresh git status from FS
                    git.refreshStatus().catch(e => { });
                } else {
                    git.setIsInitialized(false);
                    git.setGitSnapshot([]);
                    git.setGitHistory([]);
                    git.setGitStaged([]);
                    git.setGitChanges([]);
                }
            } else {
                fs.setOpenFiles([]);
                fs.setActiveFileId(null);
                fs.setSelectedExplorerId(null);
                git.setIsInitialized(false);
                git.setGitSnapshot([]);
                git.setGitHistory([]);
                git.setGitStaged([]);
                git.setGitChanges([]);
            }

            // Ensure activeProject object exists even if not in list
            const currentProject = get().allProjects.find(p => p.id === projectId);

            set({ activeProjectId: projectId, activeProject: currentProject, isLoading: false });
            ui.setStatus("idle", "Project loaded");

            // Persist active ID
            projectService.saveActiveProjectId(projectId);

        } catch (e) {
            ui.setStatus("error", "Failed to load project");
            set({ isLoading: false });
        }
    },

    createProject: async (name, template) => {
        try {
            const { project, items } = await projectService.createProject(name, template);

            set((state) => ({
                allProjects: [project, ...state.allProjects],
                activeProjectId: project.id,
                activeProject: project,
                isLoading: true
            }));

            await projectService.saveProjects([...get().allProjects]);


            // Save initial meta to LocalStorage
            projectService.saveProjectMetadata(project.id, { openFiles: [], git: null });


            // Load the new project immediately
            await get().loadProjectData(project.id, items);

            useUIStore.getState().setIsProjectManagerOpen(false);
            useUIStore.getState().addLog(LogType.SYSTEM, `Created project: ${name}`);
            useUIStore.getState().setStatus("success", `Created project ${name}`);
        } catch (error) {
            useUIStore.getState().addLog(LogType.ERROR, "Failed to create project.");
        }
    }, getProjectData: () => {
        const fs = useFileSystemStore.getState();
        return fs.items;
    },

    importProject: async (name, importedItems) => {
        try {
            const { project, items: newItems } = await projectService.importProject(name, importedItems);

            set((state) => ({
                allProjects: [project, ...state.allProjects],
                activeProjectId: project.id,
                activeProject: project,
                isLoading: true
            }));

            await projectService.saveProjects([...get().allProjects]);

            localStorage.setItem(`project_meta_${project.id}`, JSON.stringify({ openFiles: [], git: null }));

            await get().loadProjectData(project.id, newItems);

            useUIStore.getState().setIsProjectManagerOpen(false);
            useUIStore.getState().addLog(LogType.SUCCESS, `Imported project: ${name}`);
            useUIStore.getState().setStatus("success", `Imported project ${name}`);
        } catch (error) {

            useUIStore.getState().addLog(LogType.ERROR, "Failed to import project.");
        }
    },

    switchProject: async (projectId) => {
        const state = get();
        if (projectId === state.activeProjectId) return;

        useUIStore.getState().setIsProjectManagerOpen(false);
        useUIStore.getState().setStatus("working", "Switching project...");
        set({ isLoading: true });

        // Save config immediately to persist intent
        projectService.saveActiveProjectId(projectId);

        await get().loadProjectData(projectId);
    },

    renameProject: (projectId, newName) => {
        set((state) => {
            const updatedProjects = state.allProjects.map((p) =>
                p.id === projectId ? { ...p, name: newName, lastModified: Date.now() } : p
            );

            // Also update activeProject if it's the one being renamed
            let newActiveProject = state.activeProject;
            if (state.activeProject && state.activeProject.id === projectId) {
                newActiveProject = { ...state.activeProject, name: newName, lastModified: Date.now() };
            }

            // Fire and forget, but log error
            projectService.saveProjects(updatedProjects).catch(e =>
            {}
            );
            return { allProjects: updatedProjects, activeProject: newActiveProject };
        });
    },

    exportProject: async (projectId) => {
        try {
            const project = get().allProjects.find(p => p.id === projectId);
            if (!project) return null;

            // If it's the active project, get current state from store to be most up to date
            if (projectId === get().activeProjectId) {
                const fs = useFileSystemStore.getState();
                return { name: project.name, items: fs.items };
            }

            // Otherwise fetch from ZenFS
            const files = await fsService.loadProject(projectId);
            return { name: project.name, items: files || [] };
        } catch (error) {

            return null;
        }
    },

    deleteProject: (projectId) => {
        const state = get();
        const projectToDelete = state.allProjects.find((p) => p.id === projectId);
        if (!projectToDelete) return;

        if (window.confirm(`Delete project "${projectToDelete.name}" permanently?`)) {
            projectService.deleteProject(projectId).catch(e =>
            {}
            );

            const newProjects = state.allProjects.filter((p) => p.id !== projectId);
            set({ allProjects: newProjects });

            projectService.saveProjects(newProjects).catch(e =>
            {}
            );

            // Clean up metadata
            localStorage.removeItem(`project_meta_${projectId}`);

            if (state.activeProjectId === projectId) {
                set({ activeProjectId: null });
                useFileSystemStore.getState().setItems([]);
                useFileSystemStore.getState().setOpenFiles([]);
                useFileSystemStore.getState().setActiveFileId(null);

                const remaining = newProjects;
                if (remaining.length > 0) {
                    get().switchProject(remaining[0].id);
                } else {
                    projectService.saveActiveProjectId(null);
                    set({ activeProject: null });
                }
            }
        }
    },

    closeActiveProject: () => {
        set({ activeProjectId: null, activeProject: null });
        useFileSystemStore.getState().setItems([]);
        useFileSystemStore.getState().setOpenFiles([]);
        useFileSystemStore.getState().setActiveFileId(null);
        useUIStore.getState().setIsProjectManagerOpen(true);
        useUIStore.getState().setStatus("idle", "Project closed");
        projectService.saveActiveProjectId(null);
    }
}));
