"use client";
import React, { useEffect, useRef, useState } from "react";
import {
    useCollaborationStore,
    useSettingsStore,
    useFileSystemStore,
    useGitStore,
    useProjectStore,
    useUIStore,
    useWalletStore,
} from "@/store";
import { loader } from "@monaco-editor/react";
import { IDEContext } from "@/hooks";
import { fsService } from "@/services/fsService";
import { LoadingScreen } from "@/components/Loading";
import { dappConfig } from "@/config/dapp";

export const IDEProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isReady, setIsReady] = useState(false);

    const settings = useSettingsStore();
    const projects = useProjectStore();
    const collab = useCollaborationStore();
    const fileSystem = useFileSystemStore();
    const git = useGitStore();
    const ui = useUIStore();
    const wallet = useWalletStore();

    // --- 1. Initialization ---
    useEffect(() => {
        const init = async () => {
            try {
                // Preload Monaco Editor and assets
                loader.init().catch(() => {});
                fetch("/lib/onigasm.wasm").catch(() => {});
                fetch("/grammars/move.tmLanguage.json").catch(() => {});

                // Parallelize independent loads
                const fsInitPromise = fsService.init();
                settings.loadSettings();
                // Project init depends on FS, but store might need basic setup first
                // Usually projects.init() reads from FS, so we wait for FS first in fsService logic or here.

                await fsInitPromise; // Wait for FS mount first
                await projects.init(); // Load projects from FS

                collab.init();
                wallet.init([], dappConfig);

                setIsReady(true);
            } catch (error) {
            }
        };
        init();
    }, []);

    // --- Wallet Auto Connect ---
    const didAttemptAutoConnectRef = useRef(false);
    useEffect(() => {
        if (didAttemptAutoConnectRef.current || !wallet.wallets.length) return;
        didAttemptAutoConnectRef.current = true;

        const shouldAutoConnect =
            localStorage.getItem("walletAutoConnect") === "true";
        if (shouldAutoConnect && !wallet.connected) {
            wallet.autoConnect(true);
        }
    }, [wallet.wallets, wallet.connected]);

    // --- Side Effects Vars ---
    const {
        items: fsItems,
        lastAction,
        openFiles: fsOpenFiles,
        activeFileId: fsActiveFileId,
    } = fileSystem;
    const { activeProjectId, allProjects } = projects; // Get allProjects here
    const { config } = settings;

    const isFirstLoad = useRef(true);

    // --- 2. Auto-Save Content (Sync files to ZenFS) ---
    useEffect(() => {
        if (isFirstLoad.current || !isReady) {
            isFirstLoad.current = false;
            return;
        }

        if (activeProjectId && fsItems.length > 0) {
            // Guests should NOT save to the main project database
            if (config.autoSave && collab.role !== "guest") {
                const delay =
                    lastAction?.type === "structure"
                        ? 50
                        : config.autoSaveDelay;

                const handler = setTimeout(async () => {
                    await fsService.syncToFS(activeProjectId, fsItems);


                    if (git.isInitialized) {
                        await git.refreshStatus();
                    }

                    projects.setAllProjects((prev) =>
                        prev.map((p) =>
                            p.id === activeProjectId
                                ? { ...p, lastModified: Date.now() }
                                : p
                        )
                    );
                }, delay);

                return () => clearTimeout(handler);
            }
        }
    }, [
        fsItems, // Trigger on file changes
        lastAction, // Trigger on structure changes
        activeProjectId,
        config.autoSave,
        config.autoSaveDelay,
        git.isInitialized,
        isReady,
    ]);

    useEffect(() => {
        if (!isReady || allProjects.length === 0) return;

        const saveProjectsToDisk = async () => {
            try {
                await fsService.writeFile(
                    "/ide_system/meta/projects.json",
                    JSON.stringify(allProjects, null, 2)
                );
            } catch (error) {
            }
        };

        // Debounce slightly to prevent thrashing disk on rapid updates
        const timeout = setTimeout(saveProjectsToDisk, 500);
        return () => clearTimeout(timeout);
    }, [allProjects, isReady]); // Trigger whenever project list changes (including lastModified updates)

    // --- 4. Persistence: Project Metadata (UI State) ---
    useEffect(() => {
        if (!isReady || !activeProjectId) return;

        const metaData = {
            openFiles: fsOpenFiles,
            activeFileId: fsActiveFileId,
            git: {
                isInitialized: git.isInitialized,
                snapshot: git.gitSnapshot,
                history: git.gitHistory,
                staged: git.gitStaged,
            },
        };

        const handler = setTimeout(() => {
            localStorage.setItem(
                `project_meta_${activeProjectId}`,
                JSON.stringify(metaData)
            );
        }, 500);
        return () => clearTimeout(handler);
    }, [
        fsOpenFiles,
        fsActiveFileId,
        git.isInitialized,
        git.gitSnapshot,
        git.gitHistory,
        git.gitStaged,
        activeProjectId,
        isReady,
    ]);

    // --- Loading Guard ---
    if (!isReady || projects.isLoading) {
        return <LoadingScreen />;
    }

    return (
        <IDEContext.Provider
            value={{
                settings,
                projects,
                fileSystem,
                git,
                collab,
                ui,
                wallet,
            }}
        >
            {children}
        </IDEContext.Provider>
    );
};
