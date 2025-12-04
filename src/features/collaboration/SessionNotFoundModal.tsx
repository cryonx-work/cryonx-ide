import React from "react";
import { Unlink, Globe } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/custom-button";
import { useIDE } from "@/hooks";

const SessionNotFoundModal: React.FC = () => {
    const { collab } = useIDE();

    const handleContinue = () => {
        collab.clearSessionNotFound();
        window.location.href = "/";
    };

    const handleRejoin = () => {
        const params = new URLSearchParams(window.location.search);
        const session = params.get("session");
        window.location.href = `/join/${session}`;
    };

    return (
        <Modal
            onClose={() => {
                handleContinue();
            }}
            title="Lost Connection"
            icon={Globe}
            className="w-[400px]"
        >
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                    <Unlink size={32} />
                </div>
                <div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        You have lost connection to the collaboration session.
                        The session may have ended or the session ID is invalid.
                    </p>
                </div>
                <div className="flex justify-center space-x-4 w-full">
                    <Button
                        onClick={handleRejoin}
                        variant="primary"
                        className=""
                    >
                        Rejoin
                    </Button>
                    <Button
                        onClick={handleContinue}
                        variant="primary"
                        className=""
                    >
                        Home
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SessionNotFoundModal;
