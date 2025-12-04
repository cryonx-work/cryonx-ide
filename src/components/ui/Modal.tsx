import React from "react";
import { X } from "lucide-react";

interface ModalProps {
    onClose: () => void;
    title: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({
    onClose,
    title,
    icon: Icon,
    children,
    className = "",
}) => {
    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div
                className={`bg-[#151923] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#1a1e29]">
                    <div className="flex items-center gap-2">
                        {Icon && (
                            <Icon className="text-cryonx-accent" size={18} />
                        )}
                        <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};
