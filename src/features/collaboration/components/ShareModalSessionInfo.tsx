import React from "react";
import { Power } from "lucide-react";

interface ShareModalSessionInfoProps {
    role: "host" | "guest" | null;
    isCollabActive: boolean;
    displayHostName: string;
    toggleSession: () => void;
}

const ShareModalSessionInfo: React.FC<ShareModalSessionInfoProps> = ({
    role,
    isCollabActive,
    displayHostName,
    toggleSession,
}) => {
    return (
        <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-200">
                    {role === "guest"
                        ? "Connected as Guest"
                        : "Live Collaboration"}
                </span>
                <span className="text-xs text-gray-500">
                    {isCollabActive
                        ? role === "guest"
                            ? `Host: ${displayHostName}`
                            : "Session is active. Users can join."
                        : "Session is offline."}
                </span>
            </div>

            <button
                onClick={toggleSession}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                    isCollabActive
                        ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                        : "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                }`}
            >
                <Power size={14} />
                {isCollabActive
                    ? role === "guest"
                        ? "Leave Session"
                        : "End Session"
                    : "Start Session"}
            </button>
        </div>
    );
};

export default ShareModalSessionInfo;
