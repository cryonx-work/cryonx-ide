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
import { fsService } from "@/services";
import { LoadingScreen } from "@/components";
import { dappConfig } from "@/config/dapp";
import { useClaimSecretKey } from "@/hooks/useClaimSecretKey";

export const IDEProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isReady, setIsReady] = useState(false);
    const claimSecretKey = useClaimSecretKey();

    const settings = useSettingsStore();
    const projects = useProjectStore();
    const collab = useCollaborationStore();
    const fileSystem = useFileSystemStore();
    const git = useGitStore();
    const ui = useUIStore();
    const wallet = useWalletStore();

    // --- Initialization ---
    useEffect(() => {
        const init = async () => {
            try {
                // Preload Monaco Editor and assets
                loader.init().catch(() => {});
                fetch("/lib/onigasm.wasm").catch(() => {});
                fetch("/grammars/move.tmLanguage.json").catch(() => {});

                // Parallelize independent loads
                const fsInitPromise = fsService.init();
                const settingsPromise = settings.loadSettings();

                // Wait for FS and Settings
                await Promise.all([fsInitPromise, settingsPromise]);

                // Initialize Projects (depends on FS)
                await projects.init();

                collab.init(); // Initialize collaboration from URL if present

                // Initialize Wallet
                wallet.init([], {
                    ...dappConfig,
                    cedraConnect: {
                        claimSecretKey,
                    },
                });

                setIsReady(true);

                setIsReady(true);
            } catch (error) {
                console.error("Failed to initialize IDE", error);
            }
        };
        init();
    }, []);

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

    // --- Side Effects: Auto-Save & Git Calculation ---
    const {
        items: fsItems,
        lastAction,
        openFiles: fsOpenFiles,
        activeFileId: fsActiveFileId,
    } = fileSystem;
    const { activeProjectId } = projects;
    const { config } = settings;

    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (isFirstLoad.current || !isReady) {
            isFirstLoad.current = false;
            return;
        }

        if (activeProjectId && fsItems.length > 0) {
            // Auto-Save
            // Guests should NOT save to the main project database (they use y-indexeddb via collabService)
            if (config.autoSave && collab.role !== "guest") {
                // Use a shorter delay for structural changes (create/delete/rename) to update Git status faster
                const delay =
                    lastAction?.type === "structure"
                        ? 50
                        : config.autoSaveDelay;

                const handler = setTimeout(async () => {
                    // Sync to ZenFS (Content)
                    await fsService.syncToFS(activeProjectId, fsItems);

                    // Refresh Git Status
                    if (git.isInitialized) {
                        await git.refreshStatus();
                    }

                    // Update Last Modified
                    projects.setAllProjects((prev) =>
                        prev.map((p) =>
                            p.id === activeProjectId
                                ? { ...p, lastModified: Date.now() }
                                : p
                        )
                    );

                    // Persist project list update
                    fsService
                        .writeFile(
                            "/system/projects.json",
                            JSON.stringify(projects.allProjects)
                        )
                        .catch(console.error);
                }, delay);

                return () => clearTimeout(handler);
            }
        }
    }, [
        fsItems,
        lastAction,
        activeProjectId,
        config.autoSave,
        config.autoSaveDelay,
        git.isInitialized,
        isReady,
    ]);

    // --- Persistence: Project Metadata ---
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
