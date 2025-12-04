"use client";

import { loader } from "@monaco-editor/react";

import defineTheme from "@/lib/monaco/defineTheme";
import { moveLanguageConfig } from "@/language";
import { oneDarkProTheme } from "@/themes";
import { applyTheme } from "@/lib/monaco/applyTheme";
import { editor } from "monaco-editor";

export async function initMonaco() {
    const monaco = await loader.init();

    monaco.languages.register({ id: "move" });

    monaco.languages.setLanguageConfiguration("move", moveLanguageConfig);

    defineTheme(monaco, oneDarkProTheme);

    applyTheme(monaco, oneDarkProTheme.name);
    return monaco;
}


export const MonacoOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: true },
    fontSize: 14,
    padding: { top: 10, bottom: 10 },
    fontFamily: "'Monaspace Neon Var', 'JetBrains Mono', monospace",
    fontLigatures: true,
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: "on",
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    autoClosingComments: "always",
    autoDetectHighContrast: true,
    cursorBlinking: "expand",
    cursorSmoothCaretAnimation: "on",
    cursorStyle: "line",
    inlineSuggest: { enabled: true },
    showDeprecated: true,
    showUnused: true,
    autoClosingDelete: "always",
    folding: true,
    foldingStrategy: "indentation",
    matchBrackets: "always",
    bracketPairColorization: {
        enabled: true,
    },
    disableLayerHinting: true,

    wordWrap: "on",
    scrollBeyondLastLine: false,
    automaticLayout: true,
    lineNumbersMinChars: 3,
    scrollbar: {
        vertical: "visible",
        horizontal: "visible",
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
        verticalSliderSize: 6,
        horizontalSliderSize: 6,
        useShadows: false,
        verticalHasArrows: false,
        horizontalHasArrows: false,
    },
}