"use client"
import { useState } from 'react';
import { DebugState, LogType } from '@/types';
import { useIDE } from './useIDE';

export const useDebugger = () => {
  const { fileSystem, ui } = useIDE();
  const [debugState, setDebugState] = useState<DebugState>({
    isRunning: false,
    isPaused: false,
    currentLine: null,
    breakpoints: [],
    variables: [],
    callStack: []
  });

  const toggleBreakpoint = (line: number) => {
    setDebugState(prev => {
      const exists = prev.breakpoints.includes(line);
      const newBreakpoints = exists
        ? prev.breakpoints.filter(l => l !== line)
        : [...prev.breakpoints, line];

      return { ...prev, breakpoints: newBreakpoints };
    });
    const exists = debugState.breakpoints.includes(line);
    ui.addLog(
      LogType.INFO,
      exists ? `Breakpoint removed at line ${line}` : `Breakpoint set at line ${line}`
    );
  };

  const startDebugging = () => {
    const activeFile = fileSystem.getActiveFile();
    if (!activeFile) return;
    ui.setActiveView('debug');

    ui.addLog(LogType.DEBUG, 'Starting debug session...');
    setDebugState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: true,
      currentLine: 1,
      callStack: [{ id: '1', name: 'main', file: activeFile.name, line: 1 }],
      variables: []
    }));
  };

  const stopDebugging = () => {
    setDebugState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      currentLine: null,
      callStack: [],
      variables: []
    }));
    ui.addLog(LogType.DEBUG, 'Debug session terminated.');
  };

  const step = () => {
    const activeFile = fileSystem.getActiveFile();
    if (!debugState.currentLine || !activeFile || !activeFile.content) return;

    const lines = activeFile.content.split('\n');
    let nextLine = debugState.currentLine + 1;

    while (nextLine < lines.length && lines[nextLine - 1].trim() === '') {
      nextLine++;
    }

    if (nextLine > lines.length) {
      ui.addLog(LogType.DEBUG, 'End of execution.');
      stopDebugging();
      return;
    }

    const lineContent = lines[nextLine - 1];
    let newVars = [...debugState.variables];

    if (lineContent.includes('let value')) {
      newVars = newVars.filter(v => v.name !== 'value');
      newVars.push({ name: 'value', value: '100', type: 'u64' });
    }
    if (lineContent.includes('account')) {
      newVars = newVars.filter(v => v.name !== 'account');
      newVars.push({ name: 'account', value: 'signer(@0x1)', type: '&signer' });
    }
    setDebugState(prev => ({
      ...prev,
      currentLine: nextLine,
      isPaused: true,
      variables: newVars,
      callStack: [{ ...prev.callStack[0], line: nextLine }]
    }));
  };

  return {
    debugState,
    setDebugState,
    startDebugging,
    stopDebugging,
    step,
    toggleBreakpoint
  };
};