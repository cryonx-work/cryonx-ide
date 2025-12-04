import { useEffect, useRef } from 'react';
import { FileSystemItem } from '@/types';
import { MonacoBinding } from 'y-monaco';
import { collabService } from '@/services';

export const useMonacoCollab = (
    editor: any,
    monaco: any,
    collaboration: any,
    file: FileSystemItem | null,
) => {
    const bindingRef = useRef<MonacoBinding | null>(null);

    useEffect(() => {
        if (
            !editor ||
            !monaco ||
            !collaboration.isCollabActive ||
            !file ||
            !collabService.isConnected()
        ) {
            if (bindingRef.current) {
                bindingRef.current.destroy();
                bindingRef.current = null;
            }
            return;
        }

        const model = editor.getModel();

        if (!model) return;

        // Get the Y.Text for this file
        const yText = collabService.getFileContent(file.id);

        const createBinding = () => {
            if (!bindingRef.current) {
                console.log('[useMonacoCollab] Creating binding for file:', file.id);

                // If Host and yText is empty, initialize it with current model content
                // This prevents MonacoBinding from clearing the editor content
                if (collaboration.role === 'host' && yText.length === 0) {
                    const content = model.getValue();
                    if (content) {
                        yText.insert(0, content);
                    }
                }

                try {
                    bindingRef.current = new MonacoBinding(
                        yText,
                        model,
                        new Set([editor]),
                        collabService.awareness
                    );
                    console.log('[useMonacoCollab] Binding created successfully');
                } catch (err) {
                    console.error('[useMonacoCollab] Failed to create binding:', err);
                }
            }
        };

        // If we are a guest, wait for sync before binding to avoid overwriting host content
        // WebrtcProvider doesn't expose 'synced' property directly on type, but it emits 'synced' event
        if (collaboration.role === 'guest' && collabService.provider) {
            const onSync = (event: { synced: boolean }) => {
                if (event.synced) {
                    console.log('[useMonacoCollab] Provider synced, creating binding');
                    createBinding();
                }
            };
            collabService.provider.on('synced', onSync);

            // Check if already synced OR if we have content already (which implies sync happened or we can start)
            // Also add a timeout to force binding if sync event is missed
            const isSynced = (collabService.provider as any).synced;
            const hasContent = yText.toString().length > 0;

            if (isSynced || hasContent) {
                console.log(`[useMonacoCollab] Ready to bind (synced: ${isSynced}, hasContent: ${hasContent})`);
                createBinding();
            } else {
                console.log('[useMonacoCollab] Waiting for sync...');
            }

            // Fallback timeout to ensure binding happens eventually
            const timeoutId = setTimeout(() => {
                if (!bindingRef.current) {
                    console.warn('[useMonacoCollab] Sync timeout, forcing binding');
                    createBinding();
                }
            }, 1000);

            // Cleanup listener if component unmounts or deps change
            return () => {
                clearTimeout(timeoutId);
                collabService.provider?.off('synced', onSync);
                if (bindingRef.current) {
                    bindingRef.current.destroy();
                    bindingRef.current = null;
                }
            };
        } else {
            // For Host, we can bind immediately, but we need to ensure yText is populated
            // The check inside createBinding handles the population if empty.
            createBinding();
        }

        return () => {
            if (bindingRef.current) {
                bindingRef.current.destroy();
                bindingRef.current = null;
            }
        };
    }, [collaboration.isCollabActive, collaboration.role, file?.id, editor, monaco]);

    // Update awareness with current file ID
    useEffect(() => {
        if (!collaboration.isCollabActive || !file || !collabService.awareness) return;

        // Debounce the update to avoid rapid firing during render cycles
        const timeoutId = setTimeout(() => {
            const localState = collabService.awareness.getLocalState();

            // Ensure user object exists
            if (!localState || !localState.user) {
                console.warn('[useMonacoCollab] Local user state missing, re-initializing');
                collabService.awareness.setLocalStateField('user', {
                    name: collaboration.userName || 'Anonymous',
                    color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
                    id: collaboration.sessionId || 'unknown',
                    isHost: collaboration.role === 'host',
                    fileId: file.id
                });
            } else if (localState.user.fileId !== file.id) {
                console.log('[useMonacoCollab] Updating awareness fileId:', file.id);
                collabService.awareness.setLocalStateField('user', {
                    ...localState.user,
                    fileId: file.id
                });
            }
        }, 100);

        return () => clearTimeout(timeoutId);

    }, [file?.id, collaboration.isCollabActive, collaboration.userName, collaboration.role]);

    // Dynamic Cursor Styles
    useEffect(() => {
        if (!collaboration.isCollabActive || !collabService.awareness) return;

        const styleId = 'y-monaco-cursor-styles';
        let styleSheet = document.getElementById(styleId) as HTMLStyleElement;
        if (!styleSheet) {
            styleSheet = document.createElement('style');
            styleSheet.id = styleId;
            document.head.appendChild(styleSheet);
        }

        const updateCursorStyles = () => {
            if (!collabService.awareness) return;
            const states = collabService.awareness.getStates();
            let css = '';

            states.forEach((state: any, clientId: number) => {
                if (state.user && state.user.color) {
                    const { color, name } = state.user;

                    // Helper to convert hex to rgba
                    const hexToRgba = (hex: string, alpha: number) => {
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    };

                    const selectionColor = hexToRgba(color, 0.3);

                    // We target the specific client classes generated by y-monaco
                    css += `
                        .yRemoteSelection-${clientId} {
                            background-color: ${selectionColor};
                        }
                        .yRemoteSelectionHead-${clientId} {
                            border-color: ${color};
                        }
                        .yRemoteSelectionHead-${clientId}::after {
                            content: "${name}";
                            background-color: ${color};
                            color: white;
                        }
                    `;
                }
            });

            styleSheet.innerHTML = css;
        };

        collabService.awareness.on('change', updateCursorStyles);
        updateCursorStyles(); // Initial run

        return () => {
            if (collabService.awareness) {
                collabService.awareness.off('change', updateCursorStyles);
            }
        };
    }, [collaboration.isCollabActive]);
};
