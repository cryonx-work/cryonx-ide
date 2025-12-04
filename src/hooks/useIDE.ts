"use client";
import { createContext, useContext } from "react";
import {
    CollaborationState,
    FileSystemState,
    UIState,
    GitState,
    SettingsState,
    ProjectState,
    WalletState
} from "@/store";

export interface IDEContextType {
    settings:SettingsState;
    projects: ProjectState;
    fileSystem: FileSystemState;
    git: GitState;
    collab: CollaborationState;
    ui: UIState;
    wallet: WalletState;
}

export const IDEContext = createContext<IDEContextType | null>(null);

export function useIDE(): IDEContextType{
    const context = useContext(IDEContext);
    if (!context) {
        throw new Error("useIDE must be used within an IDEProvider");
    }
    return context;
};
