import React, { useState, useRef, useEffect } from "react";
import { Coins, Image, File, Trash2, Edit2, Download } from "lucide-react";
import { Project } from "@/types";

interface ProjectListProps {
    projects: Project[];
    activeProject: Project | null;
    onSwitchProject: (id: string) => void;
    onDeleteProject: (id: string) => void;
    onRenameProject: (id: string, newName: string) => void;
    onDownloadProject: (id: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
    projects,
    activeProject,
    onSwitchProject,
    onDeleteProject,
    onRenameProject,
    onDownloadProject,
}) => {
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const formatDate = (ts: number) => new Date(ts).toLocaleDateString();

    useEffect(() => {
        if (renamingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [renamingId]);

    const handleStartRename = (project: Project) => {
        setRenamingId(project.id);
        setRenameValue(project.name);
    };

    const handleSubmitRename = () => {
        if (renamingId && renameValue.trim()) {
            onRenameProject(renamingId, renameValue.trim());
        }
        setRenamingId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSubmitRename();
        } else if (e.key === "Escape") {
            setRenamingId(null);
        }
    };

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <File size={48} className="mb-4 opacity-20" />
                <p className="text-sm">No projects found</p>
                <p className="text-xs opacity-60 mt-1">
                    Create a new project to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {projects.map((project) => (
                <div
                    key={project.id}
                    className={`group flex items-center justify-between p-3 rounded-lg border transition-all ${
                        activeProject?.id === project.id
                            ? "bg-cryonx-accent/5 border-cryonx-accent/30"
                            : "bg-white/5 border-white/5 hover:border-white/10"
                    }`}
                >
                    <div className="flex items-center gap-3 flex-1">
                        <div
                            className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                                activeProject?.id === project.id
                                    ? "bg-cryonx-accent text-white"
                                    : "bg-gray-700 text-gray-400"
                            }`}
                        >
                            {project.template === "coin" ? (
                                <Coins size={16} />
                            ) : project.template === "nft" ? (
                                <Image size={16} />
                            ) : (
                                <File size={16} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            {renamingId === project.id ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) =>
                                        setRenameValue(e.target.value)
                                    }
                                    onBlur={handleSubmitRename}
                                    onKeyDown={handleKeyDown}
                                    className="bg-black/20 border border-cryonx-accent/50 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:border-cryonx-accent"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <>
                                    <div className="text-sm font-bold text-gray-200 truncate">
                                        {project.name}{" "}
                                        {activeProject?.id === project.id && (
                                            <span className="text-[10px] text-cryonx-glow ml-2 border border-cryonx-glow/30 px-1 rounded align-middle">
                                                ACTIVE
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-gray-500 flex items-center gap-2">
                                        <span>
                                            Edited{" "}
                                            {formatDate(project.lastModified)}
                                        </span>
                                        <span>•</span>
                                        <span className="capitalize">
                                            {project.template} Template
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                        {activeProject?.id !== project.id && (
                            <button
                                onClick={() => onSwitchProject(project.id)}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs whitespace-nowrap"
                            >
                                Open
                            </button>
                        )}
                        <button
                            onClick={() => handleStartRename(project)}
                            className="p-1.5 text-gray-500 hover:text-blue-400"
                            title="Rename"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={() => onDownloadProject(project.id)}
                            className="p-1.5 text-gray-500 hover:text-green-400"
                            title="Download"
                        >
                            <Download size={16} />
                        </button>
                        <button
                            onClick={() => onDeleteProject(project.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectList;
