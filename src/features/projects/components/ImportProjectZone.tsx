"use client";
import React, { useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { FileSystemItem } from "@/types";
import { nanoid } from "nanoid";
import { processDropItems } from "../../../utils/fileUtils";
import { toast } from "sonner";

interface ImportProjectZoneProps {
    onImport: (name: string, items: FileSystemItem[]) => void;
}

const MAX_PROJECT_SIZE = 1024 * 1024; // 1MB

const ImportProjectZone: React.FC<ImportProjectZoneProps> = ({ onImport }) => {
    const [isImporting, setIsImporting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve((e.target?.result as string) || "");
            reader.readAsText(file);
        });
    };

    const handleFolderSelect = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const files = Array.from(e.target.files);
        const totalSize = files.reduce((acc, file) => acc + file.size, 0);

        if (totalSize > MAX_PROJECT_SIZE) {
            toast.error("Project size exceeds 1MB limit.");
            return;
        }

        setIsImporting(true);
        const importedItems: FileSystemItem[] = [];
        const pathMap = new Map<string, string>(); // path -> id

        try {
            for (const file of files) {
                const pathParts = (file.webkitRelativePath || file.name).split(
                    "/"
                );
                let currentParentId: string | null = null;
                let currentPath = "";

                // Process directories (skip first level - root folder)
                for (let i = 0; i < pathParts.length - 1; i++) {
                    const folderName = pathParts[i];
                    currentPath = currentPath
                        ? `${currentPath}/${folderName}`
                        : folderName;

                    if (!pathMap.has(currentPath)) {
                        const folderId =
                            Date.now().toString() +
                            Math.random().toString(36).substr(2, 5);
                        importedItems.push({
                            id: folderId,
                            parentId: currentParentId,
                            name: folderName,
                            type: "folder",
                        });
                        pathMap.set(currentPath, folderId);
                        currentParentId = folderId;
                    } else {
                        currentParentId = pathMap.get(currentPath)!;
                    }
                }

                // Process File
                const fileName = pathParts[pathParts.length - 1];
                const content = await readFile(file);

                importedItems.push({
                    id: nanoid(),
                    parentId: currentParentId,
                    name: fileName,
                    type: "file",
                    language: fileName.endsWith(".move") ? "move" : "markdown",
                    content: content,
                });
            }

            onImport(importedItems[0].name, importedItems);
        } catch (err) {
            alert("Failed to import files.");
        } finally {
            setIsImporting(false);
        }
    };

    const handleFolderDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.items) {
            const items = await processDropItems(e.dataTransfer.items);

            const totalSize = items.reduce(
                (acc, item) => acc + (item.content?.length || 0),
                0
            );

            if (totalSize > MAX_PROJECT_SIZE) {
                toast.error("Project size exceeds 1MB limit.");
                return;
            }

            if (items.length > 0) {
                let projectName = "My Project";
                const rootFolders = items.filter(
                    (i) => i.parentId === null && i.type === "folder"
                );
                if (rootFolders.length === 1) {
                    projectName = rootFolders[0].name;
                }
                onImport(projectName, items);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div
                onDrop={handleFolderDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                }}
            >
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Select Folder
                </label>

                {isDragging ? (
                    <div className="backdrop-blur-sm mt-8 p-8 gap-2 bg-cryonx-bg/90 border-2 border-dashed border-cryonx-accent/50 rounded-lg animate-fadeIn pointer-events-none relative flex flex-col items-center justify-center">
                        <UploadCloud
                            size={32}
                            className="text-cryonx-accent mb-2 animate-bounce"
                        />
                        <span className="text-cryonx-text font-bold text-sm">
                            Create Project from Folder
                        </span>
                        <span className="text-gray-500 text-xs mt-1">
                            Drop a folder here to start
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="mt-8 border-2 border-dashed border-white/10 rounded-lg p-8 flex flex-col items-center justify-center gap-3 bg-white/5 hover:bg-white/[0.07] transition-colors relative">
                            {isImporting ? (
                                <div className="flex flex-col items-center">
                                    <Loader2
                                        className="animate-spin text-cryonx-accent mb-2"
                                        size={32}
                                    />
                                    <span className="text-sm text-gray-400">
                                        Processing files...
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud
                                        className="text-gray-500"
                                        size={32}
                                    />
                                    <span className="text-sm text-gray-400">
                                        Click to select folder from disk
                                    </span>
                                    <input
                                        type="file"
                                        /* @ts-expect-error webkitdirectory is non-standard but supported */
                                        webkitdirectory=""
                                        directory=""
                                        multiple
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFolderSelect}
                                    />
                                </>
                            )}
                        </div>
                    </>
                )}
                <p className="text-[10px] text-gray-500 mt-2">
                    Note: This will upload the selected folder structure and
                    create a new project from it.
                </p>
            </div>
        </div>
    );
};

export default ImportProjectZone;
