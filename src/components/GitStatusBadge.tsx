import React from "react";

interface GitStatusBadgeProps {
    status?: string;
    staged?: boolean;
}

export const getGitColor = (status?: string) => {
    if (!status) return "";
    switch (status) {
        case "modified":
            return "text-yellow-400";
        case "added":
            return "text-[#73c991]";
        case "new": // Untracked
            return "text-green-500";
        case "deleted":
            return "text-red-400 line-through opacity-70";
        default:
            return "";
    }
};

export const GitStatusBadge: React.FC<GitStatusBadgeProps> = ({
    status,
    staged,
}) => {
    if (!status) return null;

    let effectiveStatus = status;
    if (status === "new" && staged) {
        effectiveStatus = "added";
    }

    let letter = "";
    switch (effectiveStatus) {
        case "modified":
            letter = "M";
            break;
        case "deleted":
            letter = "D";
            break;
        case "added":
            letter = "A";
            break;
        case "new":
            letter = "U";
            break;
        default:
            return null;
    }

    const color = getGitColor(effectiveStatus);

    return (
        <span className={`text-[10px] font-bold ml-2 ${color}`}>{letter}</span>
    );
};
