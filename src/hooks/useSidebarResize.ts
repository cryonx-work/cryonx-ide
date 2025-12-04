"use client";
import { useState, useCallback } from 'react';
import { useIDE } from './useIDE';

export const useSidebarResize = (initialWidth: number = 250) => {
    const { ui } = useIDE();
    const [sidebarWidth, setSidebarWidth] = useState(initialWidth);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = useCallback(
        (mouseDownEvent: React.MouseEvent) => {
            mouseDownEvent.preventDefault();
            setIsResizing(true);

            const doDrag = (mouseMoveEvent: MouseEvent) => {
                const newWidth = mouseMoveEvent.clientX - 48;

                if (newWidth < 100) {
                    ui.setActiveView(null);
                    stopDrag();
                    return;
                }

                if (newWidth >= 160 && newWidth < 800) {
                    setSidebarWidth(newWidth);
                }
            };

            const stopDrag = () => {
                setIsResizing(false);
                document.removeEventListener("mousemove", doDrag);
                document.removeEventListener("mouseup", stopDrag);
                document.body.style.cursor = "default";
            };

            document.addEventListener("mousemove", doDrag);
            document.addEventListener("mouseup", stopDrag);
            document.body.style.cursor = "col-resize";
        },
        [ui]
    );

    return { sidebarWidth, isResizing, startResizing };
};
