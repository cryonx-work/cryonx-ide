"use client";

import React, { useEffect, useRef, useState } from "react";
import { LogEntry, LogType } from "@/types";
import { useIDE } from "@/hooks";
import { TerminalHeader } from "./components/TerminalHeader";
import { TerminalLogList } from "./components/TerminalLogList";
import { TerminalInput } from "./components/TerminalInput";

interface TerminalProps {
    logs: LogEntry[];
    onClear: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ logs, onClear }) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const { git, ui } = useIDE();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const handleCommand = async (cmd: string) => {
        const parts = cmd.trim().split(" ");
        const command = parts[0];
        const args = parts.slice(1);

        ui.addLog(LogType.SYSTEM, `> ${cmd}`);

        switch (command) {
            case "clear":
                onClear();
                break;
            case "help":
                ui.addLog(LogType.INFO, "Available commands: git, clear, help");
                break;
            case "git":
                await handleGitCommand(args);
                break;
            default:
                ui.addLog(LogType.ERROR, `Command not found: ${command}`);
        }
    };

    const handleGitCommand = async (args: string[]) => {
        if (args.length === 0) {
            ui.addLog(LogType.INFO, "usage: git <command> [<args>]");
            return;
        }

        const subCmd = args[0];
        switch (subCmd) {
            case "init":
                await git.initRepo();
                break;
            case "status":
                await git.refreshStatus();
                const { gitChanges, gitStaged } = git;
                if (gitChanges.length === 0 && gitStaged.length === 0) {
                    ui.addLog(
                        LogType.INFO,
                        "nothing to commit, working tree clean"
                    );
                } else {
                    if (gitStaged.length > 0) {
                        ui.addLog(LogType.INFO, "Changes to be committed:");
                        gitStaged.forEach((c) =>
                            ui.addLog(LogType.INFO, `  ${c.status}: ${c.path}`)
                        );
                    }
                    if (gitChanges.length > 0) {
                        ui.addLog(
                            LogType.INFO,
                            "Changes not staged for commit:"
                        );
                        gitChanges.forEach((c) =>
                            ui.addLog(
                                LogType.WARNING,
                                `  ${c.status}: ${c.path}`
                            )
                        );
                    }
                }
                break;
            case "add":
                if (args[1] === ".") {
                    const changes = git.gitChanges;
                    for (const change of changes) {
                        await git.stageFile(change);
                    }
                    ui.addLog(LogType.SUCCESS, "Staged all changes");
                } else if (args[1]) {
                    const path = args[1];
                    const change = git.gitChanges.find(
                        (c) => c.path === path || c.path.endsWith(path)
                    );
                    if (change) {
                        await git.stageFile(change);
                        ui.addLog(LogType.SUCCESS, `Staged ${path}`);
                    } else {
                        ui.addLog(
                            LogType.ERROR,
                            `pathspec '${path}' did not match any files`
                        );
                    }
                } else {
                    ui.addLog(
                        LogType.ERROR,
                        "Nothing specified, nothing added."
                    );
                }
                break;
            case "commit":
                const msgIndex = args.indexOf("-m");
                if (msgIndex !== -1 && args[msgIndex + 1]) {
                    const message = args
                        .slice(msgIndex + 1)
                        .join(" ")
                        .replace(/^"|"$/g, "");
                    await git.commit(message);
                } else {
                    ui.addLog(
                        LogType.ERROR,
                        'Commit message required. Use -m "message"'
                    );
                }
                break;
            case "log":
                await git.refreshStatus();
                const history = git.gitHistory;
                history.forEach((commit) => {
                    ui.addLog(
                        LogType.INFO,
                        `commit ${commit.hash}\nAuthor: ${
                            commit.author
                        }\nDate:   ${new Date(
                            commit.timestamp
                        ).toLocaleString()}\n\n    ${commit.message}`
                    );
                });
                break;
            default:
                ui.addLog(
                    LogType.ERROR,
                    `git: '${subCmd}' is not a git command.`
                );
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (!input.trim()) return;
            setHistory((prev) => [...prev, input]);
            setHistoryIndex(-1);
            handleCommand(input);
            setInput("");
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex =
                    historyIndex === -1
                        ? history.length - 1
                        : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex !== -1) {
                const newIndex = Math.min(history.length - 1, historyIndex + 1);
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            } else {
                setInput("");
            }
        }
    };

    return (
        <div
            className="flex flex-col h-full bg-cryonx-glass backdrop-blur-md border-t border-cryonx-glassBorder"
            onClick={() => inputRef.current?.focus()}
        >
            <TerminalHeader onClear={onClear} />
            <TerminalLogList logs={logs} bottomRef={bottomRef} />
            <TerminalInput
                inputRef={inputRef}
                input={input}
                setInput={setInput}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};
export default Terminal;
