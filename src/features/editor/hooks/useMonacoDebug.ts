import { useEffect, RefObject } from 'react';
import { DebugState } from '@/types';

export const useMonacoDebug = (
    editorRef: RefObject<any>,
    monacoRef: RefObject<any>,
    debugState: DebugState,
    decorationsRef: RefObject<string[]>
) => {
    useEffect(() => {
        if (!editorRef.current || !monacoRef.current) return;
        const editor = editorRef.current;
        const monaco = monacoRef.current;
        const newDecorations: any[] = [];

        debugState.breakpoints.forEach((line) => {
            newDecorations.push({
                range: new monaco.Range(line, 1, line, 1),
                options: {
                    isWholeLine: false,
                    glyphMarginClassName: "cryonx-breakpoint",
                },
            });
        });

        if (debugState.isPaused && debugState.currentLine) {
            newDecorations.push({
                range: new monaco.Range(
                    debugState.currentLine,
                    1,
                    debugState.currentLine,
                    1
                ),
                options: {
                    isWholeLine: true,
                    className: "cryonx-execution-line",
                },
            });
        }

        decorationsRef.current = editor.deltaDecorations(
            decorationsRef.current,
            newDecorations
        );
        if (debugState.isPaused && debugState.currentLine) {
            editor.revealLineInCenter(debugState.currentLine);
        }
    }, [debugState.breakpoints, debugState.currentLine, debugState.isPaused]);
};
