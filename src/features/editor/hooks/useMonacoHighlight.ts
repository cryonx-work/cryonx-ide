import { useEffect, RefObject } from 'react';
import { FileSystemItem } from '@/types';

export const useMonacoHighlight = (
    editorRef: RefObject<any>,
    monacoRef: RefObject<any>,
    file: FileSystemItem | null,
    highlight: string | undefined,
    highlightDecorationsRef: RefObject<string[]>,
    ui: any
) => {
    useEffect(() => {
        if (!editorRef.current || !monacoRef.current || !file) return;

        const editor = editorRef.current;
        const monaco = monacoRef.current;

        highlightDecorationsRef.current = editor.deltaDecorations(
            highlightDecorationsRef.current,
            []
        );

        if (!highlight || highlight.trim() === "") return;

        const text = editor.getModel()?.getValue() || "";
        const regex = new RegExp(
            highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "gi"
        );

        const decorations = [];
        let match;

        while ((match = regex.exec(text))) {
            const start = editor.getModel().getPositionAt(match.index);
            const end = editor
                .getModel()
                .getPositionAt(match.index + highlight.length);

            decorations.push({
                range: new monaco.Range(
                    start.lineNumber,
                    start.column,
                    end.lineNumber,
                    end.column
                ),
                options: {
                    inlineClassName: "cryonx-highlight",
                },
            });
        }

        highlightDecorationsRef.current = editor.deltaDecorations(
            highlightDecorationsRef.current,
            decorations
        );
    }, [highlight, ui.scrollToLine, file]);

    useEffect(() => {
        ui.clearHighlight();
    }, [ui.activeView]);
};
