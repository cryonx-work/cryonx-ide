import React from "react";
import { Globe } from "lucide-react";

const ShareModalEmptyState: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 opacity-60">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <Globe size={24} className="text-gray-500" />
            </div>
            <p className="text-sm text-gray-400 max-w-[80%]">
                Start a real-time collaboration session to code with your team.
                You will be able to see cursors and edits instantly.
            </p>
        </div>
    );
};

export default ShareModalEmptyState;
