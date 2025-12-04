"use client";
import React from "react";
import dynamic from "next/dynamic";
import { FileSystemItem, DebugState } from "@/types";
import { Box } from "lucide-react";

const MonacoWrapper = dynamic(() => import("@/features/editor/MonacoWrapper"), {
    ssr: false,
    loading: () => <div className="flex-1 bg-[#1e1e1e]" />,
});

interface EditorAreaProps {
    activeFile: FileSystemItem | null;
    debugState: DebugState;
    onUpdateContent: (id: string, content: string) => void;
    onToggleBreakpoint: (line: number) => void;
    highlightQuery?: string;
    scrollToLine: number | null;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
    activeFile,
    debugState,
    onUpdateContent,
    onToggleBreakpoint,
    highlightQuery,
    scrollToLine,
}) => {
    return (
        <div className="flex-1 relative bg-[#13161F]">
            {activeFile ? (
                <MonacoWrapper
                    file={activeFile}
                    debugState={debugState}
                    onChange={(v) => onUpdateContent(activeFile.id, v || "")}
                    onToggleBreakpoint={onToggleBreakpoint}
                    highlight={highlightQuery || ""}
                    scrollToLine={scrollToLine}
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <Box size={32} className="opacity-50" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-500">
                            No file is open
                        </p>
                        <p className="text-xs text-gray-700 mt-1">
                            Select a file from the explorer
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
