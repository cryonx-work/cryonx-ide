import React from "react";
import { Box, Play, Rocket } from "lucide-react";
import { FileSystemItem } from "@/types";
import { Button } from "./ui";

interface HeaderActionsProps {
    onCompile: () => void;
    isCompiling: boolean;
    onDebug: () => void;
    activeFile: FileSystemItem | null;
    onDeploy: () => void;
    isDeploying: boolean;
    userRole: "host" | "guest" | null;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
    onCompile,
    isCompiling,
    onDebug,
    activeFile,
    onDeploy,
    isDeploying,
    userRole,
}) => {
    return (
        <div className="flex items-center gap-2 bg-[#0d1017] p-1 rounded-lg border border-white/5">
            <Button
                onClick={onCompile}
                disabled={isCompiling || userRole === "guest"}
                variant="secondary"
                className="gap-2"
                title={
                    userRole === "guest"
                        ? "Build disabled for guests"
                        : "Build Entire Package"
                }
            >
                <Box
                    size={14}
                    className={isCompiling ? "animate-pulse text-blue-400" : ""}
                />
                <span className="text-xs font-medium">
                    {isCompiling ? "Building..." : "Build"}
                </span>
            </Button>

            <div className="w-px h-4 bg-white/10" />

            <Button
                onClick={onDebug}
                disabled={!activeFile || userRole === "guest"}
                variant="secondary"
                className="gap-2 hover:text-green-400"
                title={
                    userRole === "guest"
                        ? "Run disabled for guests"
                        : "Run Debugger"
                }
            >
                <Play size={14} />
                <span className="text-xs font-medium">Run</span>
            </Button>

            <div className="w-px h-4 bg-white/10" />

            <Button
                onClick={onDeploy}
                disabled={isDeploying || isCompiling || userRole === "guest"}
                variant="secondary"
                className="gap-2 hover:text-cryonx-glow"
                title={
                    userRole === "guest"
                        ? "Deploy disabled for guests"
                        : "Publish to Network"
                }
            >
                <Rocket
                    size={14}
                    className={
                        isDeploying ? "animate-bounce text-cryonx-glow" : ""
                    }
                />
                <span className="text-xs font-medium">
                    {isDeploying ? "Deploying..." : "Publish"}
                </span>
            </Button>
        </div>
    );
};
