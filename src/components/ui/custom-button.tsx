import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "icon";
    size?: "sm" | "md" | "lg" | "icon";
}

export const Button: React.FC<ButtonProps> = ({
    className = "",
    variant = "primary",
    size = "md",
    children,
    ...props
}) => {
    const baseStyles =
        "flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-md";

    const variants = {
        primary: "bg-cryonx-accent text-white hover:bg-cryonx-accent/90",
        secondary:
            "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10",
        ghost: "text-gray-400 hover:text-white hover:bg-white/5",
        icon: "text-gray-400 hover:text-white",
    };

    const sizes = {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base",
        icon: "p-1",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
