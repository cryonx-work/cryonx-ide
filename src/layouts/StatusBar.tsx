import React from "react";
import { useIDE } from "@/hooks";
import {
    Wifi,
    GitBranch,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Code,
} from "lucide-react";

const StatusBar: React.FC = () => {
    const { ui, fileSystem, git } = useIDE();
    const { status } = ui;
    const activeFile = fileSystem.getActiveFile();
    const cursor = activeFile
        ? fileSystem.cursorPositions[activeFile.id]
        : null;

    let bgColor = "bg-cryonx-accent";
    let icon = <CheckCircle2 size={12} />;

    switch (status.type) {
        case "working":
            bgColor = "bg-yellow-600 animate-pulse";
            icon = <Loader2 size={12} className="animate-spin" />;
            break;
        case "error":
            bgColor = "bg-red-600";
            icon = <AlertCircle size={12} />;
            break;
        case "success":
            bgColor = "bg-green-600";
            icon = <CheckCircle2 size={12} />;
            break;
        case "warning":
            bgColor = "bg-orange-600";
            icon = <AlertCircle size={12} />;
            break;
        default:
            bgColor = "bg-cryonx-accent";
    }

    return (
        <div
            className={`h-6 w-full flex items-center justify-between px-3 text-[10px] font-medium text-white select-none transition-colors duration-300 ${bgColor}`}
        >
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    {icon}
                    <span>{status.message}</span>
                </div>
                {git.isInitialized && (
                    <div className="flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer">
                        <GitBranch size={10} />
                        <span>main</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {cursor && (
                    <div className="opacity-80">
                        Ln {cursor.lineNumber}, Col {cursor.column}
                    </div>
                )}
                <div className="flex items-center gap-1 opacity-80">
                    <Code size={10} />
                    <span>
                        {activeFile?.language === "move" ? "Move" : "Markdown"}
                    </span>
                </div>
                <div className="flex items-center gap-1 opacity-80">
                    <Wifi size={10} />
                    <span>{ui.wallet.network || "Cedra Devnet"}</span>
                </div>
            </div>
        </div>
    );
};

export default StatusBar;
