import React, { useState } from "react";
import { Coins, Image, File } from "lucide-react";
import { ProjectTemplateType } from "@/types";

interface CreateProjectFormProps {
    onCreate: (name: string, template: ProjectTemplateType) => void;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ onCreate }) => {
    const [newProjectName, setNewProjectName] = useState("");
    const [selectedTemplate, setSelectedTemplate] =
        useState<ProjectTemplateType>("coin");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;
        onCreate(newProjectName, selectedTemplate);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Project Name
                </label>
                <input
                    autoFocus
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-cryonx-accent"
                    placeholder="My Project"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3">
                    Select Template
                </label>
                <div className="grid grid-cols-3 gap-3">
                    <div
                        onClick={() => setSelectedTemplate("coin")}
                        className={`cursor-pointer p-4 rounded-lg border flex flex-col items-center gap-3 transition-all ${
                            selectedTemplate === "coin"
                                ? "bg-cryonx-accent/20 border-cryonx-accent text-white"
                                : "bg-white/5 border-white/5 hover:bg-white/10 text-gray-400"
                        }`}
                    >
                        <Coins size={24} />
                        <span className="text-xs font-bold">Basic Coin</span>
                    </div>
                    <div
                        onClick={() => setSelectedTemplate("nft")}
                        className={`cursor-pointer p-4 rounded-lg border flex flex-col items-center gap-3 transition-all ${
                            selectedTemplate === "nft"
                                ? "bg-cryonx-accent/20 border-cryonx-accent text-white"
                                : "bg-white/5 border-white/5 hover:bg-white/10 text-gray-400"
                        }`}
                    >
                        <Image size={24} />
                        <span className="text-xs font-bold">
                            NFT Collection
                        </span>
                    </div>
                    <div
                        onClick={() => setSelectedTemplate("blank")}
                        className={`cursor-pointer p-4 rounded-lg border flex flex-col items-center gap-3 transition-all ${
                            selectedTemplate === "blank"
                                ? "bg-cryonx-accent/20 border-cryonx-accent text-white"
                                : "bg-white/5 border-white/5 hover:bg-white/10 text-gray-400"
                        }`}
                    >
                        <File size={24} />
                        <span className="text-xs font-bold">Blank</span>
                    </div>
                </div>
            </div>
            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={!newProjectName.trim()}
                    className="bg-cryonx-accent hover:bg-cryonx-accent/80 text-white px-6 py-2 rounded-md text-sm font-bold transition-colors disabled:opacity-50"
                >
                    Create Project
                </button>
            </div>
        </form>
    );
};

export default CreateProjectForm;
