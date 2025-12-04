"use client";

import { useEffect, useRef } from "react";
import { useWalletStore } from "@/store/useWalletStore";
import { AvailableWallets, DappConfig } from "@cedra-labs/wallet-adapter-core";

interface WalletInitializerProps {
    optInWallets?: ReadonlyArray<AvailableWallets>;
    dappConfig?: DappConfig;
    disableTelemetry?: boolean;
    autoConnect?: boolean;
}

export function WalletInitializer({
    optInWallets,
    dappConfig,
    disableTelemetry,
    autoConnect = false,
}: WalletInitializerProps) {
    const init = useWalletStore((state) => state.init);
    const performAutoConnect = useWalletStore((state) => state.autoConnect);
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            init(optInWallets, dappConfig, disableTelemetry);
            if (autoConnect) {
                performAutoConnect(false);
            }
            initialized.current = true;
        }
    }, [
        init,
        performAutoConnect,
        optInWallets,
        dappConfig,
        disableTelemetry,
        autoConnect,
    ]);

    return null;
}
