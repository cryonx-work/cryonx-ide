import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js'

interface ThemeTemplate {
    name: string,
    base: string,
    inherit: boolean,
    rules: Array<{
        token: string,
        foreground?: string,
        background?: string,
        fontStyle?: string,
    }>,
    colors: { [scope: string]: string }
}

const getBuiltInThemes = (type: string): editor.BuiltinTheme => {
    return ['vs', 'vs-dark', 'hc-black'].includes(type) ? type as editor.BuiltinTheme : 'vs-dark'
}

const defineTheme = (monaco: typeof import('monaco-editor/esm/vs/editor/editor.main.js'), theme: ThemeTemplate) => {
    if (theme && monaco.editor.defineTheme) {
        try {
            monaco.editor.defineTheme(theme.name, {
                base: getBuiltInThemes(theme.base),
                inherit: theme.inherit,
                colors: theme.colors,
                rules: theme.rules,
            })
        } catch (e) {
        }
    }
}

export default defineTheme
