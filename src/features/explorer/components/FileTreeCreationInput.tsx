import React from "react";
import { Folder, FileText } from "lucide-react";
import { CreationState } from "../hooks/useFileTreeActions";

interface FileTreeCreationInputProps {
    depth: number;
    creationState: CreationState | null;
    creationName: string;
    setCreationName: (name: string) => void;
    handleCreationSubmit: () => void;
    setCreationState: (state: CreationState | null) => void;
    creationInputRef: React.RefObject<HTMLInputElement | null>;
}

const FileTreeCreationInput: React.FC<FileTreeCreationInputProps> = ({
    depth,
    creationState,
    creationName,
    setCreationName,
    handleCreationSubmit,
    setCreationState,
    creationInputRef,
}) => {
    if (!creationState) return null;

    return (
        <div
            className="flex items-center gap-1 py-1.5 border-l-2 border-transparent pl-3"
            style={{ paddingLeft: `${depth * 12 + 12}px` }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="shrink-0 w-4 h-4 flex items-center justify-center mr-0.5">
                {/* Indentation Spacer */}
            </div>
            <div className="shrink-0 mr-1.5">
                {creationState.type === "folder" ? (
                    <Folder size={16} className="text-gray-500" />
                ) : (
                    <FileText className="w-4 h-4 text-gray-400" />
                )}
            </div>
            <input
                ref={creationInputRef}
                value={creationName}
                onChange={(e) => setCreationName(e.target.value)}
                onBlur={handleCreationSubmit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreationSubmit();
                    if (e.key === "Escape") setCreationState(null);
                }}
                className="bg-black/50 border border-cryonx-accent/50 text-white text-sm px-1 py-0 rounded w-full focus:outline-none h-5 leading-none"
                placeholder={
                    creationState.type === "file"
                        ? "module.move"
                        : "folder_name"
                }
                autoFocus
            />
        </div>
    );
};

export default FileTreeCreationInput;
