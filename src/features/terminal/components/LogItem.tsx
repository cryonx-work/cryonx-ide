import React from "react";
import { LogEntry, LogType } from "@/types";
import { XCircle, CheckCircle, Info, AlertTriangle, Bug } from "lucide-react";

interface LogItemProps {
    log: LogEntry;
}

const getIcon = (type: LogType) => {
    switch (type) {
        case LogType.ERROR:
            return <XCircle className="w-4 h-4 text-red-500" />;
        case LogType.SUCCESS:
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        case LogType.WARNING:
            return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        case LogType.DEBUG:
            return <Bug className="w-4 h-4 text-cryonx-glow" />;
        default:
            return <Info className="w-4 h-4 text-blue-400" />;
    }
};

const getColor = (type: LogType) => {
    switch (type) {
        case LogType.ERROR:
            return "text-red-400";
        case LogType.SUCCESS:
            return "text-green-400";
        case LogType.WARNING:
            return "text-yellow-400";
        case LogType.SYSTEM:
            return "text-cryonx-glow";
        case LogType.DEBUG:
            return "text-purple-300";
        default:
            return "text-gray-300";
    }
};

export const LogItem: React.FC<LogItemProps> = ({ log }) => {
    return (
        <div className="flex gap-2 animate-fadeIn items-start">
            {log.type !== LogType.SYSTEM && (
                <span className="text-gray-600 min-w-[70px] text-xs mt-0.5 select-none">
                    {log.timestamp.toLocaleTimeString([], {
                        hour12: false,
                    })}
                </span>
            )}
            {log.type !== LogType.SYSTEM && (
                <span className="mt-0.5">{getIcon(log.type)}</span>
            )}
            <span
                className={`break-all whitespace-pre-wrap ${getColor(
                    log.type
                )}`}
            >
                {log.message}
            </span>
        </div>
    );
};
