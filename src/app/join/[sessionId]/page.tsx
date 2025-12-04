"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, ArrowRight, Globe, Loader2, AlertTriangle } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { IDEProvider } from "@/components";
import { collabService } from "@/services/collabService";
import { Button } from "@/components/ui/custom-button";

export default function JoinSessionPage({
    params,
}: {
    params: Promise<{ sessionId: string }>;
}) {
    const { sessionId } = React.use(params);
    const [isChecking, setIsChecking] = useState(true);
    const [isValidSession, setIsValidSession] = useState(false);

    const [name, setName] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("cryonx_username") || "";
        }
        return "";
    });

    const router = useRouter();

    useEffect(() => {
        let mounted = true;
        const checkSession = async () => {
            setIsChecking(true);

            // Safety timeout in case checkSession hangs
            const safetyTimeout = new Promise<boolean>((resolve) =>
                setTimeout(() => resolve(false), 5000)
            );

            try {
                const exists = await Promise.race([
                    collabService.checkSession(sessionId),
                    safetyTimeout,
                ]);
                if (mounted) setIsValidSession(exists);
            } catch (error) {
                console.error("Failed to check session", error);
                if (mounted) setIsValidSession(false);
            } finally {
                if (mounted) setIsChecking(false);
            }
        };
        checkSession();
        return () => {
            mounted = false;
        };
    }, [sessionId]);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (typeof window !== "undefined") {
            localStorage.setItem("cryonx_username", name.trim());
        }

        // Redirect to main app with session and name
        router.push(`/?session=${sessionId}&name=${encodeURIComponent(name)}`);
    };

    const avatarPreview = name.trim() ? name.trim()[0].toUpperCase() : "?";

    if (isChecking) {
        return (
            <div className="min-h-screen w-screen bg-[#0B0E14] flex flex-col items-center justify-center text-white">
                <Loader2
                    className="animate-spin text-cryonx-accent mb-4"
                    size={48}
                />
                <p className="text-gray-400 animate-pulse">
                    Verifying session...
                </p>
            </div>
        );
    }

    if (!isValidSession) {
        return (
            <div className="min-h-screen w-screen bg-[#0B0E14] flex flex-col items-center justify-center text-white p-4">
                <div className="w-full max-w-md bg-[#151923] border border-white/10 rounded-xl shadow-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <AlertTriangle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">
                        Session Not Found
                    </h1>
                    <p className="text-gray-400 mb-8">
                        The session you are trying to join does not exist or has
                        been ended by the host.
                    </p>
                    <Button onClick={() => router.push("/")} className="w-full">
                        Return to Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <IDEProvider>
            <div className="relative min-h-screen w-screen overflow-hidden">
                {/* Background IDE */}
                <div className="absolute inset-0 z-0 pointer-events-none filter blur-[2px] opacity-50">
                    <MainLayout />
                </div>

                {/* Overlay & Modal */}
                <div className="absolute inset-0 z-10 bg-cryonx-bg/50 flex items-center justify-center text-white p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#151923] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-6 border-b border-white/5 bg-[#1a1e29] flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-cryonx-accent/20 rounded-full flex items-center justify-center mb-4 text-cryonx-accent">
                                <Globe size={24} />
                            </div>
                            <h1 className="text-xl font-bold text-white tracking-wide mb-1">
                                Join Collaboration
                            </h1>
                            <p className="text-sm text-gray-400">
                                You are joining session{" "}
                                <span className="text-white font-mono bg-white/10 px-1 rounded">
                                    {sessionId}
                                </span>
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleJoin} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase block">
                                    Display Name
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="Enter your name..."
                                        className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cryonx-accent transition-colors"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg">
                                    {avatarPreview}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">
                                        Preview
                                    </p>
                                    <p className="text-sm font-medium text-white">
                                        {name || "Guest"}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!name.trim()}
                                className="w-full bg-cryonx-accent hover:bg-cryonx-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                <span>Join Session</span>
                                <ArrowRight size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </IDEProvider>
    );
}
