import React from "react";
import { Link as LinkIcon, Copy, Check, Mail } from "lucide-react";

interface ShareModalInviteProps {
    shareLink: string;
    copied: boolean;
    handleCopy: () => void;
    role: "host" | "guest" | null;
    email: string;
    setEmail: (email: string) => void;
    handleSendInvite: (e: React.FormEvent) => void;
    inviteSent: boolean;
}

const ShareModalInvite: React.FC<ShareModalInviteProps> = ({
    shareLink,
    copied,
    handleCopy,
    role,
    email,
    setEmail,
    handleSendInvite,
    inviteSent,
}) => {
    return (
        <>
            {/* Link Section */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                    Share Link
                </label>
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-black/30 border border-white/10 rounded-md px-3 py-2 text-xs text-gray-300 flex items-center gap-2 truncate">
                        <LinkIcon size={12} className="text-gray-500" />
                        {shareLink}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="bg-cryonx-accent hover:bg-cryonx-accent/80 text-white p-2 rounded-md transition-colors"
                        title="Copy Link"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Email Section (Host Only) */}
            {role === "host" && (
                <form onSubmit={handleSendInvite} className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">
                        Invite via Email
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Mail
                                size={14}
                                className="absolute left-3 top-2.5 text-gray-500"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="developer@example.com"
                                className="w-full bg-black/30 border border-white/10 rounded-md pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cryonx-accent"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!email || inviteSent}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                        >
                            {inviteSent ? "Sent!" : "Invite"}
                        </button>
                    </div>
                </form>
            )}
        </>
    );
};

export default ShareModalInvite;
