import React from "react";
import { FileText, Braces } from "lucide-react";
import Image from "next/image";

// Re-implementing exactly as it was in the original file to be safe
export const FileIcon: React.FC<{ name: string }> = ({ name }) => {
    const extension = name.split(".").length > 1 ? name.split(".")[1] : null;

    return (
        <>
            {extension ? (
                <>
                    {extension.localeCompare("json") === 0 ? (
                        <Braces className="w-4 h-4 text-yellow-500" />
                    ) : (
                        <div className="relative w-5 h-5 flex items-center justify-center">
                            <Image
                                src={`/${extension}.png`}
                                alt={`${extension} icon`}
                                width={20}
                                height={20}
                                className="object-contain"
                                onError={(e) => {
                                    // Hide image on error
                                    e.currentTarget.style.opacity = "0";
                                    // We could show a fallback here but it's hard to inject into the DOM from onError
                                }}
                            />
                        </div>
                    )}
                </>
            ) : (
                <FileText className="w-4 h-4 text-gray-400" />
            )}
        </>
    );
};
