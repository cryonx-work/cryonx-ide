import { useState, useEffect, useRef } from 'react';
import { EditorHeader } from './editor/EditorHeader';
import Editor from '@monaco-editor/react'
import { EditorConfig } from './editor/EditorConfig';
import * as monaco from "monaco-editor";

interface CodeEditorProps {
  fileName: string;
  content: string;
  onChange: (content: string) => void;
  searchTerm?: string;

}


export function CodeEditor({ fileName, content, onChange, searchTerm }: CodeEditorProps) {
  const [code, setCode] = useState(content);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  const [currentLine, setCurrentLine] = useState(1);

  useEffect(() => {
    setCode(content);
  }, [content]);

  useEffect(() => {
    const lines = code.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [code]);

  const handleCodeChange = (
    value: string | undefined,
    ev: monaco.editor.IModelContentChangedEvent
  ) => {
    if (value !== undefined) {
      setCode(value);
      onChange(value);
    }
  };

  return (
    <div className="flex-1 bg-gray-900 relative overflow-hidden">
      {/* Editor Header */}
      <EditorHeader
        fileName={fileName}
        lineCount={code.split("\n").length}
      />

      {/* Editor Body */}
      <EditorConfig />
      <Editor
        value={code}
        onChange={handleCodeChange}
        height="100vh"
        defaultLanguage="javascript"
        defaultValue="// some comment"
        theme="cryonx-move"
        options={
          {
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: "on",
            minimap: {
              enabled: true,
            },
            glyphMargin: false,
            lineDecorationsWidth: 10,
          }
        }
      />

    </div>
  );
}