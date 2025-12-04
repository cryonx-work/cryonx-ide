import { loadWASM } from 'onigasm'
import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'
import { editor } from 'monaco-editor';

let onigurumaLoaded = false;

export async function registerTextmate(monaco: typeof import('monaco-editor/esm/vs/editor/editor.main.js'), editor ?: editor.IStandaloneCodeEditor) {

    if (!onigurumaLoaded) {
        // 1. Load Onigasm wasm file
        await loadWASM("/lib/onigasm.wasm");
        onigurumaLoaded = true;
    }
    
    // 2. Create registry → load grammar from file
    const registry = new Registry({
        getGrammarDefinition: async (scopeName) => ({
            format: "json",
            content: await (await fetch("/grammars/move.tmLanguage.json")).text(),
        }),
    });

    // 3. Map languageId → TextMate scopeName
    const grammars = new Map();
    grammars.set("move", "source.move");

    // 4. Wire grammar to Monaco
    await wireTmGrammars(monaco, registry, grammars, editor);
}
