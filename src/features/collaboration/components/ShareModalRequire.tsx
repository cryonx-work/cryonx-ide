import { AlertTriangle } from "lucide-react";
import React from "react";

interface ShareModalRequireProps {
    onClose: () => void;
    onOpenProjectManagerView: () => void;
}

const ShareModalRequire: React.FC<ShareModalRequireProps> = ({
    onClose,
    onOpenProjectManagerView,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-500">
                <AlertTriangle size={32} />
            </div>
            <div>
                <h3 className="text-lg font-medium text-white">
                    No Project Open
                </h3>
                <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                    You need to open a project before you can start a
                    collaboration session.
                </p>
            </div>
            <button
                onClick={() => {
                    onOpenProjectManagerView();
                    onClose();
                }}
                className="px-4 py-2 bg-cryonx-accent hover:bg-cryonx-accent/80 text-white rounded-md transition-colors text-sm font-medium"
            >
                Open Project Manager
            </button>
        </div>
    );
};

export default ShareModalRequire;
