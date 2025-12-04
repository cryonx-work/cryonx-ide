import React from "react";
import { useIDE } from "@/hooks";

export const EmptyState: React.FC = () => {
    const { git, collab } = useIDE();

    return (
        <div className="w-full h-full flex flex-col bg-[#0d1017]">
            <div className="h-9 px-4 flex items-center justify-between text-xs font-bold text-gray-400 tracking-wider bg-[#13161f] border-b border-white/5">
                <div className="flex items-center gap-2">
                    <span>SOURCE CONTROL</span>
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <p className="text-sm text-gray-400">
                    The current project is not a git repository.
                </p>
                {collab.role !== "guest" && (
                    <button
                        onClick={git.initRepo}
                        className="bg-cryonx-accent hover:bg-cryonx-accent/80 text-white px-4 py-2 rounded text-xs font-bold transition-colors"
                    >
                        Initialize Repository
                    </button>
                )}
            </div>
        </div>
    );
};
