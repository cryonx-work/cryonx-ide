import React from "react";
import { useIDE } from "@/hooks";
import { X } from "lucide-react";
import { FileIcon } from "@/components/FileIcon";

const TabItem: React.FC<{
    fileId: string;
    dragOverInfo: { id: string; position: "left" | "right" } | null;
    setDragOverInfo: (
        info: { id: string; position: "left" | "right" } | null
    ) => void;
}> = ({ fileId, dragOverInfo, setDragOverInfo }) => {
    const { fileSystem } = useIDE();
    const fileName = fileSystem.items.find((i) => i.id === fileId)?.name;
    const isActive = fileSystem.activeFileId === fileId;
    const openFiles = fileSystem.openFiles;
    const setOpenFiles = fileSystem.setOpenFiles;
    const openFile = fileSystem.openFile;
    const closeFile = fileSystem.closeFile;

    if (!fileName) return null;

    return (
        <div
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", fileId);
            }}
            onDragOver={(e) => {
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                const mid = rect.x + rect.width / 2;
                const position = e.clientX < mid ? "left" : "right";
                setDragOverInfo({
                    id: fileId,
                    position,
                });
            }}
            onDragLeave={() => setDragOverInfo(null)}
            onDrop={(e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData("text/plain");
                if (draggedId && draggedId !== fileId) {
                    const oldIndex = openFiles.indexOf(draggedId);
                    let newIndex = openFiles.indexOf(fileId);

                    // Adjust index based on drop position
                    if (dragOverInfo?.position === "right") {
                        newIndex++;
                    }
                    // If moving right, the target index shifts by 1 because we remove the item first
                    if (oldIndex < newIndex) {
                        newIndex--;
                    }

                    if (oldIndex !== -1 && newIndex !== -1) {
                        const newFiles = [...openFiles];
                        newFiles.splice(oldIndex, 1);
                        newFiles.splice(newIndex, 0, draggedId);
                        setOpenFiles(newFiles);
                    }
                }
                setDragOverInfo(null);
            }}
            onClick={() => openFile(fileId)}
            className={`group relative flex items-center gap-2 py-3 px-3 min-w-[120px] max-w-[200px] border-r border-white/5 cursor-pointer select-none text-xs transition-all duration-200 ease-in-out ${
                isActive
                    ? "bg-[#151923] text-gray-100 border-t-2 border-t-cryonx-accent "
                    : "bg-[#0B0E14] text-gray-500 hover:bg-[#151923] border-t-2 border-t-transparent"
            } ${dragOverInfo?.id === fileId ? "bg-[#1a1e29]" : ""}`}
        >
            {dragOverInfo?.id === fileId && (
                <div
                    className={`absolute top-0 bottom-0 w-0.5 bg-cryonx-accent z-50 shadow-[0_0_10px_rgba(56,189,248,0.5)] ${
                        dragOverInfo.position === "left" ? "left-0" : "right-0"
                    } animate-fadeIn`}
                />
            )}
            <FileIcon name={fileName} />
            <span className="truncate flex-1">{fileName}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    closeFile(fileId);
                }}
                className={`p-0.5 rounded-md hover:bg-white/10 ${
                    isActive
                        ? "text-gray-400 hover:text-white"
                        : "text-transparent group-hover:text-gray-400 group-hover:hover:text-white"
                }`}
            >
                <X size={14} />
            </button>
        </div>
    );
};

export default TabItem;
