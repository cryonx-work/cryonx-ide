import { create } from 'zustand';
import { IDESettings, LogType } from '@/types';
import { useUIStore } from './useUIStore';
import { settingsService, DEFAULT_SETTINGS } from '@/services';

export interface SettingsState {
    config: IDESettings;
    updateSettings: (newSettings: Partial<IDESettings>) => void;
    loadSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    config: DEFAULT_SETTINGS,

    updateSettings: (newSettings) => {
        set((state) => {
            const updated = { ...state.config, ...newSettings };
            settingsService.saveSettings(updated);
            return { config: updated };
        });
        useUIStore.getState().addLog(LogType.INFO, "Settings updated.");
    },

    loadSettings: () => {
        const settings = settingsService.loadSettings();
        set({ config: settings });
    }
}));
