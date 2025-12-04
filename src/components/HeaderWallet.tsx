"use client";
import React from "react";
import { ChevronDown } from "lucide-react";
import { WalletSelector } from "@/features/wallet/WalletSelector";
import { useIDE } from "@/hooks";
import { Network } from "@cedra-labs/ts-sdk";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const HeaderWallet: React.FC = () => {
    const { wallet } = useIDE();
    const { network, changeNetwork, connected } = wallet;

    return (
        <div className="flex items-center gap-3">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5
                    ${
                        !connected
                            ? "  hover:bg-white/10 border border-white/5 transition-colors outline-none"
                            : " border border-cryonx-accent/50 hover:bg-cryonx-selection/40"
                    }`}
                    >
                        <div
                            className={`w-2 h-2 rounded-full ${
                                connected
                                    ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                                    : "bg-red-500/50"
                            }`}
                        />
                        <span className="text-xs text-gray-400 font-medium">
                            {connected
                                ? network?.name.toLocaleUpperCase() ||
                                  "Unknown Network"
                                : "Not Connected"}
                        </span>
                        {connected && (
                            <ChevronDown
                                size={12}
                                className="text-gray-600 ml-1"
                            />
                        )}
                    </button>
                </DropdownMenuTrigger>
                {connected && (
                    <DropdownMenuContent
                        align="end"
                        className="bg-[#151923] border-cryonx-accent/50 text-cryonx-text"
                    >
                        <DropdownMenuItem
                            className="focus:bg-cryonx-glow/80 focus:text-cryonx-text cursor-pointer"
                            onClick={() => changeNetwork(Network.MAINNET)}
                        >
                            {Network.MAINNET.toLocaleUpperCase()}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="focus:bg-cryonx-glow/80 focus:text-cryonx-text cursor-pointer"
                            onClick={() => changeNetwork(Network.TESTNET)}
                        >
                            {Network.TESTNET.toLocaleUpperCase()}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="focus:bg-cryonx-glow/80 focus:text-cryonx-text cursor-pointer"
                            onClick={() => changeNetwork(Network.DEVNET)}
                        >
                            {Network.DEVNET.toLocaleUpperCase()}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="focus:bg-cryonx-glow/80 focus:text-cryonx-text cursor-pointer"
                            onClick={() => changeNetwork(Network.LOCAL)}
                        >
                            {Network.LOCAL.toLocaleUpperCase()}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                )}
            </DropdownMenu>

            <WalletSelector />
        </div>
    );
};
