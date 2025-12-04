import { useEffect, RefObject, useRef } from 'react';
import { FileSystemItem } from '@/types';
import { collabService } from '@/services/collabService';
import { useIDE } from '@/hooks';

export const useMonacoCursor = (
    editorRef: RefObject<any>,
    file: FileSystemItem | null,
    fileSystem: any
) => {
    const prevFileIdRef = useRef<string | null>(null);
    const { collab } = useIDE();
    const isCollabActive = collab.isCollabActive;

    useEffect(() => {
        if (editorRef.current && file) {
            if (prevFileIdRef.current !== file.id) {
                const savedPos = fileSystem.cursorPositions[file.id];
                if (savedPos) {
                    editorRef.current.setPosition(savedPos);
                    editorRef.current.revealPositionInCenter(savedPos);
                }
                prevFileIdRef.current = file.id;
            }
        }
    }, [file, fileSystem.cursorPositions]);

    const handleCursorChange = (e: any) => {
        if (file) {
            fileSystem.updateCursorPosition(file.id, {
                lineNumber: e.position.lineNumber,
                column: e.position.column,
            });

            // Update awareness if collab is active
            if (isCollabActive && collabService.awareness) {
                const localState = collabService.awareness.getLocalState();
                if (localState && localState.user) {
                    collabService.awareness.setLocalStateField('user', {
                        ...localState.user,
                        cursor: {
                            lineNumber: e.position.lineNumber,
                            column: e.position.column,
                        }
                    });
                }
            }
        }
    };

    return { handleCursorChange };
};
