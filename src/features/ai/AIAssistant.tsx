"use client";
import React, { useState, useRef, useEffect } from "react";
import { chatWithAI, setDynamicApiKey } from "@/services/AIService";
import { encryptData, decryptData } from "@/utils/cryptoUtils";
import { toast } from "sonner";
import { AIHeader } from "./components/AIHeader";
import { SetupView } from "./components/SetupView";
import { UnlockView } from "./components/UnlockView";
import { ChatView } from "./components/ChatView";
import { SettingsOverlay } from "./components/SettingsOverlay";

interface Message {
    role: "user" | "ai";
    content: string;
}
interface AIAssistantProps {
    currentCode: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ currentCode }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            content:
                "Hello! I am CryonxAI. I can help you write, debug, and audit your Move smart contracts.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auth State
    const [isEnvKey] = useState(false);
    const [sessionPin, setSessionPin] = useState("");

    const [isConfigured, setIsConfigured] = useState(() => {
        if (typeof window !== "undefined") {
            return !!localStorage.getItem("cryonx_ai_key");
        }
        return false;
    });

    const [isLocked, setIsLocked] = useState(true);

    const [viewMode, setViewMode] = useState<
        "chat" | "setup" | "unlock" | "change-pin"
    >(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("cryonx_ai_key");
            return stored ? "unlock" : "setup";
        }
        return "setup";
    });

    const [showSettings, setShowSettings] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleUnlock = async (pin: string) => {
        setIsProcessing(true);
        try {
            const stored = localStorage.getItem("cryonx_ai_key");
            if (!stored) throw new Error("No key found");

            const key = await decryptData(stored, pin);
            setDynamicApiKey(key);
            setSessionPin(pin);
            setIsLocked(false);
            setViewMode("chat");
            toast.success("AI Assistant Unlocked");
        } catch (e) {
            toast.error("Incorrect PIN");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSetup = async (apiKey: string, pin: string) => {
        setIsProcessing(true);
        try {
            const encrypted = await encryptData(apiKey, pin);
            localStorage.setItem("cryonx_ai_key", encrypted);
            setDynamicApiKey(apiKey);
            setSessionPin(pin);
            setIsConfigured(true);
            setIsLocked(false);
            setViewMode("chat");
            toast.success("API Key Saved & Encrypted");
        } catch (e) {
            toast.error("Failed to save key");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveKey = () => {
        if (
            confirm(
                "Are you sure you want to remove your API Key? You will need to enter it again."
            )
        ) {
            localStorage.removeItem("cryonx_ai_key");
            setDynamicApiKey("");
            setIsConfigured(false);
            setIsLocked(true);
            setShowSettings(false);
            setViewMode("setup");
            toast.success("API Key Removed");
        }
    };

    const handleChangePin = async (currentPin: string, newPin: string) => {
        setIsProcessing(true);
        try {
            const stored = localStorage.getItem("cryonx_ai_key");
            if (!stored) throw new Error("No key found");

            // Verify old PIN by trying to decrypt
            const key = await decryptData(stored, currentPin);

            // Encrypt with new PIN
            const newEncrypted = await encryptData(key, newPin);
            localStorage.setItem("cryonx_ai_key", newEncrypted);

            setShowSettings(false);
            setViewMode("chat");
            toast.success("PIN Changed Successfully");
        } catch (e) {
            toast.error("Incorrect Current PIN");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg = input;
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const aiResponse = await chatWithAI(userMsg, currentCode);
            setMessages((prev) => [
                ...prev,
                { role: "ai", content: aiResponse },
            ]);
        } catch (error: any) {
            if (error.message === "INVALID_API_KEY") {
                toast.error("Invalid API Key. Please enter a valid key.");
                localStorage.removeItem("cryonx_ai_key");
                setDynamicApiKey("");
                setIsConfigured(false);
                setIsLocked(true);
                setViewMode("setup");
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "ai",
                        content:
                            "An error occurred while processing your request.",
                    },
                ]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (viewMode === "setup") {
            return (
                <SetupView
                    onSetup={handleSetup}
                    isProcessing={isProcessing}
                    defaultPin={sessionPin}
                />
            );
        }

        if (viewMode === "unlock") {
            return (
                <UnlockView
                    onUnlock={handleUnlock}
                    isProcessing={isProcessing}
                    handleRemoveKey={handleRemoveKey}
                />
            );
        }

        return (
            <ChatView
                messages={messages}
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                handleSend={handleSend}
                messagesEndRef={messagesEndRef}
            />
        );
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#0d1017] relative">
            <AIHeader
                isEnvKey={isEnvKey}
                isConfigured={isConfigured}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
            />

            {showSettings && (
                <SettingsOverlay
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onChangePin={handleChangePin}
                    handleRemoveKey={handleRemoveKey}
                />
            )}

            {renderContent()}
        </div>
    );
};

export default React.memo(AIAssistant);
