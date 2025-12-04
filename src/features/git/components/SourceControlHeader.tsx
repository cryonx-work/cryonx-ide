import React from "react";
import { Clock } from "lucide-react";

interface SourceControlHeaderProps {
    isHistoryOpen: boolean;
    setIsHistoryOpen: (isOpen: boolean) => void;
}

export const SourceControlHeader: React.FC<SourceControlHeaderProps> = ({
    isHistoryOpen,
    setIsHistoryOpen,
}) => {
    return (
        <div className="h-9 px-4 flex items-center justify-between text-xs font-bold text-gray-400 tracking-wider bg-[#13161f] border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
                <span>SOURCE CONTROL</span>
            </div>
            <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={`p-1 rounded hover:bg-white/10 transition-colors ${
                    isHistoryOpen ? "text-cryonx-glow" : "text-gray-500"
                }`}
                title="Toggle History"
            >
                <Clock size={14} />
            </button>
        </div>
    );
};
