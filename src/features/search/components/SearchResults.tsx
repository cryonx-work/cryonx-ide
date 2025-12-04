import React from "react";
import { SearchResult } from "../types";
import { SearchResultItem } from "./SearchResultItem";

interface SearchResultsProps {
    results: SearchResult[];
    query: string;
    expandedFiles: Set<string>;
    toggleFile: (fileId: string) => void;
    handleResultClick: (fileId: string, line: number) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
    results,
    query,
    expandedFiles,
    toggleFile,
    handleResultClick,
}) => {
    if (query && results.length === 0) {
        return (
            <div className="text-center text-gray-500 text-xs mt-4">
                No results found.
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-2">
            {results.map((result) => (
                <SearchResultItem
                    key={result.fileId}
                    result={result}
                    isExpanded={expandedFiles.has(result.fileId)}
                    onToggle={toggleFile}
                    onMatchClick={handleResultClick}
                    query={query}
                />
            ))}
        </div>
    );
};
