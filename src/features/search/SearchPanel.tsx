"use client";
import React, { useState } from "react";
import { useIDE } from "@/hooks";
import { SearchResult } from "./types";
import { SearchHeader } from "./components/SearchHeader";
import { SearchInput } from "./components/SearchInput";
import { SearchResults } from "./components/SearchResults";

const SearchPanel: React.FC = () => {
    const { fileSystem, ui } = useIDE();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        ui.setHighlightQuery(val);
        if (!val.trim()) {
            setResults([]);
            return;
        }

        const newResults: SearchResult[] = [];
        const lowerQuery = val.toLowerCase();

        fileSystem.items.forEach((item) => {
            if (item.type === "file" && item.content) {
                const matches: { line: number; text: string }[] = [];
                const lines = item.content.split("\n");

                lines.forEach((line, index) => {
                    const escaped = lowerQuery.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    );
                    const regex = new RegExp(escaped, "i");
                    let match;
                    if ((match = regex.exec(line))) {
                        matches.push({ line: index + 1, text: line });
                    }
                });

                if (matches.length > 0) {
                    newResults.push({
                        fileId: item.id,
                        fileName: item.name,
                        matches,
                    });
                }
            }
        });

        setResults(newResults);
        setExpandedFiles(new Set(newResults.map((r) => r.fileId)));
    };

    const toggleFile = (fileId: string) => {
        const newSet = new Set(expandedFiles);
        if (newSet.has(fileId)) newSet.delete(fileId);
        else newSet.add(fileId);
        setExpandedFiles(newSet);
    };

    const handleResultClick = (fileId: string, line: number) => {
        ui.setHighlightQuery(query);
        if (fileSystem.activeFileId === fileId) {
            ui.setScrollToLine(line);
            return;
        }

        fileSystem.openFile(fileId);

        setTimeout(() => {
            fileSystem.updateCursorPosition(fileId, {
                lineNumber: line,
                column: 1,
            });
            ui.setScrollToLine(line);
        }, 50);
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#0d1017]">
            <SearchHeader />
            <SearchInput query={query} onChange={handleSearch} />
            <SearchResults
                results={results}
                query={query}
                expandedFiles={expandedFiles}
                toggleFile={toggleFile}
                handleResultClick={handleResultClick}
            />
        </div>
    );
};

export default SearchPanel;
