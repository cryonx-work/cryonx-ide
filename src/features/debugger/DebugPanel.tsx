import React from "react";
import { DebugState } from "@/types";
import {
    Play,
    Pause,
    Square,
    SkipForward,
    ArrowRight,
    CornerDownRight,
    Box,
    Layers,
    Bug,
} from "lucide-react"; //, Hash }

interface DebugPanelProps {
    debugState: DebugState;
    onContinue: () => void;
    onPause: () => void;
    onStop: () => void;
    onStepOver: () => void;
    onStepInto: () => void;
    onStepOut: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
    debugState,
    onContinue,
    onPause,
    onStop,
    onStepOver,
    onStepInto,
    onStepOut,
}) => {
    return (
        <div className="w-full h-full flex flex-col bg-[#0d1017]">
            <div className="h-9 px-4 flex items-center justify-between text-xs font-bold text-gray-400 tracking-wider bg-[#13161f] border-b border-white/5">
                <div className="flex items-center gap-2">
                    <span>RUN AND DEBUG</span>
                </div>
            </div>

            <p>This feature will coming soon.</p>
            {/* <div className="p-2 border-b border-white/5 bg-[#0f1218]">
        <div className="flex justify-between gap-1">
            <button onClick={debugState.isPaused ? onContinue : onPause} className="flex-1 py-1 rounded bg-green-900/20 hover:bg-green-900/40 text-green-400 border border-green-900/30 flex justify-center items-center transition-colors">
              {debugState.isPaused ? <Play size={14} /> : <Pause size={14} />}
            </button>
            <button onClick={onStepOver} className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 flex justify-center items-center transition-colors"><CornerDownRight size={14} /></button>
            <button onClick={onStepInto} className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 flex justify-center items-center transition-colors"><ArrowRight size={14} /></button>
            <button onClick={onStepOut} className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 flex justify-center items-center transition-colors"><SkipForward size={14} /></button>
            <button onClick={onStop} className="flex-1 py-1 rounded bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 flex justify-center items-center transition-colors"><Square size={14} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="group">
            <div className="bg-white/2 px-3 py-1 text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider cursor-pointer hover:text-white">
                <Box size={12} /> <span>Variables</span>
            </div>
            <div className="p-1">
                {debugState.variables.length === 0 ? <div className="text-gray-600 text-xs italic px-4 py-2">No active variables</div> : (
                    <div className="space-y-0.5">
                        {debugState.variables.map((v, i) => (
                            <div key={i} className="flex items-center text-xs hover:bg-white/5 px-2 py-1 rounded font-mono group/item">
                                <span className="text-cryonx-accent mr-2">{v.name}:</span>
                                <span className="text-purple-300 mr-2 opacity-50">{v.type}</span>
                                <span className="text-green-300 ml-auto">{v.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="mt-2 group">
            <div className="bg-white/2 px-3 py-1 text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider cursor-pointer hover:text-white">
                <Layers size={12} /> <span>Call Stack</span>
            </div>
            <div className="p-1">
                {debugState.callStack.length === 0 ? <div className="text-gray-600 text-xs italic px-4 py-2">Not running</div> : (
                    <div className="space-y-0.5">
                        {debugState.callStack.map((frame, i) => (
                            <div key={frame.id} className={`flex flex-col text-xs px-2 py-1.5 rounded font-mono cursor-pointer border-l-2 ${i === 0 ? 'bg-cryonx-accent/10 border-cryonx-accent' : 'border-transparent text-gray-500 hover:bg-white/5'}`}>
                                <div className="flex justify-between"><span className={i===0 ? "text-yellow-100" : ""}>{frame.name}</span><span className="opacity-50 text-[10px]">{frame.line}</span></div>
                                <span className="opacity-40 text-[10px] truncate">{frame.file}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div> */}
        </div>
    );
};

export default DebugPanel;
