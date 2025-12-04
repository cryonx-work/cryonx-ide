import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useIDE } from "@/hooks";
import { projectService } from "@/services";

import ProjectSidebar from "./components/ProjectSidebar";
import ProjectList from "./components/ProjectList";
import CreateProjectForm from "./components/CreateProjectForm";
import ImportProjectZone from "./components/ImportProjectZone";

const ProjectManagerModal: React.FC = () => {
    const { ui, projects, collab } = useIDE();
    const activeProject = projects.allProjects.find(
        (p) => p.id === projects.activeProjectId
    );
    const [storageUsage, setStorageUsage] = useState({ used: 0, total: 100 });

    useEffect(() => {
        navigator.storage.estimate().then((estimate) => {
            if (estimate.quota) {
                setStorageUsage({
                    used: estimate.usage || 0,
                    total: estimate.quota,
                });
            }
        });
    }, [ui.projectManagerView, projects.allProjects]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            ui.closeProjectManager();
        }
    };

    const checkCollabAndProceed = (action: () => void) => {
        if (collab.isCollabActive) {
            if (collab.role === "guest") {
                if (
                    confirm(
                        "Are you sure you want to leave the collaboration session?"
                    )
                ) {
                    collab.leaveSession();
                    action();
                }
            } else if (collab.role === "host") {
                if (
                    confirm(
                        "This action will end the collaboration session for everyone. Continue?"
                    )
                ) {
                    collab.endSession();
                    action();
                }
            }
        } else {
            action();
        }
    };

    const handleDownloadProject = async (projectId: string) => {
        const data = await projects.exportProject(projectId);
        if (data) {
            await projectService.generateZip(data.name, data.items);
        }
    };

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-cryonx-bg/50 backdrop-blur-sm animate-fadeIn"
            onClick={handleOverlayClick}
        >
            <div
                className="w-[700px] h-[550px] bg-[#0d1017] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex"
                onClick={(e) => e.stopPropagation()}
            >
                <ProjectSidebar
                    currentView={ui.projectManagerView}
                    onViewChange={ui.setProjectManagerView}
                    storageUsage={storageUsage}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#13161f]">
                        <h2 className="text-sm font-bold text-white tracking-wide">
                            {ui.projectManagerView === "list"
                                ? "MY WORKSPACE"
                                : ui.projectManagerView === "create"
                                ? "CREATE NEW PROJECT"
                                : "IMPORT PROJECT"}
                        </h2>
                        <button
                            onClick={() => ui.closeProjectManager()}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {ui.projectManagerView === "list" && (
                            <ProjectList
                                projects={projects.allProjects}
                                activeProject={activeProject || null}
                                onSwitchProject={(id) =>
                                    checkCollabAndProceed(() =>
                                        projects.switchProject(id)
                                    )
                                }
                                onDeleteProject={projects.deleteProject}
                                onRenameProject={projects.renameProject}
                                onDownloadProject={handleDownloadProject}
                            />
                        )}

                        {ui.projectManagerView === "create" && (
                            <CreateProjectForm
                                onCreate={(name, template) =>
                                    checkCollabAndProceed(() =>
                                        projects.createProject(name, template)
                                    )
                                }
                            />
                        )}

                        {ui.projectManagerView === "import" && (
                            <ImportProjectZone
                                onImport={(name, items) =>
                                    checkCollabAndProceed(() =>
                                        projects.importProject(name, items)
                                    )
                                }
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectManagerModal;
