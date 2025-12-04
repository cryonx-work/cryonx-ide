import React from "react";
import { LogEntry } from "@/types";
import { LogItem } from "./LogItem";

interface TerminalLogListProps {
    logs: LogEntry[];
    bottomRef: React.RefObject<HTMLDivElement | null>;
}

export const TerminalLogList: React.FC<TerminalLogListProps> = ({
    logs,
    bottomRef,
}) => {
    return (
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1">
            {logs.length === 0 && (
                <div className="text-gray-600 italic text-xs mb-4">
                    Welcome to CryonX Terminal. Type &apos;help&apos; for
                    commands.
                </div>
            )}
            {logs.map((log) => (
                <LogItem key={log.id} log={log} />
            ))}
            <div ref={bottomRef} />
        </div>
    );
};
