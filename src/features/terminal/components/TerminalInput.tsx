import React from "react";
import { ChevronRight } from "lucide-react";

interface TerminalInputProps {
    inputRef: React.RefObject<HTMLInputElement | null>;
    input: string;
    setInput: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
    inputRef,
    input,
    setInput,
    onKeyDown,
}) => {
    return (
        <div className="p-2 bg-black/20 border-t border-white/5 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-cryonx-accent" />
            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-white placeholder-gray-600"
                placeholder="Type a command..."
                spellCheck={false}
                autoComplete="off"
            />
        </div>
    );
};
