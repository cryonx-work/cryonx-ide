import React from "react";
import { useIDE } from "@/hooks";

const SettingsMenu: React.FC = () => {
    const { ui, settings } = useIDE();
    const { config, updateSettings } = settings;

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={ui.closeSettings}
            />
            <div
                className="absolute bottom-12 left-12 z-50 w-64 bg-[#151923] border border-white/10 rounded-lg shadow-xl backdrop-blur-md animate-fadeIn overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-4 py-2 border-b border-white/5 bg-[#1a1e29] text-xs font-bold text-gray-400">
                    SETTINGS
                </div>

                <div className="p-2 space-y-2">
                    {/* Auto Save */}
                    <div className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded">
                        <span className="text-xs text-gray-300">Auto Save</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={config.autoSave}
                                onChange={(e) =>
                                    updateSettings({
                                        autoSave: e.target.checked,
                                    })
                                }
                            />
                            <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cryonx-accent"></div>
                        </label>
                    </div>

                    {/* Auto Save Delay */}
                    <div
                        className={`px-2 py-1 ${
                            !config.autoSave
                                ? "opacity-50 pointer-events-none"
                                : ""
                        }`}
                    >
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>Save Delay</span>
                            <span>{config.autoSaveDelay}ms</span>
                        </div>
                        <input
                            type="range"
                            min="500"
                            max="10000"
                            step="500"
                            value={config.autoSaveDelay}
                            onChange={(e) =>
                                updateSettings({
                                    autoSaveDelay: parseInt(e.target.value),
                                })
                            }
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cryonx-accent"
                        />
                    </div>

                    <div className="h-px bg-white/5 mx-2" />

                    {/* Font Size */}
                    <div className="px-2 py-1">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>Font Size</span>
                            <span>{config.fontSize}px</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="24"
                            step="1"
                            value={config.fontSize}
                            onChange={(e) =>
                                updateSettings({
                                    fontSize: parseInt(e.target.value),
                                })
                            }
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cryonx-accent"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default SettingsMenu;
