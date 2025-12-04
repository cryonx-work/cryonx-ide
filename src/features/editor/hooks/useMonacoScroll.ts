import { useEffect, RefObject } from 'react';

export const useMonacoScroll = (
    editorRef: RefObject<any>,
    scrollToLine: number | null | undefined,
    ui: any
) => {
    useEffect(() => {
        if (!editorRef.current || !scrollToLine) return;

        editorRef.current.revealLineInCenter(scrollToLine);
        editorRef.current.setPosition({
            lineNumber: scrollToLine,
            column: 1,
        });

        ui.setScrollToLine(null);
    }, [scrollToLine, ui]);
};
