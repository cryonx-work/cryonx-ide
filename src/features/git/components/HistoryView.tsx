import React from "react";
import { GitGraph } from "lucide-react";
import { Commit } from "@/types";

interface HistoryViewProps {
    history: Commit[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
    return (
        <div className="border-t border-white/5 mt-2">
            <div className="px-3 py-2 bg-[#13161f] text-xs font-bold text-gray-400 uppercase tracking-wider">
                History
            </div>
            <div className="p-2 space-y-3">
                {history.length === 0 ? (
                    <div className="text-[10px] text-gray-600 italic text-center py-2">
                        No commits yet
                    </div>
                ) : (
                    history.map((commit) => (
                        <div
                            key={commit.hash}
                            className="bg-white/5 rounded p-2 text-xs border border-white/5"
                        >
                            <div className="font-bold text-gray-200 mb-1">
                                {commit.message}
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>{commit.author}</span>
                                <span>
                                    {new Date(
                                        commit.timestamp
                                    ).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-cryonx-glow">
                                <GitGraph size={10} />{" "}
                                {commit.hash.substring(0, 7)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
