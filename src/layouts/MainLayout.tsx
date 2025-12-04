"use client";
import React from "react";
import { useIDE, useDebugger, useSidebarResize } from "@/hooks";
import Header from "./Header";
import ActivityBar from "./ActivityBar";
import Terminal from "@/features/terminal/Terminal";
import FeedbackModal from "@/features/feedback/FeedbackModal";
import SettingsMenu from "@/features/settings/SettingsMenu";
import ProjectManagerModal from "@/features/projects/ProjectManagerModal";
import StatusBar from "./StatusBar";
import { SidePanel, EditorTabs, EditorArea } from "@/components";
import SessionNotFoundModal from "@/features/collaboration/SessionNotFoundModal";

const MainLayout: React.FC = () => {
    const { fileSystem, ui, collab } = useIDE();
    const { debugState, toggleBreakpoint, step, setDebugState, stopDebugging } =
        useDebugger();

    const { sidebarWidth, isResizing, startResizing } = useSidebarResize();
    const activeFile = fileSystem.getActiveFile();

    return (
        <div className="flex flex-col h-screen w-screen bg-cryonx-bg text-gray-300 font-sans overflow-hidden select-none">
            <Header />

            <div className="flex-1 flex overflow-hidden">
                <ActivityBar />

                {/* Side Panel */}
                {ui.activeView && (
                    <>
                        <SidePanel
                            width={sidebarWidth}
                            debugState={debugState}
                            onStep={step}
                            onPause={() =>
                                setDebugState((p) => ({
                                    ...p,
                                    isPaused: true,
                                }))
                            }
                            onStop={stopDebugging}
                            currentCode={activeFile?.content || ""}
                        />
                        {/* Resizer Handle */}
                        <div
                            onMouseDown={startResizing}
                            className={`absolute w-1 cursor-col-resize hover:bg-cryonx-accent/50 z-10 transition-colors ${
                                isResizing
                                    ? "bg-cryonx-accent"
                                    : "bg-transparent"
                            }`}
                            style={{
                                left: sidebarWidth + 55,
                                top: 40,
                                bottom: 24,
                            }} // Adjusted position logic
                        />
                    </>
                )}

                {/* Editor Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0B0E14] relative">
                    <EditorTabs />

                    <EditorArea
                        activeFile={activeFile}
                        debugState={debugState}
                        onUpdateContent={fileSystem.updateFileContent}
                        onToggleBreakpoint={toggleBreakpoint}
                        highlightQuery={ui.highlightQuery}
                        scrollToLine={ui.scrollToLine}
                    />

                    <div className="h-48 border-t border-white/5 bg-[#0B0E14]">
                        <Terminal logs={ui.logs} onClear={ui.clearLogs} />
                    </div>
                </div>
            </div>

            <StatusBar />

            {ui.isFeedbackOpen && <FeedbackModal />}
            {ui.isSettingsOpen && <SettingsMenu />}
            {ui.isProjectManagerOpen && <ProjectManagerModal />}
            {collab.isSessionNotFound && <SessionNotFoundModal />}
        </div>
    );
};
export default MainLayout;
