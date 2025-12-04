"use client";
import React, { useState } from "react";
import { useIDE } from "@/hooks";
import { EmptyState } from "./components/EmptyState";
import { SourceControlHeader } from "./components/SourceControlHeader";
import { CommitInput } from "./components/CommitInput";
import { ChangeList } from "./components/ChangeList";
import { HistoryView } from "./components/HistoryView";

const SourceControlPanel: React.FC = () => {
    const { git } = useIDE();
    const [commitMessage, setCommitMessage] = useState("");
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const handleCommit = () => {
        if (!commitMessage.trim()) return;
        git.commit(commitMessage);
        setCommitMessage("");
    };

    if (!git.isInitialized) {
        return <EmptyState />;
    }

    return (
        <div className="w-full h-full flex flex-col bg-[#0d1017]">
            <SourceControlHeader
                isHistoryOpen={isHistoryOpen}
                setIsHistoryOpen={setIsHistoryOpen}
            />

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <CommitInput
                    commitMessage={commitMessage}
                    setCommitMessage={setCommitMessage}
                    handleCommit={handleCommit}
                    isStagedEmpty={git.gitStaged.length === 0}
                />

                {/* Staged Changes */}
                <div className="p-2">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 px-1 flex justify-between">
                        <span>Staged Changes</span>
                        <span className="bg-white/10 px-1.5 rounded-full text-white">
                            {git.gitStaged.length}
                        </span>
                    </div>
                    <div className="space-y-0.5">
                        <ChangeList changes={git.gitStaged} isStaged={true} />
                    </div>
                </div>

                {/* Working Changes */}
                <div className="p-2 border-t border-white/5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 px-1 flex justify-between">
                        <span>Changes</span>
                        <span className="bg-white/10 px-1.5 rounded-full text-white">
                            {git.gitChanges.length}
                        </span>
                    </div>
                    <div className="space-y-0.5">
                        <ChangeList changes={git.gitChanges} isStaged={false} />
                    </div>
                </div>

                {/* History Section */}
                {isHistoryOpen && <HistoryView history={git.gitHistory} />}
            </div>
        </div>
    );
};

export default SourceControlPanel;
