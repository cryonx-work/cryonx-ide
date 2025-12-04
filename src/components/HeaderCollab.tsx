import React from "react";
import { Users, Share2 } from "lucide-react";
import { Collaborator } from "@/types";

interface HeaderCollabProps {
    isCollabActive: boolean;
    collaborators: Collaborator[];
    onShare: () => void;
}

export const HeaderCollab: React.FC<HeaderCollabProps> = ({
    isCollabActive,
    collaborators,
    onShare,
}) => {
    return (
        <div className="flex items-center mr-2">
            {isCollabActive && (
                <div className="flex -space-x-2 mr-3">
                    {collaborators.map((c) => (
                        <div
                            key={c.id}
                            className="w-6 h-6 rounded-full border border-cryonx-bg flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                        >
                            {c.name.charAt(0)}
                        </div>
                    ))}
                </div>
            )}
            <button
                onClick={onShare}
                className={`p-1.5 rounded transition-all ${
                    isCollabActive
                        ? "bg-green-500/20 text-green-400"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
                title="Share Project"
            >
                {isCollabActive ? <Users size={16} /> : <Share2 size={16} />}
            </button>
        </div>
    );
};
