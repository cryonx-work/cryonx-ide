import React, { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { FileSystemItem, DebugState } from "@/types";
import { useIDE } from "@/hooks";
import { initMonaco, MonacoOptions } from "@/config/monaco";
import { registerTextmate } from "@/lib/monaco/registerTextmate";
import { collabService } from "@/services";

import { useMonacoDebug } from "./hooks/useMonacoDebug";
import { useMonacoCollab } from "./hooks/useMonacoCollab";
import { useMonacoHighlight } from "./hooks/useMonacoHighlight";
import { useMonacoScroll } from "./hooks/useMonacoScroll";
import { useMonacoCursor } from "./hooks/useMonacoCursor";
import { Loading } from "@/components/Loading";

interface CodeEditorProps {
    file: FileSystemItem | null;
    debugState: DebugState;
    highlight?: string;
    scrollToLine?: number | null;
    onChange: (value: string | undefined) => void;
    onToggleBreakpoint: (line: number) => void;
}

const MonacoWrapper: React.FC<CodeEditorProps> = ({
    file,
    debugState,
    highlight,
    scrollToLine,
    onChange,
    onToggleBreakpoint,
}) => {
    const { fileSystem, collab: collaboration, ui } = useIDE();
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const [editorInstance, setEditorInstance] = React.useState<any>(null);
    const [monacoInstance, setMonacoInstance] = React.useState<any>(null);
    const decorationsRef = useRef<string[]>([]);
    const highlightDecorationsRef = useRef<string[]>([]);
    const currentFileIdRef = useRef<string | null>(null);

    useEffect(() => {
        currentFileIdRef.current = file?.id || null;

        if (collaboration.isCollabActive && file?.id) {
            collabService.updateUser({ fileId: file.id });
        }
    }, [file?.id, collaboration.isCollabActive]);

    // Custom Hooks
    const { handleCursorChange } = useMonacoCursor(editorRef, file, fileSystem);
    useMonacoScroll(editorRef, scrollToLine, ui);
    useMonacoDebug(editorRef, monacoRef, debugState, decorationsRef);
    useMonacoCollab(editorInstance, monacoInstance, collaboration, file);
    useMonacoHighlight(
        editorRef,
        monacoRef,
        file,
        highlight,
        highlightDecorationsRef,
        ui
    );

    const handleEditorDidMount: OnMount = async (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        setEditorInstance(editor);
        setMonacoInstance(monaco);

        await initMonaco();
        await registerTextmate(monaco, editor);

        // Track cursor position changes
        editor.onDidChangeCursorPosition(handleCursorChange);

        // Sync explorer selection on focus
        editor.onDidFocusEditorText(() => {
            if (currentFileIdRef.current) {
                fileSystem.setSelectedExplorerId(currentFileIdRef.current);
            }
        });
    };

    // Update read-only state
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions({
                readOnly: file?.isReadOnly || false,
            });
        }
    }, [file?.isReadOnly]);

    if (!file)
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                Select a file to start editing
            </div>
        );

    return (
        <Editor
            height="100%"
            path={file.id}
            language={file.language === "move" ? "move" : file.language}
            value={file.content}
            onChange={onChange}
            theme="cryonx-glass"
            onMount={handleEditorDidMount}
            loading={<Loading />}
            options={{
                ...MonacoOptions,
                readOnly:
                    file?.isReadOnly ||
                    (collaboration.isCollabActive &&
                        (file?.isReadOnly || collaboration.isProjectLocked) &&
                        collaboration.role !== "host") ||
                    false,
            }}
        />
    );
};

export default MonacoWrapper;
