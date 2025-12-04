"use client";
import React, { useState } from "react";
import FileTreeSection from "./components/FileTreeSection";
import { useIDE } from "@/hooks";
import { processDropItems } from "@/utils";
import { ExplorerLoading } from "./components/ExplorerLoading";
import { ExplorerWelcome } from "./components/ExplorerWelcome";

const Explorer: React.FC = () => {
    const { projects, ui } = useIDE();
    const activeProject = projects.activeProject;
    const [isDragging, setIsDragging] = useState(false);

    const handleWelcomeDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.items) {
            const items = await processDropItems(e.dataTransfer.items);
            if (items.length > 0) {
                // Determine project name from first item if it's a folder, else "My Project"
                let projectName = "My Project";
                const rootFolders = items.filter(
                    (i) => i.parentId === null && i.type === "folder"
                );
                if (rootFolders.length === 1) {
                    projectName = rootFolders[0].name;
                }
                projects.importProject(projectName, items);
            }
        }
    };

    if (projects.isLoading) {
        return <ExplorerLoading />;
    }

    return (
        <div
            className="w-full h-full flex flex-col bg-[#0d1017]"
            onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
            }}
            onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
            }}
            onDrop={handleWelcomeDrop}
        >
            <div className="h-9 px-4 flex items-center justify-between text-xs font-bold text-gray-500 tracking-wider shrink-0 bg-[#13161f] select-none">
                <span>EXPLORER</span>
            </div>
            {activeProject ? (
                <div className="flex-1 flex flex-col overflow-hidden custom-scrollbar">
                    <FileTreeSection />
                </div>
            ) : (
                <ExplorerWelcome
                    isDragging={isDragging}
                    onOpenProjectManager={ui.openProjectManager}
                    onCreateProject={() => {
                        ui.openProjectManager();
                        ui.setProjectManagerView("create");
                    }}
                />
            )}
        </div>
    );
};

export default Explorer;
