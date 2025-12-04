import { useState, useEffect, startTransition, useRef } from 'react';
import { useIDE } from '@/hooks';

export const useFileTreeState = () => {
    const { fileSystem, ui, collab, projects } = useIDE();
    const { items, selectedExplorerId, setSelectedExplorerId } = fileSystem;

    const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
    const [isProjectExpanded, setIsProjectExpanded] = useState(true);
    const lastInitializedProjectId = useRef<string | null>(null);

    useEffect(() => {
        // If items are empty, we can't determine what to expand yet.
        if (items.length === 0) return;

        // Wait for project to finish loading
        if (projects.isLoading) return;

        // If we have already initialized for this project, skip.
        if (lastInitializedProjectId.current === projects.activeProjectId) return;

        const defaultOpen = items.find(
            (i) => i.name === "sources" && i.type === "folder"
        );

        // Always mark as initialized if we have items, even if "sources" is missing, 
        // to prevent re-running on every item change.
        // But we only want to do this once the project is actually loaded.
        if (projects.activeProjectId) {
            const idsToOpen = new Set<string>();

            if (defaultOpen) {
                idsToOpen.add(defaultOpen.id);
                const collectSubFolders = (parentId: string) => {
                    items.forEach((item) => {
                        if (item.parentId === parentId && item.type === "folder") {
                            idsToOpen.add(item.id);
                            collectSubFolders(item.id);
                        }
                    });
                };
                collectSubFolders(defaultOpen.id);
            }

            startTransition(() => {
                setOpenFolders(idsToOpen);
            });

            lastInitializedProjectId.current = projects.activeProjectId;
        }
    }, [items, projects.activeProjectId, projects.isLoading]);

    // Enforce expand lock for guests: Collapse folders if they become locked
    useEffect(() => {
        if (collab.role === 'guest') {
            const next = new Set(openFolders);
            let changed = false;
            items.forEach(item => {
                if (item.isExpandLocked && next.has(item.id)) {
                    next.delete(item.id);
                    changed = true;
                }
            });

            if (changed) {
                const timer = setTimeout(() => setOpenFolders(next), 0);
                return () => clearTimeout(timer);
            }
        }
    }, [items, collab.role, openFolders]);

    const toggleFolder = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        const item = items.find(i => i.id === id);
        const isHost = collab.role === 'host';
        if (collab.isCollabActive && item?.isExpandLocked && !isHost) {
            ui.addLog("WARNING" as any, "Folder is locked and cannot be expanded.");
            return;
        }

        const newOpen = new Set(openFolders);
        if (newOpen.has(id)) newOpen.delete(id);
        else newOpen.add(id);
        setOpenFolders(newOpen);
    };

    const collapseAll = () => {
        setOpenFolders(new Set());
    };

    const expandProject = () => setIsProjectExpanded(true);
    const collapseProject = () => setIsProjectExpanded(false);
    const toggleProject = () => setIsProjectExpanded(prev => !prev);

    return {
        openFolders,
        setOpenFolders,
        isProjectExpanded,
        setIsProjectExpanded,
        toggleFolder,
        collapseAll,
        expandProject,
        collapseProject,
        toggleProject,
        selectedExplorerId,
        setSelectedExplorerId
    };
};
