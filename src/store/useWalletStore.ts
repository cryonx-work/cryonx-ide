import { create } from 'zustand';
import {
    AccountInfo,
    NetworkInfo,
    AdapterWallet,
    AdapterNotDetectedWallet,
    AvailableWallets,
    DappConfig,
    WalletReadyState,
    InputTransactionData,
    CedraSignAndSubmitTransactionOutput,
    AnyRawTransaction,
    InputGenerateTransactionOptions,
    AccountAuthenticator,
    InputSubmitTransactionData,
    PendingTransactionResponse,
    CedraSignMessageInput,
    CedraSignMessageOutput,
    CedraSignInInput,
    CedraSignInOutput
} from "@cedra-labs/wallet-adapter-core";
import { Network } from "@cedra-labs/ts-sdk";
import { walletService } from '@/services/walletService';

export interface WalletState {
    account: AccountInfo | null;
    network: NetworkInfo | null;
    connected: boolean;
    wallet: AdapterWallet | null;
    wallets: ReadonlyArray<AdapterWallet>;
    notDetectedWallets: ReadonlyArray<AdapterNotDetectedWallet>;
    isLoading: boolean;

    setWallets: (wallets: ReadonlyArray<AdapterWallet>) => void;
    setNotDetectedWallets: (wallets: ReadonlyArray<AdapterNotDetectedWallet>) => void;
    setIsLoading: (isLoading: boolean) => void;
    setConnected: (connected: boolean) => void;
    setAccount: (account: AccountInfo | null) => void;
    setNetwork: (network: NetworkInfo | null) => void;
    setWallet: (wallet: AdapterWallet | null) => void;

    init: (optInWallets?: ReadonlyArray<AvailableWallets>, dappConfig?: DappConfig, disableTelemetry?: boolean) => void;
    autoConnect: (autoConnect?: boolean | ((core: any, adapter: AdapterWallet) => Promise<boolean>)) => Promise<void>;

    connect: (walletName: string) => Promise<void>;
    disconnect: () => Promise<void>;
    signIn: (args: { walletName: string; input: CedraSignInInput }) => Promise<CedraSignInOutput>;
    signAndSubmitTransaction: (transaction: InputTransactionData) => Promise<CedraSignAndSubmitTransactionOutput>;
    signTransaction: (args: {
        transactionOrPayload: AnyRawTransaction | InputTransactionData;
        asFeePayer?: boolean;
        options?: InputGenerateTransactionOptions & {
            expirationSecondsFromNow?: number;
            expirationTimestamp?: number;
        };
    }) => Promise<{ authenticator: AccountAuthenticator; rawTransaction: Uint8Array }>;
    submitTransaction: (transaction: InputSubmitTransactionData) => Promise<PendingTransactionResponse>;
    signMessage: (message: CedraSignMessageInput) => Promise<CedraSignMessageOutput>;
    signMessageAndVerify: (message: CedraSignMessageInput) => Promise<boolean>;
    changeNetwork: (network: Network) => Promise<any>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
    account: null,
    network: null,
    connected: false,
    wallet: null,
    wallets: [],
    notDetectedWallets: [],
    isLoading: true,

    setWallets: (wallets) => set({ wallets }),
    setNotDetectedWallets: (notDetectedWallets) => set({ notDetectedWallets }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setConnected: (connected) => set({ connected }),
    setAccount: (account) => set({ account }),
    setNetwork: (network) => set({ network }),
    setWallet: (wallet) => set({ wallet }),

    init: (optInWallets, dappConfig, disableTelemetry) => {
        walletService.init(optInWallets, dappConfig, disableTelemetry);
    },

    autoConnect: async (autoConnect = false) => {
        const state = get();
        const walletCore = walletService.getCore();

        if (!walletCore || !state.wallets.length) {
            set({ isLoading: false });
            return;
        }

        if (!autoConnect) {
            set({ isLoading: false });
            return;
        }

        const walletName = localStorage.getItem("CedraWalletName");
        if (!walletName) {
            set({ isLoading: false });
            return;
        }

        const selectedWallet = state.wallets.find((e) => e.name === walletName);
        if (!selectedWallet || selectedWallet.readyState !== WalletReadyState.Installed) {
            set({ isLoading: false });
            return;
        }

        if (!state.connected) {
            try {
                set({ isLoading: true });
                let shouldConnect = true;

                if (typeof autoConnect === "function") {
                    shouldConnect = await autoConnect(walletCore, selectedWallet);
                } else {
                    shouldConnect = autoConnect;
                }

                if (shouldConnect) {
                    await walletService.connect(walletName);
                }
            } catch (error) {

            } finally {
                set({ isLoading: false });
            }
        } else {
            set({ isLoading: false });
        }
    },

    connect: async (walletName) => {
        set({ isLoading: true });
        try {
            await walletService.connect(walletName);
        } finally {
            set({ isLoading: false });
        }
    },

    disconnect: async () => {
        await walletService.disconnect();
    },

    signIn: async (args) => {
        set({ isLoading: true });
        try {
            return await walletService.signIn(args);
        } finally {
            set({ isLoading: false });
        }
    },

    signAndSubmitTransaction: async (transaction) => {
        return await walletService.signAndSubmitTransaction(transaction);
    },

    signTransaction: async (args) => {
        return await walletService.signTransaction(args);
    },

    submitTransaction: async (transaction) => {
        return await walletService.submitTransaction(transaction);
    },

    signMessage: async (message) => {
        return await walletService.signMessage(message);
    },

    signMessageAndVerify: async (message) => {
        return await walletService.signMessageAndVerify(message);
    },

    changeNetwork: async (network) => {
        return await walletService.changeNetwork(network);
    }
}));
