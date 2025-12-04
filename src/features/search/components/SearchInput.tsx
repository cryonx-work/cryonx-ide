import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
    query: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    query,
    onChange,
}) => {
    return (
        <div className="p-3 border-b border-white/5 bg-[#151923]">
            <div className="relative">
                <input
                    autoFocus
                    value={query}
                    onChange={onChange}
                    placeholder="Search files..."
                    className="w-full bg-black/30 border border-white/10 rounded-md py-1.5 pl-8 pr-2 text-xs text-white focus:outline-none focus:border-cryonx-accent"
                />
                <Search
                    className="absolute left-2.5 top-1.5 text-gray-500"
                    size={14}
                />
            </div>
        </div>
    );
};
