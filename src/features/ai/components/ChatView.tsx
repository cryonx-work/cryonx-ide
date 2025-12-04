import React from "react";
import { Send, Loader2, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "ai";
    content: string;
}

interface ChatViewProps {
    messages: Message[];
    input: string;
    setInput: (val: string) => void;
    isLoading: boolean;
    handleSend: () => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatView: React.FC<ChatViewProps> = ({
    messages,
    input,
    setInput,
    isLoading,
    handleSend,
    messagesEndRef,
}) => {
    return (
        <>
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-2 ${
                            msg.role === "user"
                                ? "flex-row-reverse"
                                : "flex-row"
                        }`}
                    >
                        <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                                msg.role === "user"
                                    ? "bg-cryonx-accent"
                                    : "bg-cryonx-glow"
                            }`}
                        >
                            {msg.role === "user" ? (
                                <User size={12} className="text-white" />
                            ) : (
                                <Bot size={12} className="text-black" />
                            )}
                        </div>
                        <div
                            className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                                msg.role === "user"
                                    ? "bg-[#2a2139] text-gray-200 border border-cryonx-accent/30"
                                    : "bg-[#1a1d26] text-gray-300 border border-white/5"
                            }`}
                        >
                            {msg.role === "ai" ? (
                                <div className="prose prose-invert prose-xs max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            code({
                                                className,
                                                children,
                                                ...props
                                            }) {
                                                return (
                                                    <code
                                                        className={`${
                                                            className || ""
                                                        } bg-black/50 px-1 rounded text-cryonx-glow`}
                                                        {...props}
                                                    >
                                                        {children}
                                                    </code>
                                                );
                                            },
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-cryonx-glow flex items-center justify-center shrink-0 mt-1">
                            <Bot size={12} className="text-black" />
                        </div>
                        <div className="bg-[#1a1d26] rounded-lg p-3 border border-white/5 flex items-center gap-2 text-gray-400 text-xs">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Processing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-white/5 bg-[#13161f]">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Ask about your Move code..."
                        className="w-full bg-black/20 border border-white/10 rounded-md pl-3 pr-10 py-2 text-xs text-white focus:outline-none focus:border-cryonx-accent resize-none h-20"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="absolute right-2 bottom-3 p-1.5 bg-cryonx-accent hover:bg-cryonx-accent/80 text-white rounded-md disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </>
    );
};
