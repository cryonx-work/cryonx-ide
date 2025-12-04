import {
    WalletCore,
    AvailableWallets,
    DappConfig,
    AdapterWallet,
    AdapterNotDetectedWallet,
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
import { useWalletStore } from "@/store/useWalletStore";

class WalletService {
    private core: WalletCore | null = null;
    private isInitialized = false;

    getCore(): WalletCore | null {
        return this.core;
    }

    init(optInWallets?: ReadonlyArray<AvailableWallets>, dappConfig?: DappConfig, disableTelemetry?: boolean) {
        if (this.isInitialized) return;

        this.core = new WalletCore(optInWallets, dappConfig, disableTelemetry);
        this.isInitialized = true;

        // Sync initial state
        useWalletStore.getState().setWallets(this.core.wallets);
        useWalletStore.getState().setNotDetectedWallets(this.core.notDetectedWallets);

        // Bind events
        this.core.on("connect", this.handleConnect);
        this.core.on("disconnect", this.handleDisconnect);
        this.core.on("accountChange", this.handleAccountChange);
        this.core.on("networkChange", this.handleNetworkChange);
        this.core.on("standardWalletsAdded", this.handleStandardWalletsAdded);
        this.core.on("standardNotDetectedWalletAdded", this.handleStandardNotDetectedWalletsAdded);
    }

    async connect(walletName: string): Promise<void> {
        if (!this.core) throw new Error("WalletCore not initialized");
        await this.core.connect(walletName);
    }

    async disconnect(): Promise<void> {
        if (!this.core) throw new Error("WalletCore not initialized");
        await this.core.disconnect();
    }

    async signIn(args: { walletName: string; input: CedraSignInInput }): Promise<CedraSignInOutput> {
        if (!this.core) throw new Error("WalletCore not initialized");
        return await this.core.signIn(args);
    }

    async signAndSubmitTransaction(transaction: InputTransactionData): Promise<CedraSignAndSubmitTransactionOutput> {
        if (!this.core) throw new Error("WalletCore not initialized");
        return await this.core.signAndSubmitTransaction(transaction);
    }

    async signTransaction(args: {
        transactionOrPayload: AnyRawTransaction | InputTransactionData;
        asFeePayer?: boolean;
        options?: InputGenerateTransactionOptions & {
            expirationSecondsFromNow?: number;
            expirationTimestamp?: number;
        };
    }): Promise<{ authenticator: AccountAuthenticator; rawTransaction: Uint8Array }> {
        if (!this.core) throw new Error("WalletCore not initialized");
        return await this.core.signTransaction(args);
    }

    async submitTransaction(transaction: InputSubmitTransactionData): Promise<PendingTransactionResponse> {
        if (!this.core) throw new Error("WalletCore not initialized");
        return await this.core.submitTransaction(transaction);
    }

    async signMessage(message: CedraSignMessageInput): Promise<CedraSignMessageOutput> {
        if (!this.core) throw new Error("WalletCore not initialized");
        return await this.core.signMessage(message);
    }

    async signMessageAndVerify(message: CedraSignMessageInput): Promise<boolean> {
        if (!this.core) throw new Error("WalletCore not initialized");
        return await this.core.signMessageAndVerify(message);
    }

    async changeNetwork(network: Network): Promise<any> {
        if (!this.core) throw new Error("WalletCore not initialized");
        return await this.core.changeNetwork(network);
    }

    // Event Handlers
    private handleConnect = () => {
        if (!this.core) return;
        useWalletStore.setState({
            connected: true,
            account: this.core.account || null,
            network: this.core.network || null,
            wallet: this.core.wallet || null,
        });
    };

    private handleDisconnect = () => {
        useWalletStore.setState({
            connected: false,
            account: null,
            network: null,
            wallet: null,
        });
    };

    private handleAccountChange = () => {
        if (!this.core) return;
        useWalletStore.setState({ account: this.core.account || null });
    };

    private handleNetworkChange = () => {
        if (!this.core) return;
        useWalletStore.setState({ network: this.core.network || null });
    };

    private handleStandardWalletsAdded = (wallet: AdapterWallet) => {
        const currentWallets = useWalletStore.getState().wallets;
        const existingIndex = currentWallets.findIndex(w => w.name === wallet.name);

        let newWallets;
        if (existingIndex !== -1) {
            newWallets = [...currentWallets];
            newWallets[existingIndex] = wallet;
        } else {
            newWallets = [...currentWallets, wallet];
        }
        useWalletStore.setState({ wallets: newWallets });
    };

    private handleStandardNotDetectedWalletsAdded = (wallet: AdapterNotDetectedWallet) => {
        const currentWallets = useWalletStore.getState().notDetectedWallets;
        const existingIndex = currentWallets.findIndex(w => w.name === wallet.name);

        let newWallets;
        if (existingIndex !== -1) {
            newWallets = [...currentWallets];
            newWallets[existingIndex] = wallet;
        } else {
            newWallets = [...currentWallets, wallet];
        }
        useWalletStore.setState({ notDetectedWallets: newWallets });
    };

    getWallets() {
        return this.core?.wallets || [];
    }
}

export const walletService = new WalletService();
