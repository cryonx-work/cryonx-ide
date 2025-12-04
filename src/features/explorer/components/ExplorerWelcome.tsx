import React from "react";
import { UploadCloud, FolderPlus, Briefcase } from "lucide-react";

interface ExplorerWelcomeProps {
    isDragging: boolean;
    onOpenProjectManager: () => void;
    onCreateProject: () => void;
}

export const ExplorerWelcome: React.FC<ExplorerWelcomeProps> = ({
    isDragging,
    onOpenProjectManager,
    onCreateProject,
}) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 relative">
            {isDragging ? (
                <div className="absolute inset-0 bg-cryonx-bg/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center border-2 border-dashed border-cryonx-accent/50 m-4 rounded-xl animate-fadeIn pointer-events-none">
                    <UploadCloud
                        size={48}
                        className="text-cryonx-accent mb-2 animate-bounce"
                    />
                    <span className="text-cryonx-text font-bold text-sm">
                        Create Project from Folder
                    </span>
                    <span className="text-gray-500 text-xs mt-1">
                        Drop a folder here to start
                    </span>
                </div>
            ) : (
                <>
                    <div className="text-gray-400 text-sm font-medium">
                        No Open Project
                    </div>
                    <div className="text-gray-600 text-xs">
                        Open a project or create a new one to start coding.
                    </div>

                    <div className="w-full space-y-2">
                        <button
                            onClick={onOpenProjectManager}
                            className="w-full flex items-center justify-center gap-2 bg-cryonx-accent/10 hover:bg-cryonx-accent/20 border border-cryonx-accent/30 text-cryonx-glow py-2 rounded text-xs font-bold transition-all"
                        >
                            <Briefcase size={14} /> Open Project
                        </button>
                        <button
                            onClick={onCreateProject}
                            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 py-2 rounded text-xs font-bold transition-all"
                        >
                            <FolderPlus size={14} /> Create New Project
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 w-full">
                        <p className="text-[10px] text-gray-600">
                            Tip: You can drag and drop a folder here to
                            instantly create a new project from it.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};
