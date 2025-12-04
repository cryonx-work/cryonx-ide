import React from "react";

export const SearchHeader: React.FC = () => {
    return (
        <div className="h-9 px-4 flex items-center justify-between text-xs font-bold text-gray-400 tracking-wider bg-[#13161f] border-b border-white/5">
            <div className="flex items-center gap-2">
                <span>SEARCH</span>
            </div>
        </div>
    );
};
