import React from "react";
import { Loader2 } from "lucide-react";
import { Loading } from "@/components";

export const ExplorerLoading: React.FC = () => (
    <div className="w-full h-full flex flex-col bg-[#0d1017]">
        <div className="h-9 px-4 flex items-center justify-between text-xs font-bold text-gray-500 tracking-wider shrink-0 bg-[#13161f] select-none">
            <span>EXPLORER</span>
        </div>
        <Loading size={24}/>
    </div>
);
