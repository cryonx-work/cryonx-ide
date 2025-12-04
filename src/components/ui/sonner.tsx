"use client";

import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast: "group toast group-[.toaster]:bg-cryonx-glass group-[.toaster]:text-cryonx-text group-[.toaster]:border-cryonx-glass-border group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-xl group-[.toaster]:rounded-md group-[.toaster]:border",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton:
                        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton:
                        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                },
            }}
            icons={{
                success: <CircleCheckIcon className="size-4 text-green-500" />,
                info: <InfoIcon className="size-4 text-blue-500" />,
                warning: (
                    <TriangleAlertIcon className="size-4 text-yellow-500" />
                ),
                error: <OctagonXIcon className="size-4 text-red-500" />,
                loading: (
                    <Loader2Icon className="size-4 animate-spin text-cryonx-accent" />
                ),
            }}
            {...props}
        />
    );
};

export { Toaster };
