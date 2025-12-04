"use client";

import {
    WalletSortingOptions,
    groupAndSortWallets,
    isInstallRequired,
    AdapterWallet,
    AdapterNotDetectedWallet,
} from "@cedra-labs/wallet-adapter-core";
import {
    AboutCedraConnect,
    AboutCedraConnectEducationScreen,
} from "./AboutCedraConnect";
import { CedraPrivacyPolicy } from "./CedraPrivacyPolicy";
import { WalletItem } from "./WalletItem";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useIDE } from "@/hooks";

interface ConnectWalletDialogProps extends WalletSortingOptions {
    close: () => void;
}

export function ConnectWalletDialog({
    close,
    ...walletSortingOptions
}: ConnectWalletDialogProps) {
    const { wallets = [], notDetectedWallets = [] } = useIDE().wallet;

    const { cedraConnectWallets, availableWallets, installableWallets } =
        groupAndSortWallets(
            [...wallets, ...notDetectedWallets],
            walletSortingOptions
        );

    const hasCedraConnectWallets = !!cedraConnectWallets.length;
    const [isMoreWalletsOpen, setIsMoreWalletsOpen] = useState(false);
    const [autoConnect, setAutoConnect] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("walletAutoConnect");
        if (stored === "true") {
            setTimeout(() => setAutoConnect(true), 0);
        }
    }, []);

    const handleAutoConnectChange = (checked: boolean) => {
        setAutoConnect(checked);
        localStorage.setItem("walletAutoConnect", String(checked));
    };

    return (
        <DialogContent className="max-h-screen overflow-auto bg-[#151923] border-white/10 text-cryonx-text">
            <AboutCedraConnect renderEducationScreen={renderEducationScreen}>
                <DialogHeader>
                    <DialogTitle className="flex flex-col text-center leading-snug text-cryonx-text">
                        {hasCedraConnectWallets ? (
                            <>
                                <span>Log in or sign up</span>
                                <span>with Social + Cedra Connect</span>
                            </>
                        ) : (
                            "Connect Wallet"
                        )}
                    </DialogTitle>
                </DialogHeader>

                {hasCedraConnectWallets && (
                    <div className="flex flex-col gap-2 pt-3">
                        {cedraConnectWallets.map((wallet: AdapterWallet) => (
                            <CedraConnectWalletRow
                                key={wallet.name}
                                wallet={wallet}
                                onConnect={close}
                            />
                        ))}
                        <p className="flex gap-1 justify-center items-center text-white text-sm">
                            Learn more about{" "}
                            <AboutCedraConnect.Trigger className="flex gap-1 py-3 items-center text-muted-foreground hover:text-cryonx-accent">
                                Cedra Connect <ArrowRight size={16} />
                            </AboutCedraConnect.Trigger>
                        </p>
                        <CedraPrivacyPolicy className="flex flex-col items-center py-1 text-white">
                            <p className="text-xs leading-5">
                                <CedraPrivacyPolicy.Disclaimer />{" "}
                                <CedraPrivacyPolicy.Link className="text-muted-foreground hover:text-cryonx-accent underline underline-offset-4" />
                                <span className="text-muted-foreground">.</span>
                            </p>
                            <CedraPrivacyPolicy.PoweredBy className="flex gap-1.5 items-center text-xs leading-5 text-muted-foreground hover:text-cryonx-accent" />
                        </CedraPrivacyPolicy>
                        <div className="flex items-center gap-3 pt-4 text-white">
                            <div className="h-px w-full bg-secondary" />
                            Or
                            <div className="h-px w-full bg-secondary" />
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-3 pt-3">
                    {availableWallets.map((wallet: AdapterWallet) => (
                        <WalletRow
                            key={wallet.name}
                            wallet={wallet}
                            onConnect={close}
                        />
                    ))}
                    {!!installableWallets.length && (
                        <Collapsible
                            className="flex flex-col gap-3"
                            open={isMoreWalletsOpen}
                            onOpenChange={setIsMoreWalletsOpen}
                        >
                            <CollapsibleTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="gap-2 text-cryonx-text hover:text-white hover:bg-white/10"
                                >
                                    More wallets{" "}
                                    {isMoreWalletsOpen ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="flex flex-col gap-3">
                                {installableWallets.map((wallet) => (
                                    <WalletRow
                                        key={wallet.name}
                                        wallet={wallet}
                                        onConnect={close}
                                    />
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    )}
                    <div className="flex items-center justify-between px-2 pt-2 border-t border-white/10">
                        <span className="text-sm text-muted-foreground">
                            Auto-connect
                        </span>
                        <Switch
                            checked={autoConnect}
                            onCheckedChange={handleAutoConnectChange}
                        />
                    </div>
                </div>
            </AboutCedraConnect>
        </DialogContent>
    );
}

interface WalletRowProps {
    wallet: AdapterWallet | AdapterNotDetectedWallet;
    onConnect?: () => void;
}

function WalletRow({ wallet, onConnect }: WalletRowProps) {
    return (
        <WalletItem
            wallet={wallet}
            onConnect={onConnect}
            className="flex items-center justify-between px-4 py-3 gap-4 border border-cryonx-accent rounded-md hover:bg-cryonx-accent/10 transition-colors"
        >
            <div className="flex items-center gap-4">
                <WalletItem.Icon className="h-6 w-6" />
                <WalletItem.Name className="text-base font-normal text-cryonx-text" />
            </div>
            {isInstallRequired(wallet) ? (
                <Button
                    size="sm"
                    variant="ghost"
                    asChild
                    className="text-cryonx-text hover:text-white hover:bg-cryonx-selection/90"
                >
                    <WalletItem.InstallLink />
                </Button>
            ) : (
                <WalletItem.ConnectButton asChild>
                    <Button
                        size="sm"
                        className="bg-cryonx-primary hover:bg-cryonx-selection/90 text-white"
                    >
                        Connect
                    </Button>
                </WalletItem.ConnectButton>
            )}
        </WalletItem>
    );
}

function CedraConnectWalletRow({ wallet, onConnect }: WalletRowProps) {
    return (
        <WalletItem wallet={wallet} onConnect={onConnect}>
            <WalletItem.ConnectButton asChild>
                <Button
                    size="lg"
                    className="w-full border border-cryonx-accent rounded-md gap-4 bg-cryonx-glow hover:bg-cryonx-selection/90 text-white hover:text-white"
                >
                    <WalletItem.Icon className="h-5 w-5" />
                    <WalletItem.Name className="text-base font-normal" />
                </Button>
            </WalletItem.ConnectButton>
        </WalletItem>
    );
}

function renderEducationScreen(screen: AboutCedraConnectEducationScreen) {
    return (
        <>
            <DialogHeader className="grid grid-cols-[1fr_4fr_1fr] items-center space-y-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={screen.cancel}
                    className="hover:bg-cryonx-selection/90 hover:text-cryonx-accent text-cryonx-text"
                >
                    <ArrowLeft />
                </Button>
                <DialogTitle className="leading-snug text-base text-center text-white">
                    About Cedra Connect
                </DialogTitle>
            </DialogHeader>

            <div className="flex h-[162px] pb-3 items-end justify-center">
                <screen.Graphic />
            </div>
            <div className="flex flex-col gap-2 text-center pb-4">
                <screen.Title className="text-xl text-cryonx-text" />
                <screen.Description className="text-sm text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a]:text-cryonx-text" />
            </div>

            <div className="grid grid-cols-3 items-center">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={screen.back}
                    className="justify-self-start hover:bg-cryonx-selection/90 hover:text-cryonx-accent text-cryonx-text"
                >
                    Back
                </Button>
                <div className="flex items-center gap-2 place-self-center">
                    {screen.screenIndicators.map((ScreenIndicator, i) => (
                        <ScreenIndicator key={i} className="py-4">
                            <div className="h-0.5 w-6 transition-colors bg-muted [[data-active]>&]:bg-cryonx-accent" />
                        </ScreenIndicator>
                    ))}
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={screen.next}
                    className="gap-2 justify-self-end hover:bg-cryonx-selection/90 hover:text-cryonx-accent text-cryonx-text"
                >
                    {screen.screenIndex === screen.totalScreens - 1
                        ? "Finish"
                        : "Next"}
                    <ArrowRight size={16} />
                </Button>
            </div>
        </>
    );
}
