import React, { useState } from "react";
import { Globe } from "lucide-react";
import { collabService } from "@/services";
import { Modal } from "@/components/ui/Modal";

import ShareModalOnboarding from "./components/ShareModalOnboarding";
import ShareModalSessionInfo from "./components/ShareModalSessionInfo";
import ShareModalUserProfile from "./components/ShareModalUserProfile";
import ShareModalInvite from "./components/ShareModalInvite";
import ShareModalUserList from "./components/ShareModalUserList";
import ShareModalEmptyState from "./components/ShareModalEmptyState";
import ShareModalRequire from "./components/ShareModalRequire";
import { useIDE } from "@/hooks/useIDE";

interface ShareModalProps {
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
    const { collab: collaboration, ui, projects } = useIDE();

    const activeProject = projects.activeProject;
    const [email, setEmail] = useState("");
    const [copied, setCopied] = useState(false);
    const [inviteSent, setInviteSent] = useState(false);

    const [hostName, setHostName] = useState(() => {
        if (typeof window !== "undefined") {
            return (
                collaboration.userName ||
                localStorage.getItem("cryonx_username") ||
                ""
            );
        }
        return collaboration.userName || "";
    });

    // Generate session ID only once
    const [sessionId] = React.useState(
        () => collaboration.sessionId || collabService.createSession().sessionId
    );

    const shareLink = `${window.location.origin}/join/${sessionId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        // Mock sending email
        setInviteSent(true);
        setTimeout(() => {
            setInviteSent(false);
            setEmail("");
            ui.addLog("INFO" as any, `Invitation sent to ${email}`);
        }, 2000);
    };

    const handleOpenProjectManager = () => {
        ui.setProjectManagerView("list");
        ui.setIsProjectManagerOpen(true);
    };

    const toggleSession = () => {
        if (collaboration.isCollabActive) {
            if (collaboration.role === "guest") {
                collaboration.leaveSession();
                window.location.href = "/"; // Reload to root
            } else {
                collaboration.endSession();
                setTimeout(() => {
                    onClose();
                }, 200);
            }
        } else {
            if (!hostName.trim()) {
                alert("Please enter your name to start session");
                return;
            }
            collaboration.startSession(sessionId, hostName);
        }
    };

    const handleRename = () => {
        if (!hostName.trim()) return;
        collabService.updateUser({ name: hostName });
        collaboration.setUserName(hostName);
        ui.addLog("INFO" as any, `Renamed to ${hostName}`);
    };

    const handleOnboardingContinue = () => {
        if (hostName.trim()) {
            collaboration.setUserName(hostName.trim());
        }
    };

    const hostUser = collaboration.collaborators.find((c) => c.isHost);
    const displayHostName =
        collaboration.sessionHostName || hostUser?.name || "Unknown";

    return (
        <Modal
            onClose={onClose}
            title="Share Project"
            icon={Globe}
            className="w-[500px]"
        >
            <div className="space-y-6">
                {!collaboration.userName ? (
                    <ShareModalOnboarding
                        hostName={hostName}
                        setHostName={setHostName}
                        onContinue={handleOnboardingContinue}
                    />
                ) : !collaboration.isCollabActive && !activeProject ? (
                    <ShareModalRequire
                        onClose={onClose}
                        onOpenProjectManagerView={handleOpenProjectManager}
                    />
                ) : (
                    <>
                        <ShareModalSessionInfo
                            role={collaboration.role}
                            isCollabActive={collaboration.isCollabActive}
                            displayHostName={displayHostName}
                            toggleSession={toggleSession}
                        />

                        {collaboration.isCollabActive ? (
                            <>
                                <ShareModalUserProfile
                                    userName={collaboration.userName}
                                    hostName={hostName}
                                    setHostName={setHostName}
                                    handleRename={handleRename}
                                />

                                <ShareModalInvite
                                    shareLink={shareLink}
                                    copied={copied}
                                    handleCopy={handleCopy}
                                    role={collaboration.role}
                                    email={email}
                                    setEmail={setEmail}
                                    handleSendInvite={handleSendInvite}
                                    inviteSent={inviteSent}
                                />

                                <ShareModalUserList
                                    collaborators={collaboration.collaborators}
                                    userName={collaboration.userName}
                                />
                            </>
                        ) : (
                            <ShareModalEmptyState />
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
};

export default ShareModal;
