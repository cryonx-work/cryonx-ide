import React from "react";
import { Check } from "lucide-react";

interface CommitInputProps {
    commitMessage: string;
    setCommitMessage: (message: string) => void;
    handleCommit: () => void;
    isStagedEmpty: boolean;
}

export const CommitInput: React.FC<CommitInputProps> = ({
    commitMessage,
    setCommitMessage,
    handleCommit,
    isStagedEmpty,
}) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleCommit();
        }
    };

    return (
        <div className="p-3 border-b border-white/5 bg-[#151923]">
            <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message (Ctrl+Enter to commit)"
                className="w-full bg-black/30 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-cryonx-accent resize-none h-16 mb-2"
            />
            <button
                onClick={handleCommit}
                disabled={isStagedEmpty || !commitMessage.trim()}
                className="w-full bg-cryonx-accent hover:bg-cryonx-accent/80 text-white py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Check size={12} /> Commit
            </button>
        </div>
    );
};
