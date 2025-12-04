import React from "react";
import { Plus, Minus } from "lucide-react";
import { GitChange } from "@/types";
import { getGitColor } from "@/components/GitStatusBadge";
import { useIDE } from "@/hooks";

interface ChangeListProps {
    changes: GitChange[];
    isStaged: boolean;
}

export const ChangeList: React.FC<ChangeListProps> = ({
    changes,
    isStaged,
}) => {
    const { git } = useIDE();

    if (changes.length === 0)
        return (
            <div className="text-[10px] text-gray-600 italic px-2 py-1">
                No changes
            </div>
        );

    return (
        <>
            {changes.map((change) => {
                const effectiveStatus =
                    change.status === "new" && isStaged
                        ? "added"
                        : change.status;
                let letter = "";
                switch (effectiveStatus) {
                    case "modified":
                        letter = "M";
                        break;
                    case "added":
                        letter = "A";
                        break;
                    case "new":
                        letter = "U";
                        break;
                    case "deleted":
                        letter = "D";
                        break;
                }

                return (
                    <div
                        key={change.fileId}
                        className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded group text-xs"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span
                                className={`text-[10px] font-bold uppercase w-3 ${getGitColor(
                                    effectiveStatus
                                )}`}
                            >
                                {letter}
                            </span>
                            <span className="text-gray-300 truncate">
                                {change.path}
                            </span>
                        </div>
                        <button
                            onClick={() =>
                                isStaged
                                    ? git.unstageFile(change)
                                    : git.stageFile(change)
                            }
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                            title={isStaged ? "Unstage" : "Stage"}
                        >
                            {isStaged ? (
                                <Minus size={12} />
                            ) : (
                                <Plus size={12} />
                            )}
                        </button>
                    </div>
                );
            })}
        </>
    );
};
