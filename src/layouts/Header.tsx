"use client";
import React, { useState } from "react";
import { useIDE, useDebugger } from "@/hooks";
import { LogType } from "@/types";
import { cedraClient } from "@/services/cedraSDK";
import ShareModal from "@/features/collaboration/ShareModal";
import {
    HeaderLogo
} from "@/components/HeaderLogo";
import {
    HeaderActions
} from "@/components/HeaderActions";
import {
    HeaderCollab
} from "@/components/HeaderCollab";
import {
    HeaderWallet
} from "@/components/HeaderWallet";

const Header: React.FC = () => {
    const { ui, fileSystem, collab: collaboration, projects } = useIDE();
    const { startDebugging } = useDebugger();
    const [isCompiling, setIsCompiling] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [lastBytecode, setLastBytecode] = useState<string | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const activeFile = fileSystem.getActiveFile();

    const handleCompile = async () => {
        setIsCompiling(true);
        ui.setStatus("working", "Building Package...");

        const moveFiles = fileSystem.items
            .filter(
                (item) => item.type === "file" && item.name.endsWith(".move")
            )
            .map((item) => ({ name: item.name, content: item.content || "" }));

        if (moveFiles.length === 0) {
            ui.addLog(LogType.WARNING, "No .move files found to build.");
            setIsCompiling(false);
            ui.setStatus("warning", "Nothing to build");
            return;
        }

        ui.addLog(
            LogType.SYSTEM,
            `Starting Package Build (${moveFiles.length} modules)...`
        );

        try {
            const result = await cedraClient.compilePackage(moveFiles);

            result.logs.forEach((log) => ui.addLog(LogType.INFO, log));

            if (result.success && result.bytecode) {
                ui.addLog(LogType.SUCCESS, "Package Build Successful.");
                setLastBytecode(result.bytecode);
                ui.setStatus("success", "Build Successful");
            } else {
                ui.addLog(LogType.ERROR, `Build Failed: ${result.error}`);
                ui.setStatus("error", "Build Failed");
            }
        } catch (err) {
            ui.addLog(LogType.ERROR, "Unexpected compiler error.");
            ui.setStatus("error", "Compiler Error");
        } finally {
            setIsCompiling(false);
        }
    };

    const handleDeploy = async () => {
        // if (!ui.wallet.isConnected || !ui.wallet.address) {
        //     ui.addLog(
        //         LogType.WARNING,
        //         "Please connect wallet before deploying."
        //     );
        //     return;
        // }

        let bytecodeToDeploy = lastBytecode;

        if (!bytecodeToDeploy) {
            ui.addLog(
                LogType.SYSTEM,
                "No artifacts found. Triggering auto-compile..."
            );
            ui.setStatus("working", "Auto-compiling...");

            const moveFiles = fileSystem.items
                .filter(
                    (item) =>
                        item.type === "file" && item.name.endsWith(".move")
                )
                .map((item) => ({
                    name: item.name,
                    content: item.content || "",
                }));

            if (moveFiles.length === 0) return;

            setIsCompiling(true);
            const compileResult = await cedraClient.compilePackage(moveFiles);
            setIsCompiling(false);

            if (compileResult.success && compileResult.bytecode) {
                bytecodeToDeploy = compileResult.bytecode;
                compileResult.logs.forEach((l) => ui.addLog(LogType.INFO, l));
            } else {
                ui.addLog(
                    LogType.ERROR,
                    "Auto-compile failed. Deployment aborted."
                );
                ui.setStatus("error", "Auto-compile Failed");
                return;
            }
        }

        setIsDeploying(true);
        ui.setStatus("working", "Deploying to network...");
        const moduleName = activeFile
            ? activeFile.name.replace(".move", "")
            : "Module";

        // ui.addLog(
        //     LogType.SYSTEM,
        //     `Publishing '${moduleName}' to ${ui.wallet.network}...`
        // );
        // ui.addLog(LogType.INFO, `Signer: ${ui.wallet.address}`);

        // try {
        //     const receipt = await cedraClient.deployModule(
        //         ui.wallet.address,
        //         bytecodeToDeploy!
        //     );
        //     ui.addLog(LogType.SUCCESS, `Transaction Confirmed!`);
        //     ui.addLog(LogType.INFO, `Hash: ${receipt.hash}`);
        //     ui.addLog(LogType.INFO, `Gas Used: ${receipt.gasUsed}`);
        //     ui.addLog(
        //         LogType.SUCCESS,
        //         `Module deployed at block #${receipt.blockNumber}`
        //     );
        //     ui.setStatus("success", "Deployed Successfully");
        // } catch (err) {
        //     ui.addLog(LogType.ERROR, `Deployment failed: ${err}`);
        //     ui.setStatus("error", "Deployment Failed");
        // } finally {
        //     setIsDeploying(false);
        // }
    };

    return (
        <>
            <div className="h-15 bg-cryonx-bg border-b border-white/5 flex items-center justify-between px-4 select-none z-30">
                <HeaderLogo />

                <HeaderActions
                    onCompile={handleCompile}
                    isCompiling={isCompiling}
                    onDebug={startDebugging}
                    activeFile={activeFile}
                    onDeploy={handleDeploy}
                    isDeploying={isDeploying}
                    userRole={collaboration.role}
                />

                <div className="flex items-center gap-3">
                    <HeaderCollab
                        isCollabActive={collaboration.isCollabActive}
                        collaborators={collaboration.collaborators}
                        onShare={() => setShowShareModal(true)}
                    />
                    <HeaderWallet />
                </div>
            </div>

            {showShareModal && (
                <ShareModal onClose={() => setShowShareModal(false)} />
            )}
        </>
    );
};

export default Header;
