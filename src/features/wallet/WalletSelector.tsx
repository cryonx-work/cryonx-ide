"use client";

import {
    CEDRA_CONNECT_ACCOUNT_URL,
    WalletSortingOptions,
    isCedraConnectWallet,
    truncateAddress,
} from "@cedra-labs/wallet-adapter-core";

import { Copy, LogOut, User, Wallet } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ConnectWalletDialog } from "./components/ConnectWalletDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useIDE } from "@/hooks";
import Image from "next/image";

export function WalletSelector(walletSortingOptions: WalletSortingOptions) {
    const { wallet } = useIDE();
    const { account, connected, disconnect, wallet: currentWallet } = wallet;
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const closeDialog = useCallback(() => setIsDialogOpen(false), []);

    const address = account?.address;
    const copyAddress = useCallback(() => {
        if (!address) return;

        const fn = async () => {
            try {
                await navigator.clipboard.writeText(address.toString());
                toast.success("Wallet address copied to clipboard.");
            } catch {
                toast.error("Failed to copy wallet address to clipboard.");
            }
        };

        fn();
    }, [address]);

    return connected ? (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-all border shadow-lg bg-cryonx-accent/10 border-cryonx-accent/50 text-cryonx-glow hover:bg-cryonx-accent/20 hover:text-cryonx-glow"
                >
                    {currentWallet && (
                        <Image
                            src={currentWallet.icon}
                            alt={currentWallet.name}
                            width={16}
                            height={16}
                        />
                    )}
                    {account?.ansName ||
                        truncateAddress(account?.address?.toString()) ||
                        "Unknown"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="bg-[#151923] border-white/10 text-cryonx-text"
            >
                <DropdownMenuItem
                    onSelect={copyAddress}
                    className="gap-2 focus:bg-white/10 focus:text-cryonx-text cursor-pointer"
                >
                    <Copy className="h-4 w-4" /> Copy address
                </DropdownMenuItem>
                {currentWallet && isCedraConnectWallet(currentWallet) && (
                    <DropdownMenuItem
                        asChild
                        className="focus:bg-white/10 focus:text-cryonx-text cursor-pointer"
                    >
                        <a
                            href={CEDRA_CONNECT_ACCOUNT_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-2"
                        >
                            <User className="h-4 w-4" /> Account
                        </a>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    onSelect={disconnect}
                    className="gap-2 focus:bg-white/10 cursor-pointer text-red-400 focus:text-red-400"
                >
                    <LogOut className="h-4 w-4" /> Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    className="flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-all border shadow-lg bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                >
                    <Wallet size={14} />
                    Connect Wallet
                </Button>
            </DialogTrigger>
            <ConnectWalletDialog
                close={closeDialog}
                {...walletSortingOptions}
            />
        </Dialog>
    );
}
