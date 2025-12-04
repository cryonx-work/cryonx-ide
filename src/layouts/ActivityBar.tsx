import React from "react";
import {
    Files,
    Search,
    Bug,
    Sparkles,
    Settings,
    MessageSquare,
    Briefcase,
    GitGraph,
} from "lucide-react";
import { useIDE } from "@/hooks";
import { ActivityBarIcon } from "@/components";

const ActivityBar: React.FC = () => {
    const { ui } = useIDE();

    return (
        <div className="w-15 flex flex-col items-center bg-cryonx-bg border-r border-white/5 z-20">
            {/* Project Manager Trigger */}
            <button
                onClick={ui.openProjectManager}
                className="w-15 h-15 flex items-center justify-center text-cryonx-glow hover:text-white opacity-80 hover:opacity-100 transition-all mb-2 mt-1"
                title="Project Manager"
            >
                <Briefcase strokeWidth={1.5} size={24} />
            </button>

            <div className="w-8 h-px bg-white/10 mb-2" />

            <ActivityBarIcon view="explorer" icon={Files} />
            <ActivityBarIcon view="search" icon={Search} />
            <ActivityBarIcon view="source-control" icon={GitGraph} />
            <ActivityBarIcon view="debug" icon={Bug} />
            <ActivityBarIcon view="ai" icon={Sparkles} />

            <div className="flex-1" />

            {/* Feedback Button */}
            <button
                onClick={ui.openFeedback}
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-cryonx-glow opacity-60 hover:opacity-100 transition-all mb-1"
                title="Send Feedback"
            >
                <MessageSquare strokeWidth={1.5} size={20} />
            </button>

            {/* Settings Button */}
            <button
                onClick={ui.openSettings}
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white opacity-60 hover:opacity-100 mb-2"
                title="Settings"
            >
                <Settings strokeWidth={1.5} size={24} />
            </button>
        </div>
    );
};
export default ActivityBar;
