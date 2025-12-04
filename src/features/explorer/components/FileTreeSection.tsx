import React, { useRef, useEffect, useState } from "react";
import { ArrowDownCircle } from "lucide-react";
import { useFileTree } from "../hooks/useFileTree";
import { ROOT_PROJECT_ID } from "@/config";
import FileTreeContextMenu from "./FileTreeContextMenu";
import FileTreeHeader from "./FileTreeHeader";
import FileTreeList from "./FileTreeList";
import { useIDE } from "@/hooks";

const FileTreeSection: React.FC = () => {
    const {
        items,
        selectedExplorerId,
        openFolders,
        isProjectExpanded,
        renamingId,
        renameValue,
        setRenameValue,
        contextMenu,
        setContextMenu,
        dragOverId,
        isExternalDrag,
        creationState,
        setCreationState,
        creationName,
        setCreationName,
        renameInputRef,
        creationInputRef,
        handleCollapseAll,
        handleRefresh,
        handleHeaderClick,
        handleItemClick,
        handleCreateFromAction,
        handleCreationSubmit,
        handleContextMenu,
        handleToolbarOverflow,
        handleRenameSubmit,
        startRenaming,
        handleCopyPath,
        handleCloseProject,
        handleDragStart,
        handleDragEnd,
        handleContainerDragEnter,
        handleContainerDragLeave,
        handleDragOver,
        handleDrop,
        deleteItem,
        projects,
        selectExplorerItem,
    } = useFileTree();

    const { collab, git } = useIDE();
    const { gitChanges, gitStaged, refreshStatus, isInitialized } = git;
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(300);

    useEffect(() => {
        refreshStatus();
    }, [projects.activeProject, refreshStatus]);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            setContextMenu((prev) => ({ ...prev, visible: false }));
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                if (selectedExplorerId === ROOT_PROJECT_ID) {
                    selectExplorerItem(null);
                }
            }
        };
        window.addEventListener("mousedown", handleClickOutside);
        return () =>
            window.removeEventListener("mousedown", handleClickOutside);
    }, [setContextMenu, selectExplorerItem, selectedExplorerId]);

    const isRootDragOver = dragOverId === "root" || isExternalDrag;
    const isProjectSelected = selectedExplorerId === ROOT_PROJECT_ID;
    const isNarrow = containerWidth < 220;

    return (
        <div
            ref={containerRef}
            className={`w-full h-full flex flex-col bg-[#0d1017] relative transition-all duration-200
            ${
                isRootDragOver
                    ? "ring-2 ring-inset ring-cryonx-accent/30 bg-cryonx-accent/5"
                    : ""
            }
            ${
                !isRootDragOver && isProjectSelected && isProjectExpanded
                    ? "ring-2 ring-inset ring-cryonx-accent/50 bg-cryonx-accent/2"
                    : ""
            }
        `}
            onContextMenu={(e) => handleContextMenu(e, ROOT_PROJECT_ID)}
            onDragEnter={handleContainerDragEnter}
            onDragLeave={handleContainerDragLeave}
            onDragOver={(e) => handleDragOver(e, null)}
            onDrop={(e) => handleDrop(e, null)}
            onClick={() => {
                setContextMenu((prev) => ({ ...prev, visible: false }));
                if (isProjectExpanded) {
                    if (selectedExplorerId === ROOT_PROJECT_ID) {
                        selectExplorerItem(null);
                    } else {
                        selectExplorerItem(ROOT_PROJECT_ID);
                    }
                }
            }}
        >
            {projects.activeProject && (
                <>
                    <FileTreeHeader
                        projectName={projects.activeProject.name}
                        isProjectExpanded={isProjectExpanded}
                        isProjectSelected={isProjectSelected}
                        isProjectLocked={collab.isProjectLocked}
                        isCollabActive={collab.isCollabActive}
                        isNarrow={isNarrow}
                        handleHeaderClick={handleHeaderClick}
                        handleContextMenu={handleContextMenu}
                        handleToolbarOverflow={handleToolbarOverflow}
                        handleCreateFromAction={handleCreateFromAction}
                        handleRefresh={handleRefresh}
                        handleCollapseAll={handleCollapseAll}
                    />

                    <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar relative flex flex-col">
                        {isProjectExpanded && projects.activeProject && (
                            <FileTreeList
                                items={items}
                                openFolders={openFolders}
                                selectedExplorerId={selectedExplorerId}
                                renamingId={renamingId}
                                renameValue={renameValue}
                                setRenameValue={setRenameValue}
                                renameInputRef={renameInputRef}
                                handleRenameSubmit={handleRenameSubmit}
                                handleItemClick={handleItemClick}
                                handleContextMenu={handleContextMenu}
                                handleDragStart={handleDragStart}
                                handleDragEnd={handleDragEnd}
                                handleDragOver={handleDragOver}
                                handleDrop={handleDrop}
                                dragOverId={dragOverId}
                                creationState={creationState}
                                creationName={creationName}
                                setCreationName={setCreationName}
                                creationInputRef={creationInputRef}
                                handleCreationSubmit={handleCreationSubmit}
                                setCreationState={setCreationState}
                                collab={{
                                    collaborators: collab.collaborators,
                                    isProjectLocked: collab.isProjectLocked,
                                    isCollabActive: collab.isCollabActive,
                                }}
                                gitChanges={
                                    isInitialized ? gitChanges : undefined
                                }
                                gitStaged={
                                    isInitialized ? gitStaged : undefined
                                }
                            />
                        )}

                        <div
                            className="flex-1 min-h-[50px] w-full"
                            onContextMenu={(e) => {
                                if (isProjectExpanded) {
                                    handleContextMenu(e, ROOT_PROJECT_ID);
                                } else {
                                    e.stopPropagation();
                                    setContextMenu((prev) => ({
                                        ...prev,
                                        visible: false,
                                    }));
                                }
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setContextMenu((prev) => ({
                                    ...prev,
                                    visible: false,
                                }));
                                if (isProjectExpanded) {
                                    if (
                                        selectedExplorerId === ROOT_PROJECT_ID
                                    ) {
                                        selectExplorerItem(null);
                                    } else {
                                        selectExplorerItem(ROOT_PROJECT_ID);
                                    }
                                }
                            }}
                        />

                        {isExternalDrag && (
                            <div className="absolute inset-0 bg-cryonx-bg/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center border-2 border-dashed border-cryonx-accent/50 m-2 rounded-lg pointer-events-none animate-fadeIn">
                                <ArrowDownCircle
                                    size={48}
                                    className="text-cryonx-accent mb-2 animate-bounce"
                                />
                                <span className="text-cryonx-text font-bold text-sm">
                                    Drop files to upload
                                </span>
                                <span className="text-gray-500 text-xs mt-1">
                                    .move, .txt, .md supported
                                </span>
                            </div>
                        )}
                    </div>

                    <FileTreeContextMenu
                        contextMenu={contextMenu}
                        setContextMenu={setContextMenu}
                        items={items}
                        activeProjectName={projects.activeProject.name}
                        handleCreateFromAction={handleCreateFromAction}
                        handleRefresh={handleRefresh}
                        handleCollapseAll={handleCollapseAll}
                        handleCloseProject={handleCloseProject}
                        startRenaming={startRenaming}
                        handleCopyPath={handleCopyPath}
                        deleteItem={deleteItem}
                    />
                </>
            )}
        </div>
    );
};

export default FileTreeSection;
