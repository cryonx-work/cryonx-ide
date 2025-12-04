import React from "react";

interface ShareModalUserProfileProps {
    userName: string | null;
    hostName: string;
    setHostName: (name: string) => void;
    handleRename: () => void;
}

const ShareModalUserProfile: React.FC<ShareModalUserProfileProps> = ({
    userName,
    hostName,
    setHostName,
    handleRename,
}) => {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">
                Your Display Name
            </label>
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder={userName || "Guest"}
                    className="flex-1 bg-black/30 border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-cryonx-accent"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                />
                <button
                    onClick={handleRename}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors"
                >
                    Rename
                </button>
            </div>
        </div>
    );
};

export default ShareModalUserProfile;
