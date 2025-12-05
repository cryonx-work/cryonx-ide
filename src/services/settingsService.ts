import { IDESettings } from '@/types';

const SETTINGS_KEY = "ide_settings";

const DEFAULT_SETTINGS: IDESettings = {
    autoSave: true,
    autoSaveDelay: 3000,
    fontSize: 14,
    fontFamily: "'JetBrains Mono', monospace",
};

class SettingsService {
    loadSettings(): IDESettings {
        if (typeof window === 'undefined') return DEFAULT_SETTINGS;

        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (saved) {
                const savedSettings = JSON.parse(saved);
                return { ...DEFAULT_SETTINGS, ...savedSettings };
            }
        } catch (error) {
        }
        return DEFAULT_SETTINGS;
    }

    saveSettings(settings: IDESettings): void {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
        }
    }
}

export const settingsService = new SettingsService();
export { DEFAULT_SETTINGS };
