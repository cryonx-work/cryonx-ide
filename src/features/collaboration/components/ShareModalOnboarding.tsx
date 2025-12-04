import React from "react";
import { User } from "lucide-react";

interface ShareModalOnboardingProps {
    hostName: string;
    setHostName: (name: string) => void;
    onContinue: () => void;
}

const ShareModalOnboarding: React.FC<ShareModalOnboardingProps> = ({
    hostName,
    setHostName,
    onContinue,
}) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-400 mb-2">
                <User size={32} />
            </div>
            <div className="text-center space-y-1">
                <h3 className="text-white font-bold">
                    Welcome to Collaboration
                </h3>
                <p className="text-xs text-gray-400">
                    Please enter your display name to continue
                </p>
            </div>
            <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && hostName.trim()) {
                        onContinue();
                    }
                }}
                placeholder="Enter your name..."
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cryonx-accent transition-colors text-center"
                autoFocus
            />
            <button
                onClick={onContinue}
                disabled={!hostName.trim()}
                className="w-full bg-cryonx-accent hover:bg-cryonx-accent/80 text-white py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Continue
            </button>
        </div>
    );
};

export default ShareModalOnboarding;
