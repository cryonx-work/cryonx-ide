import React from "react";
import { Terminal as TerminalIcon } from "lucide-react";

interface TerminalHeaderProps {
    onClear: () => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({ onClear }) => {
    return (
        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-cryonx-glassBorder">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <TerminalIcon className="w-3 h-3" />
                <span>TERMINAL</span>
            </div>
            <button
                onClick={onClear}
                className="text-xs px-2 py-1 hover:bg-white/10 rounded text-gray-400 transition-colors"
            >
                Clear
            </button>
        </div>
    );
};
