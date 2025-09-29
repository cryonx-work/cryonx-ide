import { getFileLanguage } from '@/utils/editorUtils'

interface EditorHeaderProps {
  fileName: string;
  lineCount: number;
}

export function EditorHeader({fileName, lineCount}:EditorHeaderProps){
    return (
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">{fileName}</span>
                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                {getFileLanguage(fileName)}
                </span>
            </div>
            <div className="text-xs text-gray-500">
                {lineCount} lines
            </div>
            </div>
        </div>

    );
}