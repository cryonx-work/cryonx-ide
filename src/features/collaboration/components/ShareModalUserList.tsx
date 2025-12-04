import React from "react";
import { Collaborator } from "@/types";

interface ShareModalUserListProps {
    collaborators: Collaborator[];
    userName: string | null;
}

const ShareModalUserList: React.FC<ShareModalUserListProps> = ({
    collaborators,
    userName,
}) => {
    if (collaborators.length === 0) return null;

    return (
        <div className="pt-2">
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                Active Users ({collaborators.length})
            </label>
            <div className="flex flex-wrap gap-2">
                {collaborators.map((c) => (
                    <div
                        key={c.id}
                        className={`flex items-center gap-2 px-2 py-1 rounded-full border ${
                            c.name === userName
                                ? "bg-cryonx-accent/20 border-cryonx-accent/50"
                                : "bg-white/5 border-white/5"
                        }`}
                    >
                        <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                            style={{ backgroundColor: c.color }}
                        >
                            {c.name.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-300">
                            {c.name}{" "}
                            {c.isHost
                                ? "(Host)"
                                : c.name === userName && "(You)"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShareModalUserList;
