import React from "react";
import { FolderOpen, FolderPlus, UploadCloud, Database } from "lucide-react";
import { formatBytes } from "@/utils";

interface ProjectSidebarProps {
    currentView: "list" | "create" | "import";
    onViewChange: (view: "list" | "create" | "import") => void;
    storageUsage: { used: number; total: number };
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
    currentView,
    onViewChange,
    storageUsage,
}) => {


    const usagePercent = Math.min(
        100,
        (storageUsage.used / storageUsage.total) * 100
    );

    return (
        <div className="w-48 bg-[#0b0e14] border-r border-white/5 flex flex-col">
            <div className="p-4 border-b border-white/5 font-bold text-sm text-cryonx-glow">
                PROJECTS
            </div>
            <div className="flex-1 p-2 space-y-1">
                <button
                    onClick={() => onViewChange("list")}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-all flex items-center gap-2 ${
                        currentView === "list"
                            ? "bg-cryonx-accent/20 text-white"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <FolderOpen size={14} /> My Projects
                </button>
                <button
                    onClick={() => onViewChange("create")}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-all flex items-center gap-2 ${
                        currentView === "create"
                            ? "bg-cryonx-accent/20 text-white"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <FolderPlus size={14} /> New Project
                </button>
                <button
                    onClick={() => onViewChange("import")}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-all flex items-center gap-2 ${
                        currentView === "import"
                            ? "bg-cryonx-accent/20 text-white"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <UploadCloud size={14} /> Import from Disk
                </button>
            </div>

            {/* Storage Stats */}
            <div className="p-4 border-t border-white/5 bg-[#13161f]">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2">
                    <Database size={12} /> STORAGE
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mb-1">
                    <div
                        className="h-full bg-cryonx-accent transition-all duration-500"
                        style={{ width: `${usagePercent}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                    <span>{formatBytes(storageUsage.used)}</span>
                    <span>{formatBytes(storageUsage.total)}</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectSidebar;
