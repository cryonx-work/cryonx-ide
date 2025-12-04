import React from "react";
import { useIDE } from "@/hooks";
import Explorer from "@/features/explorer/Explorer";
import DebugPanel from "@/features/debugger/DebugPanel";
import SourceControlPanel from "@/features/git/SourceControlPanel";
import AIAssistant from "@/features/ai/AIAssistant";
import SearchPanel from "@/features/search/SearchPanel";
import { DebugState } from "@/types";

interface SidePanelProps {
    width: number;
    debugState: DebugState;
    onStep: () => void;
    onPause: () => void;
    onStop: () => void;
    currentCode: string;
}

export const SidePanel: React.FC<SidePanelProps> = ({
    width,
    debugState,
    onStep,
    onPause,
    onStop,
    currentCode,
}) => {
    const { ui } = useIDE();

    if (!ui.activeView) return null;

    return (
        <div
            className="flex flex-col border-r border-white/5 bg-[#0d1017] z-10 relative shrink-0 h-full max-h-full overflow-hidden"
            style={{ width }}
        >
            <div
                className={
                    ui.activeView === "explorer"
                        ? "h-full flex flex-col"
                        : "hidden"
                }
            >
                <Explorer />
            </div>
            <div
                className={
                    ui.activeView === "debug"
                        ? "h-full flex flex-col"
                        : "hidden"
                }
            >
                <DebugPanel
                    debugState={debugState}
                    onContinue={onStep}
                    onPause={onPause}
                    onStop={onStop}
                    onStepOver={onStep}
                    onStepInto={onStep}
                    onStepOut={onStep}
                />
            </div>
            <div
                className={
                    ui.activeView === "source-control"
                        ? "h-full flex flex-col"
                        : "hidden"
                }
            >
                <SourceControlPanel />
            </div>
            <div
                className={
                    ui.activeView === "ai" ? "h-full flex flex-col" : "hidden"
                }
            >
                <AIAssistant
                    currentCode={ui.activeView === "ai" ? currentCode : ""}
                />
            </div>
            <div
                className={
                    ui.activeView === "search"
                        ? "h-full flex flex-col"
                        : "hidden"
                }
            >
                <SearchPanel />
            </div>
        </div>
    );
};
