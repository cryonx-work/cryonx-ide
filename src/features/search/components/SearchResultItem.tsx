import React from "react";
import { ChevronRight, ChevronDown, FileText } from "lucide-react";
import { SearchResult } from "../types";

interface SearchResultItemProps {
    result: SearchResult;
    isExpanded: boolean;
    onToggle: (fileId: string) => void;
    onMatchClick: (fileId: string, line: number) => void;
    query: string;
}

const escapeHtml = (str: string) => {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const highlight = (text: string, query: string) => {
    if (!query) return escapeHtml(text);

    const escapedText = escapeHtml(text).toLowerCase();
    const escapedQuery = escapeHtml(query).toLowerCase();

    const index = escapedText.indexOf(escapedQuery);
    if (index === -1) return escapedText;

    const start = Math.max(0, index - 20);
    const end = Math.min(text.length, index + query.length + 20);

    const prefix = start > 0 ? "..." : "";
    const suffix = end < text.length ? "..." : "";

    const before = escapedText.slice(start, index);
    const match = escapedText.slice(index, index + query.length);
    const after = escapedText.slice(index + query.length, end);

    return (
        prefix +
        `${before}<mark class="bg-[#defb0080] text-[#8200fb]">${match}</mark>` +
        after +
        suffix
    );
};

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
    result,
    isExpanded,
    onToggle,
    onMatchClick,
    query,
}) => {
    return (
        <div className="mb-2">
            <div
                className="flex items-center gap-1 cursor-pointer hover:bg-white/5 rounded px-2 py-1 text-sm font-bold text-gray-300"
                onClick={() => onToggle(result.fileId)}
            >
                {isExpanded ? (
                    <ChevronDown size={20} />
                ) : (
                    <ChevronRight size={20} />
                )}
                <FileText size={20} className="text-cryonx-accent" />
                <span>{result.fileName}</span>
                <span className="ml-auto bg-white/10 px-1.5 rounded-full text-[10px] text-gray-400">
                    {result.matches.length}
                </span>
            </div>

            {isExpanded && (
                <div className="ml-1 border-l border-white/5 pl-1 mt-1 space-y-0.5">
                    {result.matches.map((match, idx) => (
                        <div
                            key={idx}
                            className="cursor-pointer hover:bg-white/5 px-2 py-1 rounded text-[14px] font-mono text-gray-400 truncate flex gap-2"
                            onClick={() =>
                                onMatchClick(result.fileId, match.line)
                            }
                        >
                            <span className="text-gray-600 w-4 text-right">
                                {match.line}
                            </span>
                            <span
                                className="text-[13px] ml-1 font-mono text-gray-400 whitespace-nowrap overflow-hidden"
                                dangerouslySetInnerHTML={{
                                    __html: highlight(match.text, query),
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
