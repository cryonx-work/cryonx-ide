"use client";
import React, { useState } from "react";
import { useIDE } from "@/hooks";
import TabItem from "./TabItem";

export const EditorTabs: React.FC = () => {
    const { fileSystem } = useIDE();
    const openFiles = fileSystem.openFiles;
    const [dragOverInfo, setDragOverInfo] = useState<{
        id: string;
        position: "left" | "right";
    } | null>(null);

    return (
        <div className="min-h-10 bg-[#0B0E14] border-b border-white/5 flex items-center justify-between">
            <div className="flex-1 flex overflow-x-auto">
                {openFiles.map((fileId) => (
                    <TabItem
                        key={fileId}
                        fileId={fileId}
                        dragOverInfo={dragOverInfo}
                        setDragOverInfo={setDragOverInfo}
                    />
                ))}
            </div>
            <div className="w-4 bg-[#0B0E14]" />
        </div>
    );
};
