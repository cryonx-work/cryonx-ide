import React, { useState } from "react";
import { X, MessageSquare, Send, Smile, Frown, Meh } from "lucide-react";
import { useIDE } from "@/hooks";
import { LogType } from "@/types";
import { Modal } from "@/components/ui/Modal";

const FeedbackModal: React.FC = () => {
    const { ui } = useIDE();
    const [rating, setRating] = useState<"good" | "neutral" | "bad" | null>(
        null
    );
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSending(true);

        // Simulate API call
        setTimeout(() => {
            ui.addLog(
                LogType.SUCCESS,
                "Feedback sent to Cryonx Team. Thank you!"
            );
            setIsSending(false);
            ui.closeFeedback();
        }, 1500);
    };

    return (
        <Modal
            onClose={ui.closeFeedback}
            title="Send Feedback"
            icon={MessageSquare}
            className="w-[450px]"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">
                        How is your experience?
                    </label>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setRating("bad")}
                            className={`p-2 rounded-lg transition-all ${
                                rating === "bad"
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : "bg-white/5 text-gray-400 hover:text-red-400"
                            }`}
                        >
                            <Frown size={24} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setRating("neutral")}
                            className={`p-2 rounded-lg transition-all ${
                                rating === "neutral"
                                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                    : "bg-white/5 text-gray-400 hover:text-yellow-400"
                            }`}
                        >
                            <Meh size={24} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setRating("good")}
                            className={`p-2 rounded-lg transition-all ${
                                rating === "good"
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : "bg-white/5 text-gray-400 hover:text-green-400"
                            }`}
                        >
                            <Smile size={24} />
                        </button>
                    </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">
                        Comments <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-32 bg-black/30 border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-cryonx-accent resize-none placeholder-gray-600"
                        placeholder="Tell us what you like, or what we can improve..."
                        required
                    />
                </div>

                {/* Email (Optional) */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">
                        Email (Optional)
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-cryonx-accent placeholder-gray-600"
                        placeholder="To contact you about this feedback"
                    />
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={ui.closeFeedback}
                        className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!message || isSending}
                        className="bg-cryonx-accent hover:bg-cryonx-accent/80 text-white px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? (
                            "Sending..."
                        ) : (
                            <>
                                <Send size={14} /> Send Feedback
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default FeedbackModal;
