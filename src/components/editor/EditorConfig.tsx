import { useEffect } from 'react';
import { useMonaco } from '@monaco-editor/react';

export function EditorConfig() {
    const monaco = useMonaco();
    useEffect(() => {
        if (monaco) {
            monaco.editor.defineTheme('cryonx-move', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'keyword', foreground: 'c792ea', fontStyle: 'bold' }, // từ khóa Move
                    { token: 'type.identifier', foreground: '82aaff' }, // kiểu dữ liệu
                    { token: 'string', foreground: 'ecc48d' }, // chuỗi
                    { token: 'number', foreground: 'f78c6c' }, // số
                    { token: 'comment', foreground: '637777', fontStyle: 'italic' }, // comment
                    { token: 'variable', foreground: 'f2ff00' }, // biến
                    { token: 'function', foreground: '80cbc4' }, // hàm
                ],
                colors: {
                    'editor.background': '#101828' /* #282c34 */,
                    'editor.foreground': '#f3f4f6',
                    'editor.lineHighlightBackground': '#364153',
                    'editorCursor.foreground': '#901ed3ff',
                    'editor.selectionBackground': '#264f78',
                    'editor.inactiveSelectionBackground': '#3a3d41',
                    'editorLineNumber.foreground': '#6a7282',
                    'editorLineNumber.activeForeground': '#8800ffff',
                    'editorGutter.background': '#1e2939',
                },

            });
            monaco.languages.register({ id: 'move' });

        }
    }, [monaco]);
    return null;
}
