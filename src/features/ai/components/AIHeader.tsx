import React from "react";
import { Settings } from "lucide-react";

interface AIHeaderProps {
    isEnvKey: boolean;
    isConfigured: boolean;
    showSettings: boolean;
    setShowSettings: (show: boolean) => void;
}

export const AIHeader: React.FC<AIHeaderProps> = ({
    isEnvKey,
    isConfigured,
    showSettings,
    setShowSettings,
}) => {
    return (
        <div className="h-10 px-4 border-b border-white/5 flex items-center justify-between bg-[#13161f]">
            <div className="flex items-center gap-2 text-cryonx-glow font-bold text-xs uppercase tracking-wider">
                <span>Cryonx AI Assistant</span>
            </div>
            {!isEnvKey && isConfigured && (
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                        showSettings
                            ? "bg-white/10 text-white"
                            : "text-gray-400"
                    }`}
                >
                    <Settings size={14} />
                </button>
            )}
        </div>
    );
};
