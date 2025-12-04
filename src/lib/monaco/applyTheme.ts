
export function applyTheme(monaco: typeof import('monaco-editor/esm/vs/editor/editor.main.js'), themeName: string) {
    try{
        monaco.editor.setTheme(themeName);
    }catch(e){

    }
}